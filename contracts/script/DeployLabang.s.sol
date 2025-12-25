// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {TipJar} from "@/TipJar.sol";
import {GiftShop} from "@/GiftShop.sol";
import {OrderEscrow} from "@/OrderEscrow.sol";
import {ReviewRegistry} from "@/ReviewRegistry.sol";
import {SellerRegistry} from "@/SellerRegistry.sol";
import {ProductRegistry} from "@/ProductRegistry.sol";

/// @title DeployLabangScript
/// @notice Simple deployment script for all Labang contracts
/// @dev Uses native currency (POL on testnet, VERY on mainnet)
contract DeployLabangScript is Script {
    uint256 constant PLATFORM_FEE = 200; // 2%

    function run() public {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        if (deployerPrivateKey == 0) {
            // Try with 0x prefix
            string memory pkHex = vm.envString("PRIVATE_KEY");
            deployerPrivateKey = vm.parseUint(string.concat("0x", pkHex));
        }
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deployer:", deployer);
        console2.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

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

        // 5. Initialize gifts (lower denominations: 0.25, 0.5, 1, 4 native)
        giftShop.createGift(1, unicode"하트", 0.25 ether, "heart-float");
        giftShop.createGift(2, unicode"별", 0.5 ether, "star-burst");
        giftShop.createGift(3, unicode"로켓", 1 ether, "rocket-launch");
        giftShop.createGift(4, unicode"왕관", 4 ether, "crown-shimmer");
        console2.log("Gifts initialized");

        // 6. Deploy OrderEscrow (with registries, native currency)
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

        // 8. Authorize OrderEscrow to record sales
        sellerRegistry.setAuthorizedCaller(address(orderEscrow), true);
        productRegistry.setAuthorizedCaller(address(orderEscrow), true);
        console2.log("OrderEscrow authorized for sales recording");

        vm.stopBroadcast();

        // Summary
        console2.log("\n========================================");
        console2.log("DEPLOYMENT COMPLETE");
        console2.log("========================================");
        console2.log("SellerRegistry:", address(sellerRegistry));
        console2.log("ProductRegistry:", address(productRegistry));
        console2.log("TipJar:", address(tipJar));
        console2.log("GiftShop:", address(giftShop));
        console2.log("OrderEscrow:", address(orderEscrow));
        console2.log("ReviewRegistry:", address(reviewRegistry));
    }
}
