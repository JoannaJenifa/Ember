// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseScript} from "./Base.s.sol";
import {FreeMintToken} from "@/FreeMintToken.sol";
import {FreeMintNFT} from "@/FreeMintNFT.sol";
import {HelloWorld} from "@/HelloWorld.sol";
import {console2} from "forge-std/console2.sol";

/// @title DeployScript
/// @notice Main deployment script for FreeMintToken and FreeMintNFT
contract DeployScript is BaseScript {
    // Configuration from deployment.config.json
    string constant TOKEN_NAME = "Free Mint Token";
    string constant TOKEN_SYMBOL = "FMT";
    uint256 constant MAX_MINT_AMOUNT = 1000 ether; // 1000 tokens per mint

    string constant NFT_NAME = "Free Mint NFT";
    string constant NFT_SYMBOL = "FMNFT";
    uint256 constant NFT_MAX_SUPPLY = 10000;
    uint256 constant NFT_MAX_PER_WALLET = 10;
    string constant NFT_BASE_URI = "https://api.example.com/nft/";

    /// @notice Main deployment function
    function run() public returns (FreeMintToken token, FreeMintNFT nft, HelloWorld helloWorld) {
        // Start deployment
        DeploymentConfig memory config = startDeployment();

        // Deploy HelloWorld
        helloWorld = deployHelloWorld();
        saveDeployment("HelloWorld", address(helloWorld));

        // Deploy FreeMintToken (ERC20)
        token = deployFreeMintToken();
        saveDeployment("FreeMintToken", address(token));

        // Deploy FreeMintNFT (ERC721)
        nft = deployFreeMintNFT();
        saveDeployment("FreeMintNFT", address(nft));

        // End deployment
        endDeployment();

        // Log summary
        console2.log("\n=== DEPLOYMENT COMPLETE ===");
        console2.log("HelloWorld:", address(helloWorld));
        console2.log("FreeMintToken:", address(token));
        console2.log("FreeMintNFT:", address(nft));
        console2.log("Chain ID:", block.chainid);

        return (token, nft, helloWorld);
    }

    /// @notice Deploy HelloWorld
    function deployHelloWorld() internal returns (HelloWorld) {
        console2.log("\nDeploying HelloWorld...");

        HelloWorld helloWorld = new HelloWorld();

        console2.log("HelloWorld deployed to:", address(helloWorld));
        console2.log("HelloWorld owner:", helloWorld.owner());
        console2.log("Initial greeting:", helloWorld.greet());

        return helloWorld;
    }

    /// @notice Deploy FreeMintToken (ERC20)
    function deployFreeMintToken() internal returns (FreeMintToken) {
        console2.log("\nDeploying FreeMintToken...");
        console2.log("- Name:", TOKEN_NAME);
        console2.log("- Symbol:", TOKEN_SYMBOL);
        console2.log("- Max Mint Amount:", MAX_MINT_AMOUNT / 1 ether, "tokens");

        FreeMintToken token = new FreeMintToken(TOKEN_NAME, TOKEN_SYMBOL, MAX_MINT_AMOUNT);

        console2.log("FreeMintToken deployed to:", address(token));
        console2.log("FreeMintToken owner:", token.owner());

        return token;
    }

    /// @notice Deploy FreeMintNFT (ERC721)
    function deployFreeMintNFT() internal returns (FreeMintNFT) {
        console2.log("\nDeploying FreeMintNFT...");
        console2.log("- Name:", NFT_NAME);
        console2.log("- Symbol:", NFT_SYMBOL);
        console2.log("- Max Supply:", NFT_MAX_SUPPLY);
        console2.log("- Max Per Wallet:", NFT_MAX_PER_WALLET);

        FreeMintNFT nft = new FreeMintNFT(NFT_NAME, NFT_SYMBOL, NFT_MAX_SUPPLY, NFT_MAX_PER_WALLET, NFT_BASE_URI);

        console2.log("FreeMintNFT deployed to:", address(nft));
        console2.log("FreeMintNFT owner:", nft.owner());

        return nft;
    }
}