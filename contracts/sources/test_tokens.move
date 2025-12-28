/// Test Tokens Module for Ember
/// Provides tUSDC for testing payments on Movement testnet
/// Includes public faucet function for anyone to mint test tokens
module ember::test_tokens {
    use std::signer;
    use std::string::{Self, String};
    use std::option;
    use aptos_framework::object::{Self, Object};
    use aptos_framework::fungible_asset::{Self, Metadata, MintRef, BurnRef, TransferRef};
    use aptos_framework::primary_fungible_store;

    // ============ Storage ============

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct TokenRefs has key {
        mint_ref: MintRef,
        burn_ref: BurnRef,
        transfer_ref: TransferRef
    }

    struct TokenRegistry has key {
        tusdc: address,
        admin: address
    }

    // ============ Constants ============

    const DECIMALS: u8 = 6; // USDC uses 6 decimals

    // ============ Initialize ============

    /// Initialize tUSDC token (admin only)
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<TokenRegistry>(admin_addr), 1);

        // Create tUSDC
        let tusdc_addr = create_token(
            admin,
            string::utf8(b"Test USDC"),
            string::utf8(b"tUSDC"),
            string::utf8(b"https://ember.live/tokens/tusdc.png"),
            string::utf8(b"https://ember.live")
        );

        move_to(admin, TokenRegistry {
            tusdc: tusdc_addr,
            admin: admin_addr
        });
    }

    // ============ Internal Functions ============

    /// Create a new fungible token
    fun create_token(
        admin: &signer,
        name: String,
        symbol: String,
        icon_uri: String,
        project_uri: String
    ): address {
        let constructor_ref = object::create_named_object(admin, *string::bytes(&symbol));

        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            &constructor_ref,
            option::none(), // No maximum supply
            name,
            symbol,
            DECIMALS,
            icon_uri,
            project_uri
        );

        let mint_ref = fungible_asset::generate_mint_ref(&constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(&constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(&constructor_ref);

        let token_signer = object::generate_signer(&constructor_ref);
        move_to(&token_signer, TokenRefs {
            mint_ref,
            burn_ref,
            transfer_ref
        });

        object::address_from_constructor_ref(&constructor_ref)
    }

    // ============ Internal Mint ============

    fun mint_internal(token_addr: address, to: address, amount: u64) acquires TokenRefs {
        let refs = borrow_global<TokenRefs>(token_addr);
        let fa = fungible_asset::mint(&refs.mint_ref, amount);
        primary_fungible_store::deposit(to, fa);
    }

    // ============ Public Faucet ============

    /// Public faucet: Anyone can mint tUSDC to themselves
    public entry fun faucet(
        user: &signer,
        registry_addr: address,
        amount: u64
    ) acquires TokenRegistry, TokenRefs {
        let user_addr = signer::address_of(user);
        let registry = borrow_global<TokenRegistry>(registry_addr);
        mint_internal(registry.tusdc, user_addr, amount);
    }

    // ============ Transfer Functions ============

    /// Transfer tUSDC using the stored TransferRef (for escrow operations)
    public fun transfer_tusdc(
        registry_addr: address,
        from: address,
        to: address,
        amount: u64
    ) acquires TokenRegistry, TokenRefs {
        let registry = borrow_global<TokenRegistry>(registry_addr);
        let refs = borrow_global<TokenRefs>(registry.tusdc);
        let metadata = object::address_to_object<Metadata>(registry.tusdc);
        let from_store = primary_fungible_store::primary_store(from, metadata);
        let fa = fungible_asset::withdraw_with_ref(&refs.transfer_ref, from_store, amount);
        primary_fungible_store::deposit(to, fa);
    }

    // ============ View Functions ============

    #[view]
    /// Get tUSDC metadata address
    public fun get_tusdc_address(registry_addr: address): address acquires TokenRegistry {
        let registry = borrow_global<TokenRegistry>(registry_addr);
        registry.tusdc
    }

    #[view]
    /// Get tUSDC metadata object
    public fun get_tusdc_metadata(registry_addr: address): Object<Metadata> acquires TokenRegistry {
        let registry = borrow_global<TokenRegistry>(registry_addr);
        object::address_to_object<Metadata>(registry.tusdc)
    }

    #[view]
    /// Get tUSDC balance for an address
    public fun get_balance(
        registry_addr: address,
        owner: address
    ): u64 acquires TokenRegistry {
        let registry = borrow_global<TokenRegistry>(registry_addr);
        let metadata = object::address_to_object<Metadata>(registry.tusdc);
        primary_fungible_store::balance(owner, metadata)
    }

    #[view]
    /// Get the admin address of the registry
    public fun get_admin(registry_addr: address): address acquires TokenRegistry {
        let registry = borrow_global<TokenRegistry>(registry_addr);
        registry.admin
    }
}
