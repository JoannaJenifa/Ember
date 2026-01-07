// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IOrderEscrow
/// @notice Interface for the OrderEscrow contract - holds buyer payments until delivery confirmed
interface IOrderEscrow {
    /*//////////////////////////////////////////////////////////////
                                 ENUMS
    //////////////////////////////////////////////////////////////*/

    enum OrderStatus {
        Active,
        Confirmed,
        Disputed,
        Refunded,
        AutoReleased
    }

    /*//////////////////////////////////////////////////////////////
                                 STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Order {
        address buyer;
        address seller;
        uint256 amount;
        uint256 productId;
        uint256 createdAt;
        OrderStatus status;
    }

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error OrderNotFound();
    error OrderNotActive();
    error NotBuyer();
    error NotSeller();
    error NotAdmin();
    error InvalidAmount();
    error InvalidAddress();
    error TransferFailed();
    error AutoReleaseNotReady();
    error OrderAlreadyExists();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event OrderCreated(
        bytes32 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint256 productId
    );
    event OrderConfirmed(bytes32 indexed orderId, uint256 releasedAmount);
    event OrderDisputed(bytes32 indexed orderId, string reason);
    event OrderRefunded(bytes32 indexed orderId, uint256 amount);
    event OrderAutoReleased(bytes32 indexed orderId, uint256 releasedAmount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event AutoReleaseTimeoutUpdated(uint256 oldTimeout, uint256 newTimeout);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function createOrder(
        bytes32 orderId,
        address seller,
        uint256 amount,
        uint256 productId
    ) external payable;

    function confirmDelivery(bytes32 orderId) external;

    function disputeOrder(bytes32 orderId, string calldata reason) external;

    function refundOrder(bytes32 orderId) external;

    function autoRelease(bytes32 orderId) external;

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function setPlatformFee(uint256 newFee) external;

    function setAutoReleaseTimeout(uint256 newTimeout) external;

    function setTreasury(address newTreasury) external;

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    function getOrder(bytes32 orderId) external view returns (Order memory);

    function platformFee() external view returns (uint256);

    function autoReleaseTimeout() external view returns (uint256);

    function treasury() external view returns (address);
}
