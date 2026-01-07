// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IReviewRegistry
/// @notice Interface for the ReviewRegistry contract - on-chain verified reviews
interface IReviewRegistry {
    /*//////////////////////////////////////////////////////////////
                                 STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct Review {
        bytes32 orderId;
        uint256 productId;
        address reviewer;
        uint8 rating;
        bytes32 contentHash;
        uint256 createdAt;
    }

    struct ProductRating {
        uint256 totalRating;
        uint256 reviewCount;
    }

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error OrderNotConfirmed();
    error NotBuyer();
    error AlreadyReviewed();
    error InvalidRating();
    error InvalidContentHash();
    error ReviewNotFound();
    error NotOrderEscrow();

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event ReviewSubmitted(
        uint256 indexed reviewId,
        bytes32 indexed orderId,
        uint256 indexed productId,
        address reviewer,
        uint8 rating
    );
    event OrderEscrowUpdated(address oldEscrow, address newEscrow);

    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function submitReview(
        bytes32 orderId,
        uint8 rating,
        bytes32 contentHash
    ) external returns (uint256 reviewId);

    /*//////////////////////////////////////////////////////////////
                                GETTERS
    //////////////////////////////////////////////////////////////*/

    function getReview(uint256 reviewId) external view returns (Review memory);

    function getProductRating(uint256 productId)
        external
        view
        returns (uint256 averageRating, uint256 reviewCount);

    function getProductReviews(uint256 productId)
        external
        view
        returns (uint256[] memory reviewIds);

    function hasReviewed(bytes32 orderId) external view returns (bool);

    function orderEscrow() external view returns (address);

    function totalReviews() external view returns (uint256);
}
