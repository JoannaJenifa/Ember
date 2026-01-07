// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseScript} from "./Base.s.sol";
import {TipJar} from "@/TipJar.sol";
import {GiftShop} from "@/GiftShop.sol";
import {console2} from "forge-std/console2.sol";

/// @title DeployEngagementScript
/// @notice Deployment script for TipJar and GiftShop engagement contracts
/// @dev Uses native currency (POL on testnet, VERY on mainnet)
contract DeployEngagementScript is BaseScript {
    // Configuration
    uint256 constant PLATFORM_FEE = 200; // 2% in basis points

    // Default gift prices in native currency (18 decimals) - lower denominations
    uint256 constant HEART_PRICE = 0.25 ether;
    uint256 constant STAR_PRICE = 0.5 ether;
    uint256 constant ROCKET_PRICE = 1 ether;
    uint256 constant CROWN_PRICE = 4 ether;

    /// @notice Main deployment function
    function run() public returns (TipJar tipJar, GiftShop giftShop) {
        // Start deployment
        startDeployment();

        // Deploy TipJar (native currency)
        tipJar = deployTipJar();
        saveDeployment("TipJar", address(tipJar));

        // Deploy GiftShop (native currency)
        giftShop = deployGiftShop();
        saveDeployment("GiftShop", address(giftShop));

        // Initialize default gifts
        initializeGifts(giftShop);

        // End deployment
        endDeployment();

        // Log summary
        console2.log("\n=== ENGAGEMENT CONTRACTS DEPLOYED ===");
        console2.log("TipJar:", address(tipJar));
        console2.log("GiftShop:", address(giftShop));
        console2.log("Platform Fee:", PLATFORM_FEE, "basis points (2%)");
        console2.log("Chain ID:", block.chainid);

        return (tipJar, giftShop);
    }

    /// @notice Deploy TipJar contract
    function deployTipJar() internal returns (TipJar) {
        console2.log("\nDeploying TipJar (native currency)...");
        console2.log("- Platform Fee:", PLATFORM_FEE, "basis points");

        TipJar tipJar = new TipJar(PLATFORM_FEE);

        console2.log("TipJar deployed to:", address(tipJar));
        console2.log("TipJar owner:", tipJar.owner());

        return tipJar;
    }

    /// @notice Deploy GiftShop contract
    function deployGiftShop() internal returns (GiftShop) {
        console2.log("\nDeploying GiftShop (native currency)...");
        console2.log("- Platform Fee:", PLATFORM_FEE, "basis points");

        GiftShop giftShop = new GiftShop(PLATFORM_FEE);

        console2.log("GiftShop deployed to:", address(giftShop));
        console2.log("GiftShop owner:", giftShop.owner());

        return giftShop;
    }

    /// @notice Initialize default gifts in GiftShop
    function initializeGifts(GiftShop giftShop) internal {
        console2.log("\nInitializing default gifts...");

        // Heart - 0.25 native
        giftShop.createGift(1, unicode"하트", HEART_PRICE, "heart-float");
        console2.log("- Created Heart (0.25)");

        // Star - 0.5 native
        giftShop.createGift(2, unicode"별", STAR_PRICE, "star-burst");
        console2.log("- Created Star (0.5)");

        // Rocket - 1 native
        giftShop.createGift(3, unicode"로켓", ROCKET_PRICE, "rocket-launch");
        console2.log("- Created Rocket (1)");

        // Crown - 4 native
        giftShop.createGift(4, unicode"왕관", CROWN_PRICE, "crown-shimmer");
        console2.log("- Created Crown (4)");

        console2.log("Default gifts initialized!");
    }
}
