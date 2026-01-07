// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../../src/TipJar.sol";

contract TipJarTest is Test {
    TipJar public tipJar;

    address public owner = address(this);
    address public streamer1 = address(0x1);
    address public streamer2 = address(0x2);
    address public viewer1 = address(0x3);
    address public viewer2 = address(0x4);

    uint256 public constant PLATFORM_FEE = 200; // 2%
    uint256 public constant INITIAL_BALANCE = 10000 ether;

    event TipSent(address indexed from, address indexed streamerId, uint256 amount, string message, uint256 timestamp);
    event TipsWithdrawn(address indexed streamerId, uint256 amount);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event PlatformFeesWithdrawn(address indexed to, uint256 amount);

    function setUp() public {
        tipJar = new TipJar(PLATFORM_FEE);

        // Fund viewers with native currency
        vm.deal(viewer1, INITIAL_BALANCE);
        vm.deal(viewer2, INITIAL_BALANCE);
    }

    /*//////////////////////////////////////////////////////////////
                            DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_deployment() public view {
        assertEq(tipJar.platformFee(), PLATFORM_FEE);
        assertEq(tipJar.owner(), owner);
    }

    function test_deployment_revertsOnInvalidFee() public {
        vm.expectRevert(ITipJar.InvalidFee.selector);
        new TipJar(1001); // > 10%
    }

    /*//////////////////////////////////////////////////////////////
                              TIP TESTS
    //////////////////////////////////////////////////////////////*/

    function test_tip() public {
        uint256 amount = 100 ether;
        uint256 expectedFee = (amount * PLATFORM_FEE) / 10000; // 2 ether
        uint256 expectedStreamerAmount = amount - expectedFee; // 98 ether

        vm.prank(viewer1);
        vm.expectEmit(true, true, false, true);
        emit TipSent(viewer1, streamer1, expectedStreamerAmount, "Great stream!", block.timestamp);
        tipJar.tip{value: amount}(streamer1, "Great stream!");

        assertEq(tipJar.getStreamerBalance(streamer1), expectedStreamerAmount);
        assertEq(tipJar.getTotalTipsReceived(streamer1), expectedStreamerAmount);
        assertEq(tipJar.getPlatformFeesAccumulated(), expectedFee);
    }

    function test_tip_multipleTips() public {
        uint256 amount = 100 ether;
        uint256 fee = (amount * PLATFORM_FEE) / 10000;
        uint256 net = amount - fee;

        vm.startPrank(viewer1);
        tipJar.tip{value: amount}(streamer1, "Tip 1");
        tipJar.tip{value: amount}(streamer1, "Tip 2");
        tipJar.tip{value: amount}(streamer1, "Tip 3");
        vm.stopPrank();

        assertEq(tipJar.getStreamerBalance(streamer1), net * 3);
        assertEq(tipJar.getPlatformFeesAccumulated(), fee * 3);
    }

    function test_tip_revertsOnZeroAddress() public {
        vm.prank(viewer1);
        vm.expectRevert(ITipJar.ZeroAddress.selector);
        tipJar.tip{value: 100 ether}(address(0), "");
    }

    function test_tip_revertsOnZeroAmount() public {
        vm.prank(viewer1);
        vm.expectRevert(ITipJar.ZeroAmount.selector);
        tipJar.tip{value: 0}(streamer1, "");
    }

    /*//////////////////////////////////////////////////////////////
                           WITHDRAW TESTS
    //////////////////////////////////////////////////////////////*/

    function test_withdrawTips() public {
        uint256 amount = 100 ether;
        uint256 fee = (amount * PLATFORM_FEE) / 10000;
        uint256 net = amount - fee;

        // Send tip
        vm.prank(viewer1);
        tipJar.tip{value: amount}(streamer1, "");

        // Withdraw
        uint256 streamerBalanceBefore = streamer1.balance;
        vm.prank(streamer1);
        vm.expectEmit(true, false, false, true);
        emit TipsWithdrawn(streamer1, net);
        tipJar.withdrawTips();

        assertEq(streamer1.balance - streamerBalanceBefore, net);
        assertEq(tipJar.getStreamerBalance(streamer1), 0);
    }

    function test_withdrawTips_revertsOnInsufficientBalance() public {
        vm.prank(streamer1);
        vm.expectRevert(ITipJar.InsufficientBalance.selector);
        tipJar.withdrawTips();
    }

    /*//////////////////////////////////////////////////////////////
                          OWNER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function test_setPlatformFee() public {
        uint256 newFee = 300; // 3%

        vm.expectEmit(false, false, false, true);
        emit PlatformFeeUpdated(PLATFORM_FEE, newFee);
        tipJar.setPlatformFee(newFee);

        assertEq(tipJar.platformFee(), newFee);
    }

    function test_setPlatformFee_revertsIfNotOwner() public {
        vm.prank(viewer1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", viewer1));
        tipJar.setPlatformFee(300);
    }

    function test_setPlatformFee_revertsOnInvalidFee() public {
        vm.expectRevert(ITipJar.InvalidFee.selector);
        tipJar.setPlatformFee(1001);
    }

    function test_withdrawPlatformFees() public {
        uint256 amount = 100 ether;
        uint256 fee = (amount * PLATFORM_FEE) / 10000;

        vm.prank(viewer1);
        tipJar.tip{value: amount}(streamer1, "");

        address treasury = address(0x999);
        uint256 treasuryBalanceBefore = treasury.balance;
        vm.expectEmit(true, false, false, true);
        emit PlatformFeesWithdrawn(treasury, fee);
        tipJar.withdrawPlatformFees(treasury);

        assertEq(treasury.balance - treasuryBalanceBefore, fee);
        assertEq(tipJar.getPlatformFeesAccumulated(), 0);
    }

    function test_withdrawPlatformFees_revertsIfNotOwner() public {
        vm.prank(viewer1);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", viewer1));
        tipJar.withdrawPlatformFees(viewer1);
    }

    function test_withdrawPlatformFees_revertsOnZeroAddress() public {
        vm.prank(viewer1);
        tipJar.tip{value: 100 ether}(streamer1, "");

        vm.expectRevert(ITipJar.ZeroAddress.selector);
        tipJar.withdrawPlatformFees(address(0));
    }

    function test_withdrawPlatformFees_revertsOnInsufficientBalance() public {
        vm.expectRevert(ITipJar.InsufficientBalance.selector);
        tipJar.withdrawPlatformFees(owner);
    }

    /*//////////////////////////////////////////////////////////////
                            FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzz_tip(uint256 amount) public {
        amount = bound(amount, 1, INITIAL_BALANCE);

        uint256 fee = (amount * PLATFORM_FEE) / 10000;
        uint256 net = amount - fee;

        vm.prank(viewer1);
        tipJar.tip{value: amount}(streamer1, "");

        assertEq(tipJar.getStreamerBalance(streamer1), net);
        assertEq(tipJar.getPlatformFeesAccumulated(), fee);
    }
}
