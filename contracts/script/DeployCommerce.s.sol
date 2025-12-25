// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseScript} from "./Base.s.sol";
import {OrderEscrow} from "@/OrderEscrow.sol";
import {ReviewRegistry} from "@/ReviewRegistry.sol";
import {SellerRegistry} from "@/SellerRegistry.sol";
import {ProductRegistry} from "@/ProductRegistry.sol";
import {console2} from "forge-std/console2.sol";

/// @title DeployCommerceScript
/// @notice Deployment script for Labang commerce contracts using native currency
contract DeployCommerceScript is BaseScript {
    /// @notice Main deployment function
    function run() public returns (OrderEscrow escrow, ReviewRegistry registry) {
        // Start deployment
        startDeployment();

        address deployer = msg.sender;
        address treasury = deployer; // Use deployer as treasury for now

        // Deploy SellerRegistry
        SellerRegistry sellerRegistry = deploySellerRegistry(deployer);
        saveDeployment("SellerRegistry", address(sellerRegistry));

        // Deploy ProductRegistry
        ProductRegistry productRegistry = deployProductRegistry(address(sellerRegistry), deployer);
        saveDeployment("ProductRegistry", address(productRegistry));

        // Deploy OrderEscrow (native currency)
        escrow = deployOrderEscrow(treasury, address(sellerRegistry), address(productRegistry), deployer);
        saveDeployment("OrderEscrow", address(escrow));

        // Deploy ReviewRegistry
        registry = deployReviewRegistry(address(escrow), deployer);
        saveDeployment("ReviewRegistry", address(registry));

        // Authorize OrderEscrow
        sellerRegistry.setAuthorizedCaller(address(escrow), true);
        productRegistry.setAuthorizedCaller(address(escrow), true);

        // End deployment
        endDeployment();

        // Log summary
        console2.log("\n=== COMMERCE DEPLOYMENT COMPLETE ===");
        console2.log("SellerRegistry:", address(sellerRegistry));
        console2.log("ProductRegistry:", address(productRegistry));
        console2.log("OrderEscrow:", address(escrow));
        console2.log("ReviewRegistry:", address(registry));
        console2.log("Treasury:", treasury);
        console2.log("Chain ID:", block.chainid);

        return (escrow, registry);
    }

    function deploySellerRegistry(address owner) internal returns (SellerRegistry) {
        console2.log("\nDeploying SellerRegistry...");
        SellerRegistry registry = new SellerRegistry(owner);
        console2.log("SellerRegistry deployed to:", address(registry));
        return registry;
    }

    function deployProductRegistry(address sellerRegistry, address owner) internal returns (ProductRegistry) {
        console2.log("\nDeploying ProductRegistry...");
        ProductRegistry registry = new ProductRegistry(sellerRegistry, owner);
        console2.log("ProductRegistry deployed to:", address(registry));
        return registry;
    }

    function deployOrderEscrow(
        address treasury,
        address sellerRegistry,
        address productRegistry,
        address owner
    ) internal returns (OrderEscrow) {
        console2.log("\nDeploying OrderEscrow (native currency)...");
        OrderEscrow escrow = new OrderEscrow(treasury, sellerRegistry, productRegistry, owner);
        console2.log("OrderEscrow deployed to:", address(escrow));
        return escrow;
    }

    function deployReviewRegistry(address escrow, address owner) internal returns (ReviewRegistry) {
        console2.log("\nDeploying ReviewRegistry...");
        ReviewRegistry registry = new ReviewRegistry(escrow, owner);
        console2.log("ReviewRegistry deployed to:", address(registry));
        return registry;
    }
}
