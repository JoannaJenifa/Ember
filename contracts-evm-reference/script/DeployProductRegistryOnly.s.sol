// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ProductRegistry} from "@/ProductRegistry.sol";

/// @title DeployProductRegistryOnly
/// @notice Deploy a new ProductRegistry with paris EVM version
contract DeployProductRegistryOnly is Script {
    address constant SELLER_REGISTRY = 0xa7605db830DBAF9a421ADe8579Bf7a255c875292;
    address constant OWNER = 0x32FE11d9900D63350016374BE98ff37c3Af75847;

    function run() public {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        if (deployerPrivateKey == 0) {
            string memory pkHex = vm.envString("PRIVATE_KEY");
            deployerPrivateKey = vm.parseUint(string.concat("0x", pkHex));
        }

        console2.log("Deployer:", vm.addr(deployerPrivateKey));

        vm.startBroadcast(deployerPrivateKey);

        ProductRegistry productRegistry = new ProductRegistry(SELLER_REGISTRY, OWNER);
        console2.log("ProductRegistry deployed at:", address(productRegistry));
        console2.log("SellerRegistry:", productRegistry.sellerRegistry());
        console2.log("Owner:", productRegistry.owner());

        vm.stopBroadcast();
    }
}
