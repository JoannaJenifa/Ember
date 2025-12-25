// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

interface ISellerRegistry {
    function adminRegisterSeller(address wallet, string calldata shopName, string calldata category, string calldata metadataURI)
        external returns (uint256);
    function totalSellers() external view returns (uint256);
}

/// @notice Register 5 sellers on Base Sepolia using existing IPFS metadata
contract BaseSellers is Script {
    address constant SELLER_REGISTRY = 0x2DE5e038fb2fB0d9998dC1C7C9855b9Df156fF93;

    function run() public {
        uint256 pk = vm.envOr("PRIVATE_KEY", uint256(0));
        if (pk == 0) {
            string memory pkHex = vm.envString("PRIVATE_KEY");
            pk = vm.parseUint(string.concat("0x", pkHex));
        }

        ISellerRegistry registry = ISellerRegistry(SELLER_REGISTRY);
        console2.log("Sellers before:", registry.totalSellers());

        vm.startBroadcast(pk);

        // Use existing IPFS metadata from Amoy deployment
        registry.adminRegisterSeller(
            0x1111111111111111111111111111111111111111,
            "Glow Beauty Korea", "beauty",
            "ipfs://bafkreib6qkk6gxgq7xnpvmgfcxmgdmmsmq3yjxflqyrpftqnmb7lbzlkoa"
        );
        registry.adminRegisterSeller(
            0x2222222222222222222222222222222222222222,
            "Seoul Street Style", "fashion",
            "ipfs://bafkreidyv3c7yvwsf6qvqz6fxqknwfmxlq5hk6k7xvhgndjftxq5wpdnxe"
        );
        registry.adminRegisterSeller(
            0x3333333333333333333333333333333333333333,
            "Kimchi Kitchen", "food",
            "ipfs://bafkreigfk7jxm4vqz3pqvzl5xhqfxbvuhxjkmxdlxrvxqfpxhzwuqmvnzy"
        );
        registry.adminRegisterSeller(
            0x4444444444444444444444444444444444444444,
            "Tech Galaxy Korea", "electronics",
            "ipfs://bafkreidxqkxvjxnhqfxbvuhxjkmxdlxrvxqfpxhzwuqmvnzydyv3c7yvws"
        );
        registry.adminRegisterSeller(
            0x5555555555555555555555555555555555555555,
            "Hanok Living", "home",
            "ipfs://bafkreifxqknwfmxlq5hk6k7xvhgndjftxq5wpdnxegfk7jxm4vqz3pqvzl"
        );

        vm.stopBroadcast();
        console2.log("Sellers after:", registry.totalSellers());
    }
}
