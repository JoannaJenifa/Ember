// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IGiftShop
/// @notice Interface for the GiftShop contract - virtual gifts for live streams
/// @dev Uses native currency (VERY/POL) for gift purchases
interface IGiftShop {
    /*//////////////////////////////////////////////////////////////
                                 STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Gift {
        uint256 id;
        string name;
        uint256 price;
        string animationURI;
        bool active;
    }

    struct GiftRecord {
        uint256 giftId;
        address sender;
        uint256 quantity;
        uint256 totalValue;
        uint256 timestamp;
    }

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error ZeroAmount();
    error ZeroAddress();
    error ZeroPrice();
    error GiftNotFound();
    error GiftNotActive();
    error InsufficientBalance();
    error TransferFailed();
    error InvalidFee();
    error GiftAlreadyExists();
    error EmptyName();
    error InvalidPayment();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event GiftCreated(uint256 indexed giftId, string name, uint256 price, string animationURI);
    event GiftUpdated(uint256 indexed giftId, string name, uint256 price, string animationURI);
    event GiftDeactivated(uint256 indexed giftId);
    event GiftSent(
        address indexed from,
        address indexed streamerId,
        uint256 indexed giftId,
        uint256 quantity,
        uint256 totalValue
    );
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event RevenueWithdrawn(address indexed streamerId, uint256 amount);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function createGift(
        uint256 giftId,
        string calldata name,
        uint256 price,
        string calldata animationURI
    ) external;
    function updateGift(
        uint256 giftId,
        string calldata name,
        uint256 price,
        string calldata animationURI
    ) external;
    function deactivateGift(uint256 giftId) external;
    function sendGift(address streamerId, uint256 giftId, uint256 quantity) external payable;
    function withdrawRevenue() external;
    function setPlatformFee(uint256 newFee) external;
    function withdrawPlatformFees(address to) external;

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    function platformFee() external view returns (uint256);
    function getGift(uint256 giftId) external view returns (Gift memory);
    function getAllGifts() external view returns (Gift[] memory);
    function getStreamerRevenue(address streamerId) external view returns (uint256);
    function getTotalGiftsReceived(address streamerId) external view returns (uint256);
    function getPlatformFeesAccumulated() external view returns (uint256);
}
