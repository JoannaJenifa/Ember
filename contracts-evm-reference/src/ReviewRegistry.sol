// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/access/Ownable.sol";
import {IReviewRegistry} from "./interfaces/IReviewRegistry.sol";
import {IOrderEscrow} from "./interfaces/IOrderEscrow.sol";

/// @title ReviewRegistry
/// @notice On-chain verified reviews - only purchased and confirmed orders can review
/// @dev Reviews are linked to confirmed orders via OrderEscrow
contract ReviewRegistry is IReviewRegistry, Ownable {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    IOrderEscrow public _orderEscrow;
    uint256 public _totalReviews;

    mapping(uint256 => Review) private _reviews;
    mapping(bytes32 => bool) private _hasReviewed;
    mapping(uint256 => ProductRating) private _productRatings;
    mapping(uint256 => uint256[]) private _productReviewIds;

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(address orderEscrow_, address owner_) Ownable(owner_) {
        _orderEscrow = IOrderEscrow(orderEscrow_);
    }

    /*//////////////////////////////////////////////////////////////
                            EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IReviewRegistry
    function submitReview(
        bytes32 orderId,
        uint8 rating,
        bytes32 contentHash
    ) external returns (uint256 reviewId) {
        if (rating == 0 || rating > 5) revert InvalidRating();
        if (contentHash == bytes32(0)) revert InvalidContentHash();
        if (_hasReviewed[orderId]) revert AlreadyReviewed();

        IOrderEscrow.Order memory order = _orderEscrow.getOrder(orderId);
        if (order.buyer != msg.sender) revert NotBuyer();
        if (order.status != IOrderEscrow.OrderStatus.Confirmed &&
            order.status != IOrderEscrow.OrderStatus.AutoReleased) {
            revert OrderNotConfirmed();
        }

        reviewId = _totalReviews++;
        _reviews[reviewId] = Review({
            orderId: orderId,
            productId: order.productId,
            reviewer: msg.sender,
            rating: rating,
            contentHash: contentHash,
            createdAt: block.timestamp
        });

        _hasReviewed[orderId] = true;

        ProductRating storage productRating = _productRatings[order.productId];
        productRating.totalRating += rating;
        productRating.reviewCount += 1;

        _productReviewIds[order.productId].push(reviewId);

        emit ReviewSubmitted(reviewId, orderId, order.productId, msg.sender, rating);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function setOrderEscrow(address newOrderEscrow) external onlyOwner {
        address oldEscrow = address(_orderEscrow);
        _orderEscrow = IOrderEscrow(newOrderEscrow);
        emit OrderEscrowUpdated(oldEscrow, newOrderEscrow);
    }

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    /// @inheritdoc IReviewRegistry
    function getReview(uint256 reviewId) external view returns (Review memory) {
        if (reviewId >= _totalReviews) revert ReviewNotFound();
        return _reviews[reviewId];
    }

    /// @inheritdoc IReviewRegistry
    function getProductRating(uint256 productId)
        external
        view
        returns (uint256 averageRating, uint256 reviewCount)
    {
        ProductRating storage rating = _productRatings[productId];
        reviewCount = rating.reviewCount;
        if (reviewCount > 0) {
            averageRating = (rating.totalRating * 100) / reviewCount; // Returns rating * 100 for precision
        }
    }

    /// @inheritdoc IReviewRegistry
    function getProductReviews(uint256 productId)
        external
        view
        returns (uint256[] memory reviewIds)
    {
        return _productReviewIds[productId];
    }

    /// @inheritdoc IReviewRegistry
    function hasReviewed(bytes32 orderId) external view returns (bool) {
        return _hasReviewed[orderId];
    }

    /// @inheritdoc IReviewRegistry
    function orderEscrow() external view returns (address) {
        return address(_orderEscrow);
    }

    /// @inheritdoc IReviewRegistry
    function totalReviews() external view returns (uint256) {
        return _totalReviews;
    }
}
