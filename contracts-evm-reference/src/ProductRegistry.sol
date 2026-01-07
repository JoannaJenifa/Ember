// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {IProductRegistry} from "./interfaces/IProductRegistry.sol";
import {ISellerRegistry} from "./interfaces/ISellerRegistry.sol";

/// @title ProductRegistry
/// @notice On-chain registry for products listed by verified sellers
/// @dev Products are linked to sellers via sellerId
contract ProductRegistry is IProductRegistry, Ownable {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    ISellerRegistry public immutable _sellerRegistry;
    uint256 private _nextProductId;

    mapping(uint256 => Product) private _products;
    mapping(uint256 => uint256[]) private _sellerProducts; // sellerId => productIds

    // Authorized contracts that can record sales (OrderEscrow)
    mapping(address => bool) public authorizedCallers;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address sellerRegistry_, address owner_) Ownable(owner_) {
        _sellerRegistry = ISellerRegistry(sellerRegistry_);
        _nextProductId = 1; // Start from 1, 0 means not found
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IProductRegistry
    function createProduct(
        string calldata title,
        string calldata category,
        uint256 priceVery,
        uint256 inventory,
        string calldata metadataURI
    ) external returns (uint256 productId) {
        uint256 sellerId = _sellerRegistry.getSellerIdByWallet(msg.sender);
        if (sellerId == 0) revert InvalidSellerId();
        if (bytes(title).length == 0) revert EmptyTitle();
        if (priceVery == 0) revert InvalidPrice();

        productId = _nextProductId++;
        _products[productId] = Product({
            sellerId: sellerId,
            title: title,
            category: category,
            priceVery: priceVery,
            inventory: inventory,
            metadataURI: metadataURI,
            isActive: true,
            createdAt: block.timestamp,
            totalSold: 0
        });

        _sellerProducts[sellerId].push(productId);

        emit ProductCreated(productId, sellerId, title, priceVery);
    }

    /// @inheritdoc IProductRegistry
    function updateProduct(uint256 productId, string calldata metadataURI) external {
        _validateProductOwner(productId);
        _products[productId].metadataURI = metadataURI;
        emit ProductUpdated(productId, metadataURI);
    }

    /// @inheritdoc IProductRegistry
    function updatePrice(uint256 productId, uint256 newPrice) external {
        _validateProductOwner(productId);
        if (newPrice == 0) revert InvalidPrice();

        uint256 oldPrice = _products[productId].priceVery;
        _products[productId].priceVery = newPrice;

        emit ProductPriceUpdated(productId, oldPrice, newPrice);
    }

    /// @inheritdoc IProductRegistry
    function updateInventory(uint256 productId, uint256 newInventory) external {
        _validateProductOwner(productId);
        _products[productId].inventory = newInventory;
        emit ProductInventoryUpdated(productId, newInventory);
    }

    /// @inheritdoc IProductRegistry
    function deactivateProduct(uint256 productId) external {
        _validateProductOwner(productId);
        _products[productId].isActive = false;
        emit ProductDeactivated(productId);
    }

    /// @inheritdoc IProductRegistry
    function reactivateProduct(uint256 productId) external {
        _validateProductOwner(productId);
        _products[productId].isActive = true;
        emit ProductReactivated(productId);
    }

    /// @inheritdoc IProductRegistry
    function recordSale(uint256 productId, uint256 quantity) external {
        if (!authorizedCallers[msg.sender]) revert NotSellerRegistry();
        if (productId == 0 || productId >= _nextProductId) revert ProductNotFound();

        Product storage product = _products[productId];
        if (product.inventory < quantity) revert InsufficientInventory();

        product.inventory -= quantity;
        product.totalSold += quantity;

        emit ProductSold(productId, quantity);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
    }

    /// @notice Admin function to update a product's metadata
    /// @dev Only owner can call this. Used for fixing product metadata.
    function adminUpdateProduct(uint256 productId, string calldata metadataURI) external onlyOwner {
        if (productId == 0 || productId >= _nextProductId) revert ProductNotFound();
        _products[productId].metadataURI = metadataURI;
        emit ProductUpdated(productId, metadataURI);
    }

    /// @notice Admin function to create a product on behalf of a seller
    /// @dev Only owner can call this. Used for bulk product creation.
    function adminCreateProduct(
        uint256 sellerId,
        string calldata title,
        string calldata category,
        uint256 priceVery,
        uint256 inventory,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 productId) {
        if (sellerId == 0) revert InvalidSellerId();
        if (bytes(title).length == 0) revert EmptyTitle();
        if (priceVery == 0) revert InvalidPrice();

        productId = _nextProductId++;
        _products[productId] = Product({
            sellerId: sellerId,
            title: title,
            category: category,
            priceVery: priceVery,
            inventory: inventory,
            metadataURI: metadataURI,
            isActive: true,
            createdAt: block.timestamp,
            totalSold: 0
        });

        _sellerProducts[sellerId].push(productId);

        emit ProductCreated(productId, sellerId, title, priceVery);
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IProductRegistry
    function getProduct(uint256 productId) external view returns (Product memory) {
        if (productId == 0 || productId >= _nextProductId) revert ProductNotFound();
        return _products[productId];
    }

    /// @inheritdoc IProductRegistry
    function getProductsBySeller(uint256 sellerId) external view returns (uint256[] memory) {
        return _sellerProducts[sellerId];
    }

    /// @inheritdoc IProductRegistry
    function totalProducts() external view returns (uint256) {
        return _nextProductId - 1;
    }

    /// @inheritdoc IProductRegistry
    function sellerRegistry() external view returns (address) {
        return address(_sellerRegistry);
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _validateProductOwner(uint256 productId) internal view {
        if (productId == 0 || productId >= _nextProductId) revert ProductNotFound();

        uint256 sellerId = _sellerRegistry.getSellerIdByWallet(msg.sender);
        if (sellerId == 0 || _products[productId].sellerId != sellerId) {
            revert NotProductOwner();
        }
    }
}
