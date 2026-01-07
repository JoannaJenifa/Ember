// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {ISellerRegistry} from "./interfaces/ISellerRegistry.sol";

/// @title SellerRegistry
/// @notice On-chain registry for verified sellers
/// @dev Sellers register with wallet, shop name, category, and metadata URI
contract SellerRegistry is ISellerRegistry, Ownable {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    uint256 private _nextSellerId;
    mapping(uint256 => Seller) private _sellers;
    mapping(address => uint256) private _walletToSellerId;

    // Authorized contracts that can record sales
    mapping(address => bool) public authorizedCallers;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address owner_) Ownable(owner_) {
        _nextSellerId = 1; // Start from 1, 0 means not registered
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc ISellerRegistry
    function registerSeller(
        string calldata shopName,
        string calldata category,
        string calldata metadataURI
    ) external returns (uint256 sellerId) {
        if (_walletToSellerId[msg.sender] != 0) revert SellerAlreadyExists();
        if (bytes(shopName).length == 0) revert EmptyShopName();
        if (bytes(category).length == 0) revert EmptyCategory();

        sellerId = _nextSellerId++;
        _sellers[sellerId] = Seller({
            wallet: msg.sender,
            shopName: shopName,
            category: category,
            metadataURI: metadataURI,
            isActive: true,
            createdAt: block.timestamp,
            totalSales: 0,
            totalOrders: 0
        });

        _walletToSellerId[msg.sender] = sellerId;

        emit SellerRegistered(sellerId, msg.sender, shopName, category);
    }

    /// @inheritdoc ISellerRegistry
    function updateSeller(string calldata metadataURI) external {
        uint256 sellerId = _walletToSellerId[msg.sender];
        if (sellerId == 0) revert SellerNotFound();

        _sellers[sellerId].metadataURI = metadataURI;

        emit SellerUpdated(sellerId, metadataURI);
    }

    /// @inheritdoc ISellerRegistry
    function deactivateSeller() external {
        uint256 sellerId = _walletToSellerId[msg.sender];
        if (sellerId == 0) revert SellerNotFound();

        _sellers[sellerId].isActive = false;

        emit SellerDeactivated(sellerId);
    }

    /// @inheritdoc ISellerRegistry
    function reactivateSeller() external {
        uint256 sellerId = _walletToSellerId[msg.sender];
        if (sellerId == 0) revert SellerNotFound();

        _sellers[sellerId].isActive = true;

        emit SellerReactivated(sellerId);
    }

    /// @inheritdoc ISellerRegistry
    function recordSale(uint256 sellerId, uint256 amount) external {
        if (!authorizedCallers[msg.sender]) revert NotSellerOwner();
        if (sellerId == 0 || sellerId >= _nextSellerId) revert SellerNotFound();

        _sellers[sellerId].totalSales += amount;
        _sellers[sellerId].totalOrders += 1;

        emit SellerSaleRecorded(sellerId, amount);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
    }

    /// @notice Admin function to register a seller on behalf of a wallet
    /// @dev Only owner can call this function. Used for bulk registration.
    function adminRegisterSeller(
        address wallet,
        string calldata shopName,
        string calldata category,
        string calldata metadataURI
    ) external onlyOwner returns (uint256 sellerId) {
        if (_walletToSellerId[wallet] != 0) revert SellerAlreadyExists();
        if (bytes(shopName).length == 0) revert EmptyShopName();
        if (bytes(category).length == 0) revert EmptyCategory();

        sellerId = _nextSellerId++;
        _sellers[sellerId] = Seller({
            wallet: wallet,
            shopName: shopName,
            category: category,
            metadataURI: metadataURI,
            isActive: true,
            createdAt: block.timestamp,
            totalSales: 0,
            totalOrders: 0
        });

        _walletToSellerId[wallet] = sellerId;

        emit SellerRegistered(sellerId, wallet, shopName, category);
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc ISellerRegistry
    function getSeller(uint256 sellerId) external view returns (Seller memory) {
        if (sellerId == 0 || sellerId >= _nextSellerId) revert SellerNotFound();
        return _sellers[sellerId];
    }

    /// @inheritdoc ISellerRegistry
    function getSellerByWallet(address wallet) external view returns (uint256 sellerId, Seller memory seller) {
        sellerId = _walletToSellerId[wallet];
        if (sellerId == 0) revert SellerNotFound();
        seller = _sellers[sellerId];
    }

    /// @inheritdoc ISellerRegistry
    function getSellerIdByWallet(address wallet) external view returns (uint256) {
        return _walletToSellerId[wallet];
    }

    /// @inheritdoc ISellerRegistry
    function isRegisteredSeller(address wallet) external view returns (bool) {
        return _walletToSellerId[wallet] != 0;
    }

    /// @inheritdoc ISellerRegistry
    function totalSellers() external view returns (uint256) {
        return _nextSellerId - 1;
    }
}
