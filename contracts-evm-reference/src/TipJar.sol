// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/access/Ownable.sol";
import "@openzeppelin/utils/ReentrancyGuard.sol";
import "./interfaces/ITipJar.sol";

/// @title TipJar
/// @author Labang Team
/// @notice Allow viewers to tip streamers during live streams using native currency
/// @dev Implements 2% platform fee on all tips, uses VERY/POL native currency
contract TipJar is ITipJar, Ownable, ReentrancyGuard {
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

    /// @notice Pending tips for each streamer
    mapping(address => uint256) public streamerBalances;

    /// @notice Total tips received by each streamer (historical)
    mapping(address => uint256) public totalTipsReceived;

    /// @notice Accumulated platform fees
    uint256 public platformFeesAccumulated;

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Initialize TipJar with platform fee
    /// @param _platformFee Initial platform fee in basis points (200 = 2%)
    constructor(uint256 _platformFee) Ownable(msg.sender) {
        if (_platformFee > MAX_FEE) revert InvalidFee();
        platformFee = _platformFee;
    }

    /*//////////////////////////////////////////////////////////////
                         EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Send a tip to a streamer
    /// @param streamerId Address of the streamer to tip
    /// @param message Optional message with the tip
    function tip(
        address streamerId,
        string calldata message
    ) external payable nonReentrant {
        if (streamerId == address(0)) revert ZeroAddress();
        if (msg.value == 0) revert ZeroAmount();

        uint256 amount = msg.value;

        // Calculate fee
        uint256 fee = (amount * platformFee) / FEE_DENOMINATOR;
        uint256 streamerAmount = amount - fee;

        // Update balances
        streamerBalances[streamerId] += streamerAmount;
        totalTipsReceived[streamerId] += streamerAmount;
        platformFeesAccumulated += fee;

        emit TipSent(msg.sender, streamerId, streamerAmount, message, block.timestamp);
    }

    /// @notice Withdraw accumulated tips (called by streamer)
    function withdrawTips() external nonReentrant {
        uint256 balance = streamerBalances[msg.sender];
        if (balance == 0) revert InsufficientBalance();

        streamerBalances[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: balance}("");
        if (!success) revert TransferFailed();

        emit TipsWithdrawn(msg.sender, balance);
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
                          VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get pending balance for a streamer
    /// @param streamerId Address of the streamer
    function getStreamerBalance(address streamerId) external view returns (uint256) {
        return streamerBalances[streamerId];
    }

    /// @notice Get total tips received by a streamer (historical)
    /// @param streamerId Address of the streamer
    function getTotalTipsReceived(address streamerId) external view returns (uint256) {
        return totalTipsReceived[streamerId];
    }

    /// @notice Get accumulated platform fees
    function getPlatformFeesAccumulated() external view returns (uint256) {
        return platformFeesAccumulated;
    }

    // Allow contract to receive native currency
    receive() external payable {}
}
