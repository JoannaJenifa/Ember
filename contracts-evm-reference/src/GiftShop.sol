// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/access/Ownable.sol";
import "@openzeppelin/utils/ReentrancyGuard.sol";
import "./interfaces/IGiftShop.sol";

/// @title GiftShop
/// @author Labang Team
/// @notice Virtual gifts that viewers can send during streams using native currency
/// @dev Implements 2% platform fee on all gift purchases, uses VERY/POL native currency
contract GiftShop is IGiftShop, Ownable, ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                                CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint256 public constant MAX_FEE = 1000; // 10% max fee (basis points)
    uint256 public constant FEE_DENOMINATOR = 10000;

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Platform fee in basis points (200 = 2%)
    uint256 public platformFee;

    /// @notice Gift definitions
    mapping(uint256 => Gift) public gifts;

    /// @notice Array of gift IDs for enumeration
    uint256[] public giftIds;

    /// @notice Streamer revenue balances
    mapping(address => uint256) public streamerRevenue;

    /// @notice Total gifts value received by streamer (historical)
    mapping(address => uint256) public totalGiftsReceived;

    /// @notice Accumulated platform fees
    uint256 public platformFeesAccumulated;

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Initialize GiftShop with platform fee
    /// @param _platformFee Initial platform fee in basis points (200 = 2%)
    constructor(uint256 _platformFee) Ownable(msg.sender) {
        if (_platformFee > MAX_FEE) revert InvalidFee();
        platformFee = _platformFee;
    }

    /*//////////////////////////////////////////////////////////////
                         ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Create a new gift type (owner only)
    /// @param giftId Unique identifier for the gift
    /// @param name Name of the gift
    /// @param price Price in native currency
    /// @param animationURI URI for the gift animation
    function createGift(
        uint256 giftId,
        string calldata name,
        uint256 price,
        string calldata animationURI
    ) external onlyOwner {
        if (gifts[giftId].id != 0) revert GiftAlreadyExists();
        if (bytes(name).length == 0) revert EmptyName();
        if (price == 0) revert ZeroPrice();

        gifts[giftId] = Gift({
            id: giftId,
            name: name,
            price: price,
            animationURI: animationURI,
            active: true
        });

        giftIds.push(giftId);

        emit GiftCreated(giftId, name, price, animationURI);
    }

    /// @notice Update an existing gift (owner only)
    /// @param giftId Gift ID to update
    /// @param name New name
    /// @param price New price
    /// @param animationURI New animation URI
    function updateGift(
        uint256 giftId,
        string calldata name,
        uint256 price,
        string calldata animationURI
    ) external onlyOwner {
        if (gifts[giftId].id == 0) revert GiftNotFound();
        if (bytes(name).length == 0) revert EmptyName();
        if (price == 0) revert ZeroPrice();

        gifts[giftId].name = name;
        gifts[giftId].price = price;
        gifts[giftId].animationURI = animationURI;

        emit GiftUpdated(giftId, name, price, animationURI);
    }

    /// @notice Deactivate a gift (owner only)
    /// @param giftId Gift ID to deactivate
    function deactivateGift(uint256 giftId) external onlyOwner {
        if (gifts[giftId].id == 0) revert GiftNotFound();

        gifts[giftId].active = false;

        emit GiftDeactivated(giftId);
    }

    /// @notice Update platform fee (owner only)
    /// @param newFee New platform fee in basis points
    function setPlatformFee(uint256 newFee) external onlyOwner {
        if (newFee > MAX_FEE) revert InvalidFee();

        uint256 oldFee = platformFee;
        platformFee = newFee;

        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /// @notice Withdraw accumulated platform fees (owner only)
    /// @param to Address to send fees to
    function withdrawPlatformFees(address to) external onlyOwner nonReentrant {
        if (to == address(0)) revert ZeroAddress();

        uint256 fees = platformFeesAccumulated;
        if (fees == 0) revert InsufficientBalance();

        platformFeesAccumulated = 0;

        (bool success, ) = to.call{value: fees}("");
        if (!success) revert TransferFailed();

        emit PlatformFeesWithdrawn(to, fees);
    }

    /*//////////////////////////////////////////////////////////////
                         EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Send a gift to a streamer
    /// @param streamerId Address of the streamer
    /// @param giftId ID of the gift to send
    /// @param quantity Number of gifts to send
    function sendGift(
        address streamerId,
        uint256 giftId,
        uint256 quantity
    ) external payable nonReentrant {
        if (streamerId == address(0)) revert ZeroAddress();
        if (quantity == 0) revert ZeroAmount();

        Gift memory gift = gifts[giftId];
        if (gift.id == 0) revert GiftNotFound();
        if (!gift.active) revert GiftNotActive();

        uint256 totalCost = gift.price * quantity;
        if (msg.value != totalCost) revert InvalidPayment();

        uint256 fee = (totalCost * platformFee) / FEE_DENOMINATOR;
        uint256 streamerAmount = totalCost - fee;

        // Update balances
        streamerRevenue[streamerId] += streamerAmount;
        totalGiftsReceived[streamerId] += streamerAmount;
        platformFeesAccumulated += fee;

        emit GiftSent(msg.sender, streamerId, giftId, quantity, totalCost);
    }

    /// @notice Withdraw accumulated revenue (called by streamer)
    function withdrawRevenue() external nonReentrant {
        uint256 balance = streamerRevenue[msg.sender];
        if (balance == 0) revert InsufficientBalance();

        streamerRevenue[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: balance}("");
        if (!success) revert TransferFailed();

        emit RevenueWithdrawn(msg.sender, balance);
    }

    /*//////////////////////////////////////////////////////////////
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get gift details
    /// @param giftId Gift ID to query
    function getGift(uint256 giftId) external view returns (Gift memory) {
        if (gifts[giftId].id == 0) revert GiftNotFound();
        return gifts[giftId];
    }

    /// @notice Get all gifts
    function getAllGifts() external view returns (Gift[] memory) {
        uint256 length = giftIds.length;
        Gift[] memory allGifts = new Gift[](length);

        for (uint256 i = 0; i < length; i++) {
            allGifts[i] = gifts[giftIds[i]];
        }

        return allGifts;
    }

    /// @notice Get pending revenue for a streamer
    /// @param streamerId Address of the streamer
    function getStreamerRevenue(address streamerId) external view returns (uint256) {
        return streamerRevenue[streamerId];
    }

    /// @notice Get total gifts value received by a streamer (historical)
    /// @param streamerId Address of the streamer
    function getTotalGiftsReceived(address streamerId) external view returns (uint256) {
        return totalGiftsReceived[streamerId];
    }

    /// @notice Get accumulated platform fees
    function getPlatformFeesAccumulated() external view returns (uint256) {
        return platformFeesAccumulated;
    }

    // Allow contract to receive native currency
    receive() external payable {}
}
