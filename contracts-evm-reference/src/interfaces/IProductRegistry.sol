// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IProductRegistry
/// @notice Interface for on-chain product registration
interface IProductRegistry {
    /*//////////////////////////////////////////////////////////////
                                 STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Product {
        uint256 sellerId;
        string title;
        string category;
        uint256 priceVery; // Price in VERY tokens (18 decimals)
        uint256 inventory;
        string metadataURI; // IPFS URI for description, images, etc.
        bool isActive;
        uint256 createdAt;
        uint256 totalSold;
    }

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error ProductNotFound();
    error NotProductOwner();
    error NotSellerRegistry();
    error InvalidSellerId();
    error EmptyTitle();
    error InvalidPrice();
    error InsufficientInventory();
    error ProductNotActive();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event ProductCreated(
        uint256 indexed productId,
        uint256 indexed sellerId,
        string title,
        uint256 priceVery
    );
    event ProductUpdated(uint256 indexed productId, string metadataURI);
    event ProductPriceUpdated(uint256 indexed productId, uint256 oldPrice, uint256 newPrice);
    event ProductInventoryUpdated(uint256 indexed productId, uint256 newInventory);
    event ProductDeactivated(uint256 indexed productId);
    event ProductReactivated(uint256 indexed productId);
    event ProductSold(uint256 indexed productId, uint256 quantity);

    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function createProduct(
        string calldata title,
        string calldata category,
        uint256 priceVery,
        uint256 inventory,
        string calldata metadataURI
    ) external returns (uint256 productId);

    function updateProduct(uint256 productId, string calldata metadataURI) external;

    function updatePrice(uint256 productId, uint256 newPrice) external;

    function updateInventory(uint256 productId, uint256 newInventory) external;

    function deactivateProduct(uint256 productId) external;

    function reactivateProduct(uint256 productId) external;

    function recordSale(uint256 productId, uint256 quantity) external;

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    function getProduct(uint256 productId) external view returns (Product memory);

    function getProductsBySeller(uint256 sellerId) external view returns (uint256[] memory);

    function totalProducts() external view returns (uint256);

    function sellerRegistry() external view returns (address);
}
