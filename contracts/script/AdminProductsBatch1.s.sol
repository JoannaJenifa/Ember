// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

interface IProductRegistry {
    function adminCreateProduct(
        uint256 sellerId,
        string calldata title,
        string calldata category,
        uint256 priceVery,
        uint256 inventory,
        string calldata metadataURI
    ) external returns (uint256);

    function totalProducts() external view returns (uint256);
}

/// @notice Register beauty products (Seller 1) - Batch 1
contract AdminProductsBatch1 is Script {
    address constant PRODUCT_REGISTRY = 0x0a68EFC847b8C310616EF408df362e00e5341c84;

    function run() public {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        if (deployerPrivateKey == 0) {
            string memory pkHex = vm.envString("PRIVATE_KEY");
            deployerPrivateKey = vm.parseUint(string.concat("0x", pkHex));
        }

        IProductRegistry registry = IProductRegistry(PRODUCT_REGISTRY);
        console2.log("Products before:", registry.totalProducts());

        vm.startBroadcast(deployerPrivateKey);

        // Seller 1: Beauty
        registry.adminCreateProduct(1, "Glow Serum Set", "beauty", 550000000000000, 100,
            "ipfs://bafkreibj6rhyrezamnij7akpignyg5jcndtcdp3q6zukf343fmhnyuhdwm");
        registry.adminCreateProduct(1, "K-Beauty Sheet Mask Pack", "beauty", 350000000000000, 200,
            "ipfs://bafkreibyijs5qccd2w4fvtyga3x6cbovwcw7oukskx2qu264zpc7n6peuu");
        registry.adminCreateProduct(1, "Cushion Foundation SPF50", "beauty", 480000000000000, 75,
            "ipfs://bafkreia7z7svnkmlipihl3z7drx55ftdd4yso725zy5b6eygsgbnlto2jy");

        vm.stopBroadcast();
        console2.log("Products after:", registry.totalProducts());
    }
}
