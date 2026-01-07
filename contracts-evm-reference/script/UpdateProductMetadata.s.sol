// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

interface IProductRegistry {
    function adminUpdateProduct(uint256 productId, string calldata metadataURI) external;
    function totalProducts() external view returns (uint256);
}

/// @notice Update existing product metadata on Base Sepolia
contract UpdateProductMetadata is Script {
    address constant PRODUCT_REGISTRY = 0x4aAfCB744e5A9923640838C4788455B2Cc1EbD48;

    function run() public {
        uint256 pk = vm.envOr("PRIVATE_KEY", uint256(0));
        if (pk == 0) {
            string memory pkHex = vm.envString("PRIVATE_KEY");
            pk = vm.parseUint(string.concat("0x", pkHex));
        }

        IProductRegistry r = IProductRegistry(PRODUCT_REGISTRY);
        console2.log("Total products:", r.totalProducts());

        vm.startBroadcast(pk);

        // Update Seller 1: Beauty (products 1-3)
        r.adminUpdateProduct(1, '{"titleKo":"\\uae00\\ub85c\\uc6b0 \\uc138\\ub7fc \\uc138\\ud2b8","description":"Vitamin C brightening serum with hyaluronic acid","descriptionKo":"\\ud788\\uc54c\\ub8e8\\ub860\\uc0b0\\uc774 \\ud568\\uc720\\ub41c \\ube44\\ud0c0\\ubbfc C \\ube0c\\ub77c\\uc774\\ud2b8\\ub2dd \\uc138\\ub7fc","images":["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400"]}');
        r.adminUpdateProduct(2, '{"titleKo":"\\uc2dc\\ud2b8 \\ub9c8\\uc2a4\\ud06c \\ud329","description":"10-piece hydrating sheet mask collection","descriptionKo":"10\\uc7a5 \\uc218\\ubd84 \\uc2dc\\ud2b8 \\ub9c8\\uc2a4\\ud06c \\ucee4\\ub809\\uc158","images":["https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400"]}');
        r.adminUpdateProduct(3, '{"titleKo":"\\ucfe0\\uc158 \\ud30c\\uc6b4\\ub370\\uc774\\uc158","description":"Natural coverage with sun protection","descriptionKo":"\\uc790\\uc5f0\\uc2a4\\ub7ec\\uc6b4 \\ucee4\\ubc84\\ub9ac\\uc9c0\\uc640 \\uc790\\uc678\\uc120 \\ucc28\\ub2e8","images":["https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400"]}');

        // Update Seller 2: Fashion (products 4-6)
        r.adminUpdateProduct(4, '{"titleKo":"\\uc624\\ubc84\\uc0ac\\uc774\\uc988 \\ube14\\ub808\\uc774\\uc800","description":"Korean street style oversized blazer","descriptionKo":"\\ud55c\\uad6d \\uc2a4\\ud2b8\\ub9bf \\uc2a4\\ud0c0\\uc77c \\uc624\\ubc84\\uc0ac\\uc774\\uc988 \\ube14\\ub808\\uc774\\uc800","images":["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400"]}');
        r.adminUpdateProduct(5, '{"titleKo":"\\uc640\\uc774\\ub4dc \\ud32c\\uce20","description":"Comfortable high-waist wide leg pants","descriptionKo":"\\ud3b8\\uc548\\ud55c \\ud558\\uc774\\uc6e8\\uc2a4\\ud2b8 \\uc640\\uc774\\ub4dc \\ud32c\\uce20","images":["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400"]}');
        r.adminUpdateProduct(6, '{"titleKo":"\\ubc84\\ud0b7 \\ud587","description":"Trendy bucket hat in multiple colors","descriptionKo":"\\ud2b8\\ub80c\\ub514\\ud55c \\ubc84\\ud0b7 \\ud587 \\ub2e4\\uc591\\ud55c \\uc0c9\\uc0c1","images":["https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400"]}');

        // Update Seller 3: Food (products 7-9)
        r.adminUpdateProduct(7, '{"titleKo":"\\ud504\\ub9ac\\ubbf8\\uc5c4 \\uae40\\uce58 \\uc138\\ud2b8","description":"Handmade traditional kimchi variety pack","descriptionKo":"\\uc218\\uc81c \\uc804\\ud1b5 \\uae40\\uce58 \\ubaa8\\ub4ec \\ud329","images":["https://images.unsplash.com/photo-1583224964978-2257b960c3e3?w=400"]}');
        r.adminUpdateProduct(8, '{"titleKo":"\\ud55c\\uad6d \\uc2a4\\ub0b5 \\ubc15\\uc2a4","description":"Curated box of popular Korean snacks","descriptionKo":"\\uc778\\uae30 \\ud55c\\uad6d \\uc2a4\\ub0b5 \\ud050\\ub808\\uc774\\uc158 \\ubc15\\uc2a4","images":["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400"]}');
        r.adminUpdateProduct(9, '{"titleKo":"\\uace0\\ucd94\\uc7a5 \\uc18c\\uc2a4 \\uc138\\ud2b8","description":"Premium Korean red pepper paste set","descriptionKo":"\\ud504\\ub9ac\\ubbf8\\uc5c4 \\ud55c\\uad6d \\uace0\\ucd94\\uc7a5 \\uc138\\ud2b8","images":["https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=400"]}');

        // Update Seller 4: Electronics (products 10-12)
        r.adminUpdateProduct(10, '{"titleKo":"\\ubb34\\uc120 \\uc774\\uc5b4\\ubc84\\ub4dc \\ud504\\ub85c","description":"Active noise cancelling wireless earbuds","descriptionKo":"\\ub178\\uc774\\uc988 \\uce94\\uc2ac\\ub9c1 \\ubb34\\uc120 \\uc774\\uc5b4\\ubc84\\ub4dc","images":["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400"]}');
        r.adminUpdateProduct(11, '{"titleKo":"\\uc2a4\\ub9c8\\ud2b8\\uc6cc\\uce58 \\ubc34\\ub4dc \\ud329","description":"Premium leather band for smartwatches","descriptionKo":"\\ud504\\ub9ac\\ubbf8\\uc5c4 \\uac00\\uc8fd \\uc2a4\\ub9c8\\ud2b8\\uc6cc\\uce58 \\ubc34\\ub4dc","images":["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400"]}');
        r.adminUpdateProduct(12, '{"titleKo":"\\ud3ec\\ud130\\ube14 \\ucda9\\uc804\\uae30","description":"Fast charging portable power bank","descriptionKo":"\\uace0\\uc18d \\ucda9\\uc804 \\ud3ec\\ud130\\ube14 \\ud30c\\uc6cc\\ubc45\\ud06c","images":["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400"]}');

        // Update Seller 5: Home (products 13-15)
        r.adminUpdateProduct(13, '{"titleKo":"\\ud55c\\uad6d \\ub3c4\\uc790\\uae30 \\ucc28 \\uc138\\ud2b8","description":"Traditional Korean ceramic tea set","descriptionKo":"\\uc804\\ud1b5 \\ud55c\\uad6d \\ub3c4\\uc790\\uae30 \\ucc28 \\uc138\\ud2b8","images":["https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400"]}');
        r.adminUpdateProduct(14, '{"titleKo":"\\ud55c\\uc9c0 \\ub7a8\\ud504","description":"Handcrafted Korean paper lamp","descriptionKo":"\\uc218\\uacf5\\uc608 \\ud55c\\uc9c0 \\ub7a8\\ud504","images":["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"]}');
        r.adminUpdateProduct(15, '{"titleKo":"\\ub300\\ub098\\ubb34 \\uc815\\ub9ac\\ud568 \\uc138\\ud2b8","description":"Eco-friendly bamboo desk organizer","descriptionKo":"\\uce5c\\ud658\\uacbd \\ub300\\ub098\\ubb34 \\ucc45\\uc0c1 \\uc815\\ub9ac\\ud568","images":["https://images.unsplash.com/photo-1586105251261-72a756497a11?w=400"]}');

        vm.stopBroadcast();
        console2.log("Updated metadata for products 1-15");
    }
}
