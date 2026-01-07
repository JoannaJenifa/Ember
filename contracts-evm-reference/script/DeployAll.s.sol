// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseScript} from "./Base.s.sol";
import {TipJar} from "@/TipJar.sol";
import {GiftShop} from "@/GiftShop.sol";
import {OrderEscrow} from "@/OrderEscrow.sol";
import {ReviewRegistry} from "@/ReviewRegistry.sol";
import {SellerRegistry} from "@/SellerRegistry.sol";
import {ProductRegistry} from "@/ProductRegistry.sol";
import {console2} from "forge-std/console2.sol";

/// @title DeployAllScript
/// @notice Deploys all Labang contracts using native currency
contract DeployAllScript is BaseScript {
    // Configuration
    uint256 constant PLATFORM_FEE = 200; // 2% in basis points

    // Gift prices in native currency (18 decimals) - lower denominations
    uint256 constant HEART_PRICE = 0.25 ether;
    uint256 constant STAR_PRICE = 0.5 ether;
    uint256 constant ROCKET_PRICE = 1 ether;
    uint256 constant CROWN_PRICE = 4 ether;

    function run() public {
        // Start deployment
        DeploymentConfig memory config = startDeployment();
        address deployer = config.deployer;

        // 1. Deploy SellerRegistry
        console2.log("\n=== Deploying SellerRegistry ===");
        SellerRegistry sellerRegistry = new SellerRegistry(deployer);
        console2.log("SellerRegistry:", address(sellerRegistry));

        // 2. Deploy ProductRegistry
        console2.log("\n=== Deploying ProductRegistry ===");
        ProductRegistry productRegistry = new ProductRegistry(address(sellerRegistry), deployer);
        console2.log("ProductRegistry:", address(productRegistry));

        // 3. Deploy TipJar (native currency)
        console2.log("\n=== Deploying TipJar ===");
        TipJar tipJar = new TipJar(PLATFORM_FEE);
        console2.log("TipJar:", address(tipJar));

        // 4. Deploy GiftShop (native currency)
        console2.log("\n=== Deploying GiftShop ===");
        GiftShop giftShop = new GiftShop(PLATFORM_FEE);
        console2.log("GiftShop:", address(giftShop));

        // 5. Initialize default gifts
        console2.log("\n=== Initializing Gifts ===");
        giftShop.createGift(1, unicode"하트", HEART_PRICE, "heart-float");
        giftShop.createGift(2, unicode"별", STAR_PRICE, "star-burst");
        giftShop.createGift(3, unicode"로켓", ROCKET_PRICE, "rocket-launch");
        giftShop.createGift(4, unicode"왕관", CROWN_PRICE, "crown-shimmer");
        console2.log("4 gifts created");

        // 6. Deploy OrderEscrow (native currency)
        console2.log("\n=== Deploying OrderEscrow ===");
        OrderEscrow orderEscrow = new OrderEscrow(
            deployer, // treasury
            address(sellerRegistry),
            address(productRegistry),
            deployer  // owner
        );
        console2.log("OrderEscrow:", address(orderEscrow));

        // 7. Deploy ReviewRegistry
        console2.log("\n=== Deploying ReviewRegistry ===");
        ReviewRegistry reviewRegistry = new ReviewRegistry(address(orderEscrow), deployer);
        console2.log("ReviewRegistry:", address(reviewRegistry));

        // 8. Authorize OrderEscrow
        sellerRegistry.setAuthorizedCaller(address(orderEscrow), true);
        productRegistry.setAuthorizedCaller(address(orderEscrow), true);
        console2.log("OrderEscrow authorized");

        // End deployment
        endDeployment();

        // Summary
        console2.log("\n========================================");
        console2.log("=== DEPLOYMENT COMPLETE ===");
        console2.log("========================================");
        console2.log("Chain ID:", block.chainid);
        console2.log("SellerRegistry:", address(sellerRegistry));
        console2.log("ProductRegistry:", address(productRegistry));
        console2.log("TipJar:", address(tipJar));
        console2.log("GiftShop:", address(giftShop));
        console2.log("OrderEscrow:", address(orderEscrow));
        console2.log("ReviewRegistry:", address(reviewRegistry));
        console2.log("========================================");
    }
}
