// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseScript} from "./Base.s.sol";
import {Counter} from "@/Counter.sol";
import {GiftShop} from "@/GiftShop.sol";
import {console2} from "forge-std/console2.sol";

/// @title InteractionsScript
/// @notice Scripts for interacting with deployed contracts
contract InteractionsScript is BaseScript {
    /// @notice Increment the counter
    function increment() public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        console2.log("Current count:", counter.count());
        
        counter.increment();
        
        console2.log("New count:", counter.count());
        
        endDeployment();
    }

    /// @notice Increment by a specific amount
    function incrementBy(uint256 amount) public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        console2.log("Current count:", counter.count());
        
        counter.incrementBy(amount);
        
        console2.log("Incremented by:", amount);
        console2.log("New count:", counter.count());
        
        endDeployment();
    }

    /// @notice Reset the counter (only owner)
    function reset() public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        console2.log("Current count:", counter.count());
        console2.log("Current owner:", counter.owner());
        console2.log("Caller:", config.deployer);
        
        require(counter.owner() == config.deployer, "Caller is not the owner");
        
        counter.reset();
        
        console2.log("Counter reset. New count:", counter.count());
        
        endDeployment();
    }

    /// @notice Transfer ownership
    function transferOwnership(address newOwner) public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        console2.log("Current owner:", counter.owner());
        
        require(counter.owner() == config.deployer, "Caller is not the owner");
        
        counter.transferOwnership(newOwner);
        
        console2.log("Ownership transferred to:", newOwner);
        
        endDeployment();
    }

    /// @notice Get contract information
    function getInfo() public view {
        Counter counter = Counter(loadDeployment("Counter"));
        
        console2.log("====================================");
        console2.log("Counter Contract Information");
        console2.log("====================================");
        console2.log("Address:", address(counter));
        console2.log("Current count:", counter.count());
        console2.log("Owner:", counter.owner());
        console2.log("====================================");
    }

    /// @notice Batch operations example
    function batchOperations() public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        
        console2.log("Starting batch operations...");
        console2.log("Initial count:", counter.count());
        
        // Perform multiple operations
        counter.increment();
        console2.log("After increment:", counter.count());
        
        counter.incrementBy(5);
        console2.log("After incrementBy(5):", counter.count());
        
        if (counter.count() > 0) {
            counter.decrement();
            console2.log("After decrement:", counter.count());
        }
        
        console2.log("Batch operations completed");
        
        endDeployment();
    }

    /// @notice Simulate a complex scenario
    function simulateScenario() public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        
        console2.log("====================================");
        console2.log("Simulating Complex Scenario");
        console2.log("====================================");
        
        // Reset if owner
        if (counter.owner() == config.deployer && counter.count() > 0) {
            console2.log("Resetting counter...");
            counter.reset();
        }
        
        // Simulate multiple users
        uint256 numUsers = 5;
        for (uint256 i = 0; i < numUsers; i++) {
            counter.incrementBy(i + 1);
            console2.log("User", i, "incremented by", i + 1);
            console2.log("Current count:", counter.count());
        }
        
        console2.log("Final count:", counter.count());
        console2.log("====================================");
        
        endDeployment();
    }
}

/// @title GiftShopInteractionsScript
/// @notice Scripts for interacting with GiftShop contract
contract GiftShopInteractionsScript is BaseScript {
    // New gift prices (lower denominations)
    uint256 constant NEW_HEART_PRICE = 0.25 ether;
    uint256 constant NEW_STAR_PRICE = 0.5 ether;
    uint256 constant NEW_ROCKET_PRICE = 1 ether;
    uint256 constant NEW_CROWN_PRICE = 4 ether;

    /// @notice Update all gift prices to new lower denominations
    /// Run: forge script script/Interactions.s.sol:GiftShopInteractionsScript --sig "updateGiftPrices()" --rpc-url polygon_amoy --broadcast
    function updateGiftPrices() public {
        DeploymentConfig memory config = startDeployment();

        address payable giftShopAddr = payable(vm.envAddress("GIFT_SHOP_ADDRESS"));
        GiftShop giftShop = GiftShop(giftShopAddr);

        console2.log("Updating GiftShop prices at:", giftShopAddr);
        console2.log("Owner:", giftShop.owner());
        console2.log("Caller:", config.deployer);

        // Update Heart: 0.25 VERY
        giftShop.updateGift(1, unicode"하트", NEW_HEART_PRICE, "heart-float");
        console2.log("Updated Heart to 0.25 VERY");

        // Update Star: 0.5 VERY
        giftShop.updateGift(2, unicode"별", NEW_STAR_PRICE, "star-burst");
        console2.log("Updated Star to 0.5 VERY");

        // Update Rocket: 1 VERY
        giftShop.updateGift(3, unicode"로켓", NEW_ROCKET_PRICE, "rocket-launch");
        console2.log("Updated Rocket to 1 VERY");

        // Update Crown: 4 VERY
        giftShop.updateGift(4, unicode"왕관", NEW_CROWN_PRICE, "crown-shimmer");
        console2.log("Updated Crown to 4 VERY");

        console2.log("\nAll gift prices updated!");

        endDeployment();
    }

    /// @notice Get current gift prices
    function getGiftPrices() public view {
        address payable giftShopAddr = payable(vm.envAddress("GIFT_SHOP_ADDRESS"));
        GiftShop giftShop = GiftShop(giftShopAddr);

        console2.log("====================================");
        console2.log("GiftShop:", giftShopAddr);
        console2.log("====================================");

        GiftShop.Gift[] memory gifts = giftShop.getAllGifts();
        for (uint256 i = 0; i < gifts.length; i++) {
            console2.log("Gift", gifts[i].id);
            console2.log("  Name:", gifts[i].name);
            console2.log("  Price:", gifts[i].price / 1e18, "VERY");
            console2.log("  Active:", gifts[i].active);
        }

        console2.log("====================================");
    }
}

/// @title DebugScript
/// @notice Debug and inspect deployed contracts
contract DebugScript is BaseScript {
    /// @notice Check deployment status
    function checkDeployment() public view {
        console2.log("====================================");
        console2.log("Deployment Check");
        console2.log("====================================");
        console2.log("Chain ID:", block.chainid);
        console2.log("Chain Name:", getChainName());
        console2.log("Is Testnet:", isTestnet());
        console2.log("Is Local:", isLocal());
        
        // Try to load Counter deployment
        try this.tryLoadCounter() returns (address counterAddr) {
            console2.log("Counter deployed at:", counterAddr);
            
            Counter counter = Counter(counterAddr);
            console2.log("- Count:", counter.count());
            console2.log("- Owner:", counter.owner());
        } catch {
            console2.log("Counter not deployed on this network");
        }
        
        console2.log("====================================");
    }

    /// @notice Helper to try loading Counter
    function tryLoadCounter() external view returns (address) {
        return loadDeployment("Counter");
    }

    /// @notice Estimate gas for operations
    function estimateGas() public {
        Counter counter = Counter(loadDeployment("Counter"));
        
        console2.log("====================================");
        console2.log("Gas Estimation");
        console2.log("====================================");
        
        // Estimate increment
        uint256 incrementGas = gasleft();
        try counter.increment() {} catch {}
        incrementGas = incrementGas - gasleft();
        console2.log("Increment gas:", incrementGas);
        
        // Estimate incrementBy
        uint256 incrementByGas = gasleft();
        try counter.incrementBy(10) {} catch {}
        incrementByGas = incrementByGas - gasleft();
        console2.log("IncrementBy(10) gas:", incrementByGas);
        
        // Estimate decrement
        uint256 decrementGas = gasleft();
        try counter.decrement() {} catch {}
        decrementGas = decrementGas - gasleft();
        console2.log("Decrement gas:", decrementGas);
        
        console2.log("====================================");
    }
}