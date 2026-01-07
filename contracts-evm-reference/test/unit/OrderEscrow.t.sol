// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "../utils/BaseTest.sol";
import {OrderEscrow} from "../../src/OrderEscrow.sol";
import {IOrderEscrow} from "../../src/interfaces/IOrderEscrow.sol";

contract OrderEscrowTest is BaseTest {
    OrderEscrow public escrow;

    bytes32 public constant ORDER_ID = keccak256("order-1");
    uint256 public constant PRODUCT_ID = 1;
    uint256 public constant ORDER_AMOUNT = 100 ether;

    function setUp() public override {
        super.setUp();

        escrow = new OrderEscrow(TREASURY, address(0), address(0), DEPLOYER);

        // Fund buyers with native currency
        vm.deal(ALICE, 1000 ether);
        vm.deal(BOB, 1000 ether);

        // Label contracts
        vm.label(address(escrow), "OrderEscrow");
    }

    /*//////////////////////////////////////////////////////////////
                            CREATE ORDER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_CreateOrder() public asUser(ALICE) {
        vm.expectEmit(true, true, true, true);
        emit IOrderEscrow.OrderCreated(ORDER_ID, ALICE, BOB, ORDER_AMOUNT, PRODUCT_ID);

        escrow.createOrder{value: ORDER_AMOUNT}(ORDER_ID, BOB, ORDER_AMOUNT, PRODUCT_ID);

        IOrderEscrow.Order memory order = escrow.getOrder(ORDER_ID);
        assertEq(order.buyer, ALICE);
        assertEq(order.seller, BOB);
        assertEq(order.amount, ORDER_AMOUNT);
        assertEq(order.productId, PRODUCT_ID);
        assertEq(uint256(order.status), uint256(IOrderEscrow.OrderStatus.Active));
        assertEq(address(escrow).balance, ORDER_AMOUNT);
    }

    function test_CreateOrder_RevertIfAlreadyExists() public asUser(ALICE) {
        escrow.createOrder{value: ORDER_AMOUNT}(ORDER_ID, BOB, ORDER_AMOUNT, PRODUCT_ID);

        vm.expectRevert(IOrderEscrow.OrderAlreadyExists.selector);
        escrow.createOrder{value: ORDER_AMOUNT}(ORDER_ID, BOB, ORDER_AMOUNT, PRODUCT_ID);
    }

    function test_CreateOrder_RevertIfZeroAmount() public asUser(ALICE) {
        vm.expectRevert(IOrderEscrow.InvalidAmount.selector);
        escrow.createOrder{value: 0}(ORDER_ID, BOB, 0, PRODUCT_ID);
    }

    function test_CreateOrder_RevertIfZeroSeller() public asUser(ALICE) {
        vm.expectRevert(IOrderEscrow.InvalidAddress.selector);
        escrow.createOrder{value: ORDER_AMOUNT}(ORDER_ID, address(0), ORDER_AMOUNT, PRODUCT_ID);
    }

    function test_CreateOrder_RevertIfWrongValue() public asUser(ALICE) {
        vm.expectRevert(IOrderEscrow.InvalidAmount.selector);
        escrow.createOrder{value: ORDER_AMOUNT - 1}(ORDER_ID, BOB, ORDER_AMOUNT, PRODUCT_ID);
    }

    /*//////////////////////////////////////////////////////////////
                          CONFIRM DELIVERY TESTS
    //////////////////////////////////////////////////////////////*/

    function test_ConfirmDelivery() public {
        _createActiveOrder();

        uint256 sellerBalanceBefore = BOB.balance;
        uint256 treasuryBalanceBefore = TREASURY.balance;

        vm.prank(ALICE);
        escrow.confirmDelivery(ORDER_ID);

        IOrderEscrow.Order memory order = escrow.getOrder(ORDER_ID);
        assertEq(uint256(order.status), uint256(IOrderEscrow.OrderStatus.Confirmed));

        uint256 expectedFee = (ORDER_AMOUNT * 300) / 10000; // 3%
        uint256 expectedSeller = ORDER_AMOUNT - expectedFee;

        assertEq(BOB.balance - sellerBalanceBefore, expectedSeller);
        assertEq(TREASURY.balance - treasuryBalanceBefore, expectedFee);
    }

    function test_ConfirmDelivery_RevertIfNotBuyer() public {
        _createActiveOrder();

        vm.prank(BOB);
        vm.expectRevert(IOrderEscrow.NotBuyer.selector);
        escrow.confirmDelivery(ORDER_ID);
    }

    function test_ConfirmDelivery_RevertIfOrderNotActive() public {
        _createActiveOrder();

        vm.prank(ALICE);
        escrow.confirmDelivery(ORDER_ID);

        vm.prank(ALICE);
        vm.expectRevert(IOrderEscrow.OrderNotActive.selector);
        escrow.confirmDelivery(ORDER_ID);
    }

    /*//////////////////////////////////////////////////////////////
                            DISPUTE ORDER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_DisputeOrder() public {
        _createActiveOrder();

        vm.prank(ALICE);
        vm.expectEmit(true, false, false, true);
        emit IOrderEscrow.OrderDisputed(ORDER_ID, "Item not received");
        escrow.disputeOrder(ORDER_ID, "Item not received");

        IOrderEscrow.Order memory order = escrow.getOrder(ORDER_ID);
        assertEq(uint256(order.status), uint256(IOrderEscrow.OrderStatus.Disputed));
    }

    function test_DisputeOrder_RevertIfNotBuyer() public {
        _createActiveOrder();

        vm.prank(BOB);
        vm.expectRevert(IOrderEscrow.NotBuyer.selector);
        escrow.disputeOrder(ORDER_ID, "Item not received");
    }

    /*//////////////////////////////////////////////////////////////
                            REFUND ORDER TESTS
    //////////////////////////////////////////////////////////////*/

    function test_RefundOrder() public {
        _createActiveOrder();

        uint256 buyerBalanceBefore = ALICE.balance;

        vm.prank(DEPLOYER);
        escrow.refundOrder(ORDER_ID);

        IOrderEscrow.Order memory order = escrow.getOrder(ORDER_ID);
        assertEq(uint256(order.status), uint256(IOrderEscrow.OrderStatus.Refunded));
        assertEq(ALICE.balance - buyerBalanceBefore, ORDER_AMOUNT);
    }

    function test_RefundOrder_DisputedOrder() public {
        _createActiveOrder();

        vm.prank(ALICE);
        escrow.disputeOrder(ORDER_ID, "Item not received");

        vm.prank(DEPLOYER);
        escrow.refundOrder(ORDER_ID);

        IOrderEscrow.Order memory order = escrow.getOrder(ORDER_ID);
        assertEq(uint256(order.status), uint256(IOrderEscrow.OrderStatus.Refunded));
    }

    function test_RefundOrder_RevertIfNotAdmin() public {
        _createActiveOrder();

        vm.prank(ALICE);
        vm.expectRevert();
        escrow.refundOrder(ORDER_ID);
    }

    /*//////////////////////////////////////////////////////////////
                          AUTO RELEASE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_AutoRelease() public {
        _createActiveOrder();

        // Fast forward past timeout
        skip(7 days + 1);

        uint256 sellerBalanceBefore = BOB.balance;

        escrow.autoRelease(ORDER_ID);

        IOrderEscrow.Order memory order = escrow.getOrder(ORDER_ID);
        assertEq(uint256(order.status), uint256(IOrderEscrow.OrderStatus.AutoReleased));

        uint256 expectedFee = (ORDER_AMOUNT * 300) / 10000;
        uint256 expectedSeller = ORDER_AMOUNT - expectedFee;
        assertEq(BOB.balance - sellerBalanceBefore, expectedSeller);
    }

    function test_AutoRelease_RevertIfNotReady() public {
        _createActiveOrder();

        vm.expectRevert(IOrderEscrow.AutoReleaseNotReady.selector);
        escrow.autoRelease(ORDER_ID);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetPlatformFee() public asUser(DEPLOYER) {
        escrow.setPlatformFee(500); // 5%
        assertEq(escrow.platformFee(), 500);
    }

    function test_SetPlatformFee_RevertIfTooHigh() public asUser(DEPLOYER) {
        vm.expectRevert(IOrderEscrow.InvalidAmount.selector);
        escrow.setPlatformFee(1001); // > 10%
    }

    function test_SetAutoReleaseTimeout() public asUser(DEPLOYER) {
        escrow.setAutoReleaseTimeout(14 days);
        assertEq(escrow.autoReleaseTimeout(), 14 days);
    }

    function test_SetTreasury() public asUser(DEPLOYER) {
        escrow.setTreasury(CHARLIE);
        assertEq(escrow.treasury(), CHARLIE);
    }

    function test_SetTreasury_RevertIfZeroAddress() public asUser(DEPLOYER) {
        vm.expectRevert(IOrderEscrow.InvalidAddress.selector);
        escrow.setTreasury(address(0));
    }

    /*//////////////////////////////////////////////////////////////
                              HELPERS
    //////////////////////////////////////////////////////////////*/

    function _createActiveOrder() internal {
        vm.prank(ALICE);
        escrow.createOrder{value: ORDER_AMOUNT}(ORDER_ID, BOB, ORDER_AMOUNT, PRODUCT_ID);
    }
}
