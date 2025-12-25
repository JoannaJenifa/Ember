// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../../src/GiftShop.sol";

contract GiftShopTest is Test {
    GiftShop public giftShop;

    address public owner = address(this);
    address public streamer1 = address(0x1);
    address public viewer1 = address(0x3);
    address public viewer2 = address(0x4);

    uint256 public constant PLATFORM_FEE = 200; // 2%
    uint256 public constant INITIAL_BALANCE = 10000 ether;

    // Gift IDs
    uint256 constant HEART = 1;
    uint256 constant STAR = 2;
    uint256 constant ROCKET = 3;
    uint256 constant CROWN = 4;

    event GiftCreated(uint256 indexed giftId, string name, uint256 price, string animationURI);
    event GiftUpdated(uint256 indexed giftId, string name, uint256 price, string animationURI);
    event GiftDeactivated(uint256 indexed giftId);
    event GiftSent(address indexed from, address indexed streamerId, uint256 indexed giftId, uint256 quantity, uint256 totalValue);
    event RevenueWithdrawn(address indexed streamerId, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    function setUp() public {
        giftShop = new GiftShop(PLATFORM_FEE);

        // Fund viewers with native currency
        vm.deal(viewer1, INITIAL_BALANCE);
        vm.deal(viewer2, INITIAL_BALANCE);

        // Create default gifts
        _createDefaultGifts();
    }

    function _createDefaultGifts() internal {
        giftShop.createGift(HEART, unicode"하트", 0.25 ether, "heart-float");
        giftShop.createGift(STAR, unicode"별", 0.5 ether, "star-burst");
        giftShop.createGift(ROCKET, unicode"로켓", 1 ether, "rocket-launch");
        giftShop.createGift(CROWN, unicode"왕관", 4 ether, "crown-shimmer");
    }

    /*//////////////////////////////////////////////////////////////
                            DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_deployment() public view {
        assertEq(giftShop.platformFee(), PLATFORM_FEE);
        assertEq(giftShop.owner(), owner);
    }

    function test_deployment_revertsOnInvalidFee() public {
        vm.expectRevert(IGiftShop.InvalidFee.selector);
        new GiftShop(1001);
    }

    /*//////////////////////////////////////////////////////////////
                          GIFT CREATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_createGift() public view {
        IGiftShop.Gift memory gift = giftShop.getGift(HEART);
        assertEq(gift.id, HEART);
        assertEq(gift.name, unicode"하트");
        assertEq(gift.price, 0.25 ether);
        assertEq(gift.animationURI, "heart-float");
        assertTrue(gift.active);
    }

    function test_createGift_revertsOnDuplicate() public {
        vm.expectRevert(IGiftShop.GiftAlreadyExists.selector);
        giftShop.createGift(HEART, "Duplicate", 1 ether, "uri");
    }

    function test_createGift_revertsOnEmptyName() public {
        vm.expectRevert(IGiftShop.EmptyName.selector);
        giftShop.createGift(99, "", 1 ether, "uri");
    }

    function test_createGift_revertsOnZeroPrice() public {
        vm.expectRevert(IGiftShop.ZeroPrice.selector);
        giftShop.createGift(99, "Gift", 0, "uri");
    }

    function test_createGift_revertsIfNotOwner() public {
        vm.prank(viewer1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", viewer1));
        giftShop.createGift(99, "Gift", 1 ether, "uri");
    }

    function test_getAllGifts() public view {
        IGiftShop.Gift[] memory gifts = giftShop.getAllGifts();
        assertEq(gifts.length, 4);
        assertEq(gifts[0].id, HEART);
        assertEq(gifts[1].id, STAR);
        assertEq(gifts[2].id, ROCKET);
        assertEq(gifts[3].id, CROWN);
    }

    /*//////////////////////////////////////////////////////////////
                          GIFT UPDATE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_updateGift() public {
        giftShop.updateGift(HEART, "Updated Heart", 2 ether, "new-uri");

        IGiftShop.Gift memory gift = giftShop.getGift(HEART);
        assertEq(gift.name, "Updated Heart");
        assertEq(gift.price, 2 ether);
        assertEq(gift.animationURI, "new-uri");
    }

    function test_deactivateGift() public {
        giftShop.deactivateGift(HEART);

        IGiftShop.Gift memory gift = giftShop.getGift(HEART);
        assertFalse(gift.active);
    }

    /*//////////////////////////////////////////////////////////////
                           SEND GIFT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_sendGift() public {
        uint256 quantity = 5;
        uint256 totalCost = 0.25 ether * quantity; // 1.25 ether
        uint256 fee = (totalCost * PLATFORM_FEE) / 10000;
        uint256 net = totalCost - fee;

        vm.prank(viewer1);
        vm.expectEmit(true, true, true, true);
        emit GiftSent(viewer1, streamer1, HEART, quantity, totalCost);
        giftShop.sendGift{value: totalCost}(streamer1, HEART, quantity);

        assertEq(giftShop.getStreamerRevenue(streamer1), net);
        assertEq(giftShop.getPlatformFeesAccumulated(), fee);
    }

    function test_sendGift_revertsOnZeroAddress() public {
        vm.prank(viewer1);
        vm.expectRevert(IGiftShop.ZeroAddress.selector);
        giftShop.sendGift{value: 0.25 ether}(address(0), HEART, 1);
    }

    function test_sendGift_revertsOnZeroQuantity() public {
        vm.prank(viewer1);
        vm.expectRevert(IGiftShop.ZeroAmount.selector);
        giftShop.sendGift{value: 0}(streamer1, HEART, 0);
    }

    function test_sendGift_revertsOnInvalidGift() public {
        vm.prank(viewer1);
        vm.expectRevert(IGiftShop.GiftNotFound.selector);
        giftShop.sendGift{value: 1 ether}(streamer1, 999, 1);
    }

    function test_sendGift_revertsOnInactiveGift() public {
        giftShop.deactivateGift(HEART);

        vm.prank(viewer1);
        vm.expectRevert(IGiftShop.GiftNotActive.selector);
        giftShop.sendGift{value: 0.25 ether}(streamer1, HEART, 1);
    }

    function test_sendGift_revertsOnInvalidPayment() public {
        vm.prank(viewer1);
        vm.expectRevert(IGiftShop.InvalidPayment.selector);
        giftShop.sendGift{value: 0.1 ether}(streamer1, HEART, 1); // Wrong amount
    }

    /*//////////////////////////////////////////////////////////////
                         WITHDRAW TESTS
    //////////////////////////////////////////////////////////////*/

    function test_withdrawRevenue() public {
        uint256 totalCost = 4 ether; // Crown is now 4 native
        uint256 fee = (totalCost * PLATFORM_FEE) / 10000;
        uint256 net = totalCost - fee;

        vm.prank(viewer1);
        giftShop.sendGift{value: totalCost}(streamer1, CROWN, 1);

        uint256 streamerBalanceBefore = streamer1.balance;
        vm.prank(streamer1);
        vm.expectEmit(true, false, false, true);
        emit RevenueWithdrawn(streamer1, net);
        giftShop.withdrawRevenue();

        assertEq(streamer1.balance - streamerBalanceBefore, net);
        assertEq(giftShop.getStreamerRevenue(streamer1), 0);
    }

    function test_withdrawRevenue_revertsOnInsufficientBalance() public {
        vm.prank(streamer1);
        vm.expectRevert(IGiftShop.InsufficientBalance.selector);
        giftShop.withdrawRevenue();
    }

    function test_withdrawPlatformFees() public {
        uint256 totalCost = 4 ether; // Crown is now 4 native
        uint256 fee = (totalCost * PLATFORM_FEE) / 10000;

        vm.prank(viewer1);
        giftShop.sendGift{value: totalCost}(streamer1, CROWN, 1);

        address treasury = address(0x999);
        uint256 treasuryBalanceBefore = treasury.balance;
        vm.expectEmit(true, false, false, true);
        emit PlatformFeesWithdrawn(treasury, fee);
        giftShop.withdrawPlatformFees(treasury);

        assertEq(treasury.balance - treasuryBalanceBefore, fee);
    }

    /*//////////////////////////////////////////////////////////////
                            FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_sendGift(uint256 quantity) public {
        quantity = bound(quantity, 1, 100);

        uint256 totalCost = 0.25 ether * quantity; // Heart is 0.25 native
        uint256 fee = (totalCost * PLATFORM_FEE) / 10000;
        uint256 net = totalCost - fee;

        vm.prank(viewer1);
        giftShop.sendGift{value: totalCost}(streamer1, HEART, quantity);

        assertEq(giftShop.getStreamerRevenue(streamer1), net);
        assertEq(giftShop.getPlatformFeesAccumulated(), fee);
    }
}
