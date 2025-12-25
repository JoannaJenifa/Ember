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
    function owner() external view returns (address);
}

/// @title AdminProductsScript
/// @notice Register products using pre-uploaded IPFS metadata
contract AdminProductsScript is Script {
    address constant PRODUCT_REGISTRY = 0x0a68EFC847b8C310616EF408df362e00e5341c84;

    function run() public {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        if (deployerPrivateKey == 0) {
            // Try parsing without 0x prefix
            string memory pkHex = vm.envString("PRIVATE_KEY");
            deployerPrivateKey = vm.parseUint(string.concat("0x", pkHex));
        }
        address deployer = vm.addr(deployerPrivateKey);

        IProductRegistry registry = IProductRegistry(PRODUCT_REGISTRY);

        console2.log("Owner:", registry.owner());
        console2.log("Deployer:", deployer);
        console2.log("Products before:", registry.totalProducts());

        vm.startBroadcast(deployerPrivateKey);

        // Seller 1: Beauty (prices in wei, 0.0003-0.0008 POL)
        registry.adminCreateProduct(1, "Glow Serum Set", "beauty", 550000000000000, 100,
            "ipfs://bafkreibj6rhyrezamnij7akpignyg5jcndtcdp3q6zukf343fmhnyuhdwm");
        registry.adminCreateProduct(1, "K-Beauty Sheet Mask Pack", "beauty", 350000000000000, 200,
            "ipfs://bafkreibyijs5qccd2w4fvtyga3x6cbovwcw7oukskx2qu264zpc7n6peuu");
        registry.adminCreateProduct(1, "Cushion Foundation SPF50", "beauty", 480000000000000, 75,
            "ipfs://bafkreia7z7svnkmlipihl3z7drx55ftdd4yso725zy5b6eygsgbnlto2jy");
        console2.log("Created 3 beauty products");

        // Seller 2: Fashion
        registry.adminCreateProduct(2, "Oversized Korean Blazer", "fashion", 780000000000000, 50,
            "ipfs://bafkreielptqlaqfsrkxroneo5m2ehv5mvkh4ulbakncszdqpmskh677mve");
        registry.adminCreateProduct(2, "Wide Leg Pants", "fashion", 450000000000000, 80,
            "ipfs://bafkreihmhbrhkrwymuitpj652bcxk7weyk2xm4wgrldw53sjwyl3o6yiqq");
        registry.adminCreateProduct(2, "Korean Style Bucket Hat", "fashion", 320000000000000, 150,
            "ipfs://bafkreidx2uoxj7yqj2dejs5slphrz7ghigue2tkqii73mwrrqczsa3fckm");
        console2.log("Created 3 fashion products");

        // Seller 3: Food
        registry.adminCreateProduct(3, "Premium Kimchi Set", "food", 420000000000000, 60,
            "ipfs://bafkreig6dauzza5juhegclgouiga3nh67uxpg64gv5ceiuobqsmgj3xpzu");
        registry.adminCreateProduct(3, "Korean Snack Box", "food", 380000000000000, 40,
            "ipfs://bafkreifil4vng7bmsndmk2kb4u6hwqzl232xs6xk4hs2ohz6yqtd5keae4");
        registry.adminCreateProduct(3, "Gochujang Sauce Set", "food", 300000000000000, 90,
            "ipfs://bafkreia5wyt7rpoybba6bfwejp3mnxqzpnqsdxuqz3gulagpnebyec35yu");
        console2.log("Created 3 food products");

        // Seller 4: Electronics
        registry.adminCreateProduct(4, "Wireless Earbuds Pro", "electronics", 750000000000000, 35,
            "ipfs://bafkreiec7dfgvlx2fgihyvzm4bly77466sdsz5ancnbrr7mgsf76ugodha");
        registry.adminCreateProduct(4, "Smart Watch Band Pack", "electronics", 400000000000000, 120,
            "ipfs://bafkreigpjjqcwecacwbpgdrfatorsz6lxskizj54fb4xusvprkcpcexur4");
        registry.adminCreateProduct(4, "Portable Charger 20000mAh", "electronics", 580000000000000, 90,
            "ipfs://bafkreidnbudosf2mali4lm54oshiqkt2okc2ppcvm6fu7ahge2rgzpnsvm");
        console2.log("Created 3 electronics products");

        // Seller 5: Home
        registry.adminCreateProduct(5, "Korean Ceramic Tea Set", "home", 680000000000000, 25,
            "ipfs://bafkreic2mn5uolkc7eomyyx44cfkxfdegvl2r2yalq434bm53iqgn5prtm");
        registry.adminCreateProduct(5, "Hanji Paper Lamp", "home", 550000000000000, 30,
            "ipfs://bafkreiajz7ufea2ubu5ypd6av2iygwckv43rw7sp7jvhlrwc7cnp52gns4");
        registry.adminCreateProduct(5, "Bamboo Organizer Set", "home", 360000000000000, 65,
            "ipfs://bafkreid5li2cfh3ydjp6yp54aokt36nabbh4zc6lncg3egupxxct7uxhcy");
        console2.log("Created 3 home products");

        vm.stopBroadcast();

        console2.log("Products after:", registry.totalProducts());
    }
}
