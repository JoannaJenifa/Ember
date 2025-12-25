// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ReentrancyGuard} from "@openzeppelin/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {IOrderEscrow} from "./interfaces/IOrderEscrow.sol";
import {ISellerRegistry} from "./interfaces/ISellerRegistry.sol";
import {IProductRegistry} from "./interfaces/IProductRegistry.sol";

/// @title OrderEscrow
/// @notice Holds buyer payments until delivery is confirmed
/// @dev Uses native currency (VERY/POL) for payments with platform fee and auto-release
contract OrderEscrow is IOrderEscrow, ReentrancyGuard, Ownable {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    ISellerRegistry public _sellerRegistry;
    IProductRegistry public _productRegistry;
    address public _treasury;
    uint256 public _platformFee; // basis points (300 = 3%)
    uint256 public _autoReleaseTimeout; // seconds

    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant DEFAULT_PLATFORM_FEE = 300; // 3%
    uint256 private constant DEFAULT_AUTO_RELEASE_TIMEOUT = 7 days;

    mapping(bytes32 => Order) private _orders;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        address treasury_,
        address sellerRegistry_,
        address productRegistry_,
        address owner_
    ) Ownable(owner_) {
        if (treasury_ == address(0)) revert InvalidAddress();

        _treasury = treasury_;
        _sellerRegistry = ISellerRegistry(sellerRegistry_);
        _productRegistry = IProductRegistry(productRegistry_);
        _platformFee = DEFAULT_PLATFORM_FEE;
        _autoReleaseTimeout = DEFAULT_AUTO_RELEASE_TIMEOUT;
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IOrderEscrow
    function createOrder(
        bytes32 orderId,
        address seller,
        uint256 amount,
        uint256 productId
    ) external payable nonReentrant {
        if (_orders[orderId].buyer != address(0)) revert OrderAlreadyExists();
        if (seller == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (msg.value != amount) revert InvalidAmount();

        // Validate seller is registered and active
        if (address(_sellerRegistry) != address(0)) {
            if (!_sellerRegistry.isRegisteredSeller(seller)) revert InvalidAddress();
        }

        // Validate product exists and belongs to seller
        if (address(_productRegistry) != address(0) && productId > 0) {
            IProductRegistry.Product memory product = _productRegistry.getProduct(productId);
            uint256 sellerId = _sellerRegistry.getSellerIdByWallet(seller);
            if (product.sellerId != sellerId) revert InvalidAddress();
            if (!product.isActive) revert InvalidAmount();
        }

        _orders[orderId] = Order({
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            productId: productId,
            createdAt: block.timestamp,
            status: OrderStatus.Active
        });

        emit OrderCreated(orderId, msg.sender, seller, amount, productId);
    }

    /// @inheritdoc IOrderEscrow
    function confirmDelivery(bytes32 orderId) external nonReentrant {
        Order storage order = _orders[orderId];
        if (order.buyer == address(0)) revert OrderNotFound();
        if (order.status != OrderStatus.Active) revert OrderNotActive();
        if (msg.sender != order.buyer) revert NotBuyer();

        order.status = OrderStatus.Confirmed;
        uint256 released = _releaseToSeller(order);

        // Record sale in registries
        _recordSale(order);

        emit OrderConfirmed(orderId, released);
    }

    /// @inheritdoc IOrderEscrow
    function disputeOrder(bytes32 orderId, string calldata reason) external {
        Order storage order = _orders[orderId];
        if (order.buyer == address(0)) revert OrderNotFound();
        if (order.status != OrderStatus.Active) revert OrderNotActive();
        if (msg.sender != order.buyer) revert NotBuyer();

        order.status = OrderStatus.Disputed;

        emit OrderDisputed(orderId, reason);
    }

    /// @inheritdoc IOrderEscrow
    function refundOrder(bytes32 orderId) external nonReentrant onlyOwner {
        Order storage order = _orders[orderId];
        if (order.buyer == address(0)) revert OrderNotFound();
        if (order.status != OrderStatus.Active && order.status != OrderStatus.Disputed) {
            revert OrderNotActive();
        }

        order.status = OrderStatus.Refunded;

        (bool success, ) = order.buyer.call{value: order.amount}("");
        if (!success) revert TransferFailed();

        emit OrderRefunded(orderId, order.amount);
    }

    /// @inheritdoc IOrderEscrow
    function autoRelease(bytes32 orderId) external nonReentrant {
        Order storage order = _orders[orderId];
        if (order.buyer == address(0)) revert OrderNotFound();
        if (order.status != OrderStatus.Active) revert OrderNotActive();
        if (block.timestamp < order.createdAt + _autoReleaseTimeout) {
            revert AutoReleaseNotReady();
        }

        order.status = OrderStatus.AutoReleased;
        uint256 released = _releaseToSeller(order);

        // Record sale in registries
        _recordSale(order);

        emit OrderAutoReleased(orderId, released);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IOrderEscrow
    function setPlatformFee(uint256 newFee) external onlyOwner {
        if (newFee > 1000) revert InvalidAmount(); // max 10%
        uint256 oldFee = _platformFee;
        _platformFee = newFee;
        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /// @inheritdoc IOrderEscrow
    function setAutoReleaseTimeout(uint256 newTimeout) external onlyOwner {
        uint256 oldTimeout = _autoReleaseTimeout;
        _autoReleaseTimeout = newTimeout;
        emit AutoReleaseTimeoutUpdated(oldTimeout, newTimeout);
    }

    /// @inheritdoc IOrderEscrow
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidAddress();
        address oldTreasury = _treasury;
        _treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    function setSellerRegistry(address newRegistry) external onlyOwner {
        _sellerRegistry = ISellerRegistry(newRegistry);
    }

    function setProductRegistry(address newRegistry) external onlyOwner {
        _productRegistry = IProductRegistry(newRegistry);
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IOrderEscrow
    function getOrder(bytes32 orderId) external view returns (Order memory) {
        return _orders[orderId];
    }

    /// @inheritdoc IOrderEscrow
    function platformFee() external view returns (uint256) {
        return _platformFee;
    }

    /// @inheritdoc IOrderEscrow
    function autoReleaseTimeout() external view returns (uint256) {
        return _autoReleaseTimeout;
    }

    /// @inheritdoc IOrderEscrow
    function treasury() external view returns (address) {
        return _treasury;
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _releaseToSeller(Order storage order) internal returns (uint256 sellerAmount) {
        uint256 feeAmount = (order.amount * _platformFee) / BASIS_POINTS;
        sellerAmount = order.amount - feeAmount;

        if (feeAmount > 0) {
            (bool feeSuccess, ) = _treasury.call{value: feeAmount}("");
            if (!feeSuccess) revert TransferFailed();
        }

        (bool success, ) = order.seller.call{value: sellerAmount}("");
        if (!success) revert TransferFailed();
    }

    function _recordSale(Order storage order) internal {
        if (address(_sellerRegistry) != address(0) && address(_productRegistry) != address(0)) {
            uint256 sellerId = _sellerRegistry.getSellerIdByWallet(order.seller);
            if (sellerId > 0) {
                _sellerRegistry.recordSale(sellerId, order.amount);
            }
            if (order.productId > 0) {
                _productRegistry.recordSale(order.productId, 1);
            }
        }
    }

    // Allow contract to receive native currency
    receive() external payable {}
}
