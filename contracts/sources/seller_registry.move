/// Seller registry module for Ember commerce platform
module ember::seller_registry {
    use std::string::String;
    use std::signer;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use ember::types::{Category, SellerStatus, category_from_u8, is_verified,
        seller_status_pending, seller_status_verified, seller_status_suspended};
    use ember::errors;

    // === Structs ===

    struct Seller has store, drop, copy {
        addr: address,
        shop_name: String,
        description: String,
        category: Category,
        status: SellerStatus,
        total_sales: u64,
        total_orders: u64,
        rating_sum: u64,
        rating_count: u64,
        youtube_channel: String,
        created_at: u64,
    }

    struct SellerRegistry has key {
        sellers: SmartTable<address, Seller>,
        seller_count: u64,
    }

    // === Events ===

    #[event]
    struct SellerRegistered has drop, store {
        seller: address,
        shop_name: String,
        category: Category,
    }

    #[event]
    struct SellerVerified has drop, store {
        seller: address,
    }

    #[event]
    struct SellerSuspended has drop, store {
        seller: address,
    }

    #[event]
    struct SellerProfileUpdated has drop, store {
        seller: address,
        shop_name: String,
    }

    // === Entry Functions ===

    /// Initialize the seller registry (admin only)
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<SellerRegistry>(admin_addr), errors::already_initialized());

        move_to(admin, SellerRegistry {
            sellers: smart_table::new(),
            seller_count: 0,
        });
    }

    /// Register as a new seller
    public entry fun register_seller(
        account: &signer,
        shop_name: String,
        description: String,
        category: u8,
        youtube_channel: String,
    ) acquires SellerRegistry {
        let seller_addr = signer::address_of(account);
        let registry = borrow_global_mut<SellerRegistry>(@ember);

        assert!(!smart_table::contains(&registry.sellers, seller_addr),
            errors::seller_already_exists());

        let seller = Seller {
            addr: seller_addr,
            shop_name,
            description,
            category: category_from_u8(category),
            status: seller_status_pending(),
            total_sales: 0,
            total_orders: 0,
            rating_sum: 0,
            rating_count: 0,
            youtube_channel,
            created_at: timestamp::now_seconds(),
        };

        event::emit(SellerRegistered {
            seller: seller_addr,
            shop_name: seller.shop_name,
            category: seller.category,
        });

        smart_table::add(&mut registry.sellers, seller_addr, seller);
        registry.seller_count = registry.seller_count + 1;
    }

    /// Update seller profile
    public entry fun update_profile(
        account: &signer,
        shop_name: String,
        description: String,
        youtube_channel: String,
    ) acquires SellerRegistry {
        let seller_addr = signer::address_of(account);
        let registry = borrow_global_mut<SellerRegistry>(@ember);

        assert!(smart_table::contains(&registry.sellers, seller_addr),
            errors::seller_not_found());

        let seller = smart_table::borrow_mut(&mut registry.sellers, seller_addr);
        seller.shop_name = shop_name;
        seller.description = description;
        seller.youtube_channel = youtube_channel;

        event::emit(SellerProfileUpdated {
            seller: seller_addr,
            shop_name,
        });
    }

    /// Verify a seller (admin only)
    public entry fun verify_seller(
        admin: &signer,
        seller_address: address,
    ) acquires SellerRegistry {
        assert!(signer::address_of(admin) == @ember, errors::unauthorized());
        let registry = borrow_global_mut<SellerRegistry>(@ember);

        assert!(smart_table::contains(&registry.sellers, seller_address),
            errors::seller_not_found());

        let seller = smart_table::borrow_mut(&mut registry.sellers, seller_address);
        seller.status = seller_status_verified();

        event::emit(SellerVerified { seller: seller_address });
    }

    /// Suspend a seller (admin only)
    public entry fun suspend_seller(
        admin: &signer,
        seller_address: address,
    ) acquires SellerRegistry {
        assert!(signer::address_of(admin) == @ember, errors::unauthorized());
        let registry = borrow_global_mut<SellerRegistry>(@ember);

        assert!(smart_table::contains(&registry.sellers, seller_address),
            errors::seller_not_found());

        let seller = smart_table::borrow_mut(&mut registry.sellers, seller_address);
        seller.status = seller_status_suspended();

        event::emit(SellerSuspended { seller: seller_address });
    }

    // === Friend Functions ===

    /// Record a sale for a seller (called by OrderEscrow)
    public(friend) fun record_sale(
        seller_address: address,
        amount: u64,
    ) acquires SellerRegistry {
        let registry = borrow_global_mut<SellerRegistry>(@ember);
        let seller = smart_table::borrow_mut(&mut registry.sellers, seller_address);
        seller.total_sales = seller.total_sales + amount;
        seller.total_orders = seller.total_orders + 1;
    }

    /// Update seller rating (called by ReviewRegistry)
    public(friend) fun update_rating(
        seller_address: address,
        rating: u64,
    ) acquires SellerRegistry {
        let registry = borrow_global_mut<SellerRegistry>(@ember);
        let seller = smart_table::borrow_mut(&mut registry.sellers, seller_address);
        seller.rating_sum = seller.rating_sum + rating;
        seller.rating_count = seller.rating_count + 1;
    }

    // === View Functions ===

    #[view]
    public fun get_seller(seller_address: address): Seller acquires SellerRegistry {
        let registry = borrow_global<SellerRegistry>(@ember);
        assert!(smart_table::contains(&registry.sellers, seller_address),
            errors::seller_not_found());
        *smart_table::borrow(&registry.sellers, seller_address)
    }

    #[view]
    public fun is_verified_seller(seller_address: address): bool acquires SellerRegistry {
        let registry = borrow_global<SellerRegistry>(@ember);
        if (!smart_table::contains(&registry.sellers, seller_address)) {
            return false
        };
        let seller = smart_table::borrow(&registry.sellers, seller_address);
        is_verified(&seller.status)
    }

    #[view]
    public fun is_registered_seller(seller_address: address): bool acquires SellerRegistry {
        let registry = borrow_global<SellerRegistry>(@ember);
        smart_table::contains(&registry.sellers, seller_address)
    }

    #[view]
    public fun get_seller_count(): u64 acquires SellerRegistry {
        let registry = borrow_global<SellerRegistry>(@ember);
        registry.seller_count
    }

    #[view]
    public fun get_seller_rating(seller_address: address): (u64, u64) acquires SellerRegistry {
        let seller = get_seller(seller_address);
        (seller.rating_sum, seller.rating_count)
    }

    // === Test Functions ===

    #[test_only]
    public fun init_for_test(admin: &signer) {
        initialize(admin);
    }
}
