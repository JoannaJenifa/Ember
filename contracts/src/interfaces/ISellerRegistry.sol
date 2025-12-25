// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title ISellerRegistry
/// @notice Interface for on-chain seller registration
interface ISellerRegistry {
    /*//////////////////////////////////////////////////////////////
                                 STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Seller {
        address wallet;
        string shopName;
        string category;
        string metadataURI; // IPFS URI for description, images, etc.
        bool isActive;
        uint256 createdAt;
        uint256 totalSales;
        uint256 totalOrders;
    }

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error SellerNotFound();
    error SellerAlreadyExists();
    error NotSellerOwner();
    error InvalidAddress();
    error EmptyShopName();
    error EmptyCategory();
    error SellerNotActive();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event SellerRegistered(
        uint256 indexed sellerId,
        address indexed wallet,
        string shopName,
        string category
    );
    event SellerUpdated(uint256 indexed sellerId, string metadataURI);
    event SellerDeactivated(uint256 indexed sellerId);
    event SellerReactivated(uint256 indexed sellerId);
    event SellerSaleRecorded(uint256 indexed sellerId, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function registerSeller(
        string calldata shopName,
        string calldata category,
        string calldata metadataURI
    ) external returns (uint256 sellerId);

    function updateSeller(string calldata metadataURI) external;

    function deactivateSeller() external;

    function reactivateSeller() external;

    function recordSale(uint256 sellerId, uint256 amount) external;

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    function getSeller(uint256 sellerId) external view returns (Seller memory);

    function getSellerByWallet(address wallet) external view returns (uint256 sellerId, Seller memory seller);

    function getSellerIdByWallet(address wallet) external view returns (uint256);

    function isRegisteredSeller(address wallet) external view returns (bool);

    function totalSellers() external view returns (uint256);
}
