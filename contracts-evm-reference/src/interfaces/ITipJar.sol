// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title ITipJar
/// @notice Interface for the TipJar contract - allows viewers to tip streamers
/// @dev Uses native currency (VERY/POL) for tips
interface ITipJar {
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error ZeroAmount();
    error ZeroAddress();
    error InsufficientBalance();
    error TransferFailed();
    error InvalidFee();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event TipSent(
        address indexed from,
        address indexed streamerId,
        uint256 amount,
        string message,
        uint256 timestamp
    );
    event TipsWithdrawn(address indexed streamerId, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function tip(address streamerId, string calldata message) external payable;
    function withdrawTips() external;
    function setPlatformFee(uint256 newFee) external;
    function withdrawPlatformFees(address to) external;

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    function platformFee() external view returns (uint256);
    function getStreamerBalance(address streamerId) external view returns (uint256);
    function getTotalTipsReceived(address streamerId) external view returns (uint256);
    function getPlatformFeesAccumulated() external view returns (uint256);
}
