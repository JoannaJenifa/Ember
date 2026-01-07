// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ProductRegistry} from "@/ProductRegistry.sol";

/// @title DeployProductRegistryScript
/// @notice Deploys only ProductRegistry with adminCreateProduct function
contract DeployProductRegistryScript is Script {
    // Existing SellerRegistry on Polygon Amoy
    address constant SELLER_REGISTRY = 0xDCE0738284b2dD48883dDd46f4939b171f06db2d;

    function run() public {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        if (deployerPrivateKey == 0) {
            string memory pkHex = vm.envString("PRIVATE_KEY");
            deployerPrivateKey = vm.parseUint(string.concat("0x", pkHex));
        }
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deployer:", deployer);
        console2.log("Using SellerRegistry:", SELLER_REGISTRY);

        vm.startBroadcast(deployerPrivateKey);

        ProductRegistry productRegistry = new ProductRegistry(SELLER_REGISTRY, deployer);
        console2.log("ProductRegistry deployed at:", address(productRegistry));

        vm.stopBroadcast();
    }
}
