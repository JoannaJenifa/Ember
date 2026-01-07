// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {SellerRegistry} from "@/SellerRegistry.sol";

/// @title RegisterSellersScript
/// @notice Register additional sellers on existing SellerRegistry
contract RegisterSellersScript is Script {
    address constant SELLER_REGISTRY = 0xDCE0738284b2dD48883dDd46f4939b171f06db2d;

    // Test wallet addresses for sellers
    address constant FASHION_SELLER = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    address constant FOOD_SELLER = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
    address constant ELECTRONICS_SELLER = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;
    address constant HOME_SELLER = 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65;

    function run() public {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        if (deployerPrivateKey == 0) {
            string memory pkHex = vm.envString("PRIVATE_KEY");
            deployerPrivateKey = vm.parseUint(string.concat("0x", pkHex));
        }

        vm.startBroadcast(deployerPrivateKey);

        SellerRegistry sellerRegistry = SellerRegistry(SELLER_REGISTRY);
        console2.log("SellerRegistry:", SELLER_REGISTRY);
        console2.log("Total sellers before:", sellerRegistry.totalSellers());

        // Register Fashion Seller
        if (!sellerRegistry.isRegisteredSeller(FASHION_SELLER)) {
            sellerRegistry.adminRegisterSeller(
                FASHION_SELLER,
                "Seoul Street Fashion",
                "fashion",
                '{"shopNameKo":"\\uc11c\\uc6b8 \\uc2a4\\ud2b8\\ub9bf \\ud328\\uc158","description":"Trendy Korean street fashion","profileImage":"https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400","bannerImage":"https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200"}'
            );
            console2.log("Registered: Seoul Street Fashion");
        }

        // Register Food Seller
        if (!sellerRegistry.isRegisteredSeller(FOOD_SELLER)) {
            sellerRegistry.adminRegisterSeller(
                FOOD_SELLER,
                "K-Food Market",
                "food",
                '{"shopNameKo":"\\ucf00\\uc774\\ud478\\ub4dc \\ub9c8\\ucf13","description":"Authentic Korean food","profileImage":"https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400","bannerImage":"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200"}'
            );
            console2.log("Registered: K-Food Market");
        }

        // Register Electronics Seller
        if (!sellerRegistry.isRegisteredSeller(ELECTRONICS_SELLER)) {
            sellerRegistry.adminRegisterSeller(
                ELECTRONICS_SELLER,
                "TechHub Korea",
                "electronics",
                '{"shopNameKo":"\\ud14c\\ud06c\\ud5c8\\ube0c \\ucf54\\ub9ac\\uc544","description":"Premium electronics","profileImage":"https://images.unsplash.com/photo-1518770660439-4636190af475?w=400","bannerImage":"https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200"}'
            );
            console2.log("Registered: TechHub Korea");
        }

        // Register Home Seller
        if (!sellerRegistry.isRegisteredSeller(HOME_SELLER)) {
            sellerRegistry.adminRegisterSeller(
                HOME_SELLER,
                "Hanok Home",
                "home",
                '{"shopNameKo":"\\ud55c\\uc625 \\ud648","description":"Traditional Korean home decor","profileImage":"https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400","bannerImage":"https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200"}'
            );
            console2.log("Registered: Hanok Home");
        }

        console2.log("Total sellers after:", sellerRegistry.totalSellers());

        vm.stopBroadcast();
    }
}
