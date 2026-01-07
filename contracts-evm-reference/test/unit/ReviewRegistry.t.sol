// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "../utils/BaseTest.sol";
import {OrderEscrow} from "../../src/OrderEscrow.sol";
import {ReviewRegistry} from "../../src/ReviewRegistry.sol";
import {IOrderEscrow} from "../../src/interfaces/IOrderEscrow.sol";
import {IReviewRegistry} from "../../src/interfaces/IReviewRegistry.sol";

contract ReviewRegistryTest is BaseTest {
    OrderEscrow public escrow;
    ReviewRegistry public registry;

    bytes32 public constant ORDER_ID = keccak256("order-1");
    bytes32 public constant ORDER_ID_2 = keccak256("order-2");
    uint256 public constant PRODUCT_ID = 1;
    uint256 public constant ORDER_AMOUNT = 100 ether;
    bytes32 public constant CONTENT_HASH = keccak256("Great product!");

    function setUp() public override {
        super.setUp();

        escrow = new OrderEscrow(TREASURY, address(0), address(0), DEPLOYER);
        registry = new ReviewRegistry(address(escrow), DEPLOYER);

        // Fund buyers with native currency
        vm.deal(ALICE, 1000 ether);
        vm.deal(BOB, 1000 ether);
        vm.deal(CHARLIE, 1000 ether);

        // Label contracts
        vm.label(address(escrow), "OrderEscrow");
        vm.label(address(registry), "ReviewRegistry");
    }

    /*//////////////////////////////////////////////////////////////
                          SUBMIT REVIEW TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SubmitReview() public {
        _createConfirmedOrder(ORDER_ID, ALICE, BOB);

        vm.prank(ALICE);
        vm.expectEmit(true, true, true, true);
        emit IReviewRegistry.ReviewSubmitted(0, ORDER_ID, PRODUCT_ID, ALICE, 5);
        uint256 reviewId = registry.submitReview(ORDER_ID, 5, CONTENT_HASH);

        assertEq(reviewId, 0);
        assertEq(registry.totalReviews(), 1);
        assertTrue(registry.hasReviewed(ORDER_ID));

        IReviewRegistry.Review memory review = registry.getReview(reviewId);
        assertEq(review.orderId, ORDER_ID);
        assertEq(review.productId, PRODUCT_ID);
        assertEq(review.reviewer, ALICE);
        assertEq(review.rating, 5);
        assertEq(review.contentHash, CONTENT_HASH);
    }

    function test_SubmitReview_AutoReleasedOrder() public {
        _createAutoReleasedOrder(ORDER_ID, ALICE, BOB);

        vm.prank(ALICE);
        uint256 reviewId = registry.submitReview(ORDER_ID, 4, CONTENT_HASH);
        assertEq(reviewId, 0);
    }

    function test_SubmitReview_RevertIfNotBuyer() public {
        _createConfirmedOrder(ORDER_ID, ALICE, BOB);

        vm.prank(BOB);
        vm.expectRevert(IReviewRegistry.NotBuyer.selector);
        registry.submitReview(ORDER_ID, 5, CONTENT_HASH);
    }

    function test_SubmitReview_RevertIfAlreadyReviewed() public {
        _createConfirmedOrder(ORDER_ID, ALICE, BOB);

        vm.startPrank(ALICE);
        registry.submitReview(ORDER_ID, 5, CONTENT_HASH);

        vm.expectRevert(IReviewRegistry.AlreadyReviewed.selector);
        registry.submitReview(ORDER_ID, 4, CONTENT_HASH);
        vm.stopPrank();
    }

    function test_SubmitReview_RevertIfOrderNotConfirmed() public {
        _createActiveOrder(ORDER_ID, ALICE, BOB);

        vm.prank(ALICE);
        vm.expectRevert(IReviewRegistry.OrderNotConfirmed.selector);
        registry.submitReview(ORDER_ID, 5, CONTENT_HASH);
    }

    function test_SubmitReview_RevertIfInvalidRating() public {
        _createConfirmedOrder(ORDER_ID, ALICE, BOB);

        vm.startPrank(ALICE);

        vm.expectRevert(IReviewRegistry.InvalidRating.selector);
        registry.submitReview(ORDER_ID, 0, CONTENT_HASH);

        vm.expectRevert(IReviewRegistry.InvalidRating.selector);
        registry.submitReview(ORDER_ID, 6, CONTENT_HASH);

        vm.stopPrank();
    }

    function test_SubmitReview_RevertIfInvalidContentHash() public {
        _createConfirmedOrder(ORDER_ID, ALICE, BOB);

        vm.prank(ALICE);
        vm.expectRevert(IReviewRegistry.InvalidContentHash.selector);
        registry.submitReview(ORDER_ID, 5, bytes32(0));
    }

    /*//////////////////////////////////////////////////////////////
                        PRODUCT RATING TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetProductRating() public {
        _createConfirmedOrder(ORDER_ID, ALICE, BOB);
        _createConfirmedOrder(ORDER_ID_2, BOB, CHARLIE);

        vm.prank(ALICE);
        registry.submitReview(ORDER_ID, 5, CONTENT_HASH);

        vm.prank(BOB);
        registry.submitReview(ORDER_ID_2, 3, keccak256("Okay product"));

        (uint256 avgRating, uint256 count) = registry.getProductRating(PRODUCT_ID);
        assertEq(count, 2);
        assertEq(avgRating, 400); // (5+3)/2 * 100 = 400
    }

    function test_GetProductRating_NoReviews() public {
        (uint256 avgRating, uint256 count) = registry.getProductRating(PRODUCT_ID);
        assertEq(count, 0);
        assertEq(avgRating, 0);
    }

    /*//////////////////////////////////////////////////////////////
                       PRODUCT REVIEWS TESTS
    //////////////////////////////////////////////////////////////*/

    function test_GetProductReviews() public {
        _createConfirmedOrder(ORDER_ID, ALICE, BOB);
        _createConfirmedOrder(ORDER_ID_2, BOB, CHARLIE);

        vm.prank(ALICE);
        registry.submitReview(ORDER_ID, 5, CONTENT_HASH);

        vm.prank(BOB);
        registry.submitReview(ORDER_ID_2, 4, keccak256("Good product"));

        uint256[] memory reviews = registry.getProductReviews(PRODUCT_ID);
        assertEq(reviews.length, 2);
        assertEq(reviews[0], 0);
        assertEq(reviews[1], 1);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetOrderEscrow() public asUser(DEPLOYER) {
        address newEscrow = address(0x123);
        registry.setOrderEscrow(newEscrow);
        assertEq(registry.orderEscrow(), newEscrow);
    }

    function test_SetOrderEscrow_RevertIfNotOwner() public {
        vm.prank(ALICE);
        vm.expectRevert();
        registry.setOrderEscrow(address(0x123));
    }

    /*//////////////////////////////////////////////////////////////
                              HELPERS
    //////////////////////////////////////////////////////////////*/

    function _createActiveOrder(bytes32 orderId, address buyer, address seller) internal {
        vm.prank(buyer);
        escrow.createOrder{value: ORDER_AMOUNT}(orderId, seller, ORDER_AMOUNT, PRODUCT_ID);
    }

    function _createConfirmedOrder(bytes32 orderId, address buyer, address seller) internal {
        _createActiveOrder(orderId, buyer, seller);

        vm.prank(buyer);
        escrow.confirmDelivery(orderId);
    }

    function _createAutoReleasedOrder(bytes32 orderId, address buyer, address seller) internal {
        _createActiveOrder(orderId, buyer, seller);

        skip(7 days + 1);
        escrow.autoRelease(orderId);
    }
}
