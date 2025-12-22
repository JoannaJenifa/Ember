/// Product registry module for Ember commerce platform
module ember::product_registry {
    use std::string::String;
    use std::signer;
    use std::vector;

    friend ember::order_escrow;
    friend ember::review_registry;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use ember::types::{Category, category_from_u8};
    use ember::errors;
    use ember::seller_registry;

    // === Structs ===

    struct Product has store, drop, copy {
        id: u64,
        seller: address,
        title: String,
        description: String,
        image_url: String,
        price: u64,
        inventory: u64,
        category: Category,
        is_active: bool,
        total_sold: u64,
        rating_sum: u64,
        rating_count: u64,
        created_at: u64,
    }

    struct ProductRegistry has key {
        products: SmartTable<u64, Product>,
        seller_products: SmartTable<address, vector<u64>>,
        product_count: u64,
        platform_fee_bps: u64,
        fee_recipient: address,
    }

    // === Events ===

    #[event]
    struct ProductCreated has drop, store {
        product_id: u64,
        seller: address,
        title: String,
        price: u64,
    }

    #[event]
    struct ProductUpdated has drop, store {
        product_id: u64,
        title: String,
        price: u64,
    }

    #[event]
    struct InventoryUpdated has drop, store {
        product_id: u64,
        new_inventory: u64,
    }

    #[event]
    struct ProductDeactivated has drop, store {
        product_id: u64,
    }

    // === Entry Functions ===

    /// Initialize the product registry (admin only)
    public entry fun initialize(admin: &signer, fee_recipient: address) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<ProductRegistry>(admin_addr), errors::already_initialized());

        move_to(admin, ProductRegistry {
            products: smart_table::new(),
            seller_products: smart_table::new(),
            product_count: 0,
            platform_fee_bps: 300, // 3%
            fee_recipient,
        });
    }

    /// Create a new product (registered sellers only - hackathon: skip verification)
    public entry fun create_product(
        seller: &signer,
        title: String,
        description: String,
        image_url: String,
        price: u64,
        inventory: u64,
        category: u8,
    ) acquires ProductRegistry {
        let seller_addr = signer::address_of(seller);
        assert!(seller_registry::is_registered_seller(seller_addr),
            errors::seller_not_verified());
        assert!(price > 0, errors::invalid_price());

        let registry = borrow_global_mut<ProductRegistry>(@ember);
        let product_id = registry.product_count + 1;

        let product = Product {
            id: product_id,
            seller: seller_addr,
            title,
            description,
            image_url,
            price,
            inventory,
            category: category_from_u8(category),
            is_active: true,
            total_sold: 0,
            rating_sum: 0,
            rating_count: 0,
            created_at: timestamp::now_seconds(),
        };

        event::emit(ProductCreated {
            product_id,
            seller: seller_addr,
            title: product.title,
            price,
        });

        smart_table::add(&mut registry.products, product_id, product);

        // Add to seller's product list
        if (!smart_table::contains(&registry.seller_products, seller_addr)) {
            smart_table::add(&mut registry.seller_products, seller_addr, vector::empty());
        };
        let seller_prods = smart_table::borrow_mut(&mut registry.seller_products, seller_addr);
        vector::push_back(seller_prods, product_id);

        registry.product_count = product_id;
    }

    /// Update product details
    public entry fun update_product(
        seller: &signer,
        product_id: u64,
        title: String,
        description: String,
        image_url: String,
        price: u64,
    ) acquires ProductRegistry {
        let seller_addr = signer::address_of(seller);
        let registry = borrow_global_mut<ProductRegistry>(@ember);

        assert!(smart_table::contains(&registry.products, product_id),
            errors::product_not_found());

        let product = smart_table::borrow_mut(&mut registry.products, product_id);
        assert!(product.seller == seller_addr, errors::not_product_owner());
        assert!(price > 0, errors::invalid_price());

        product.title = title;
        product.description = description;
        product.image_url = image_url;
        product.price = price;

        event::emit(ProductUpdated { product_id, title, price });
    }

    /// Update product inventory
    public entry fun update_inventory(
        seller: &signer,
        product_id: u64,
        inventory: u64,
    ) acquires ProductRegistry {
        let seller_addr = signer::address_of(seller);
        let registry = borrow_global_mut<ProductRegistry>(@ember);

        assert!(smart_table::contains(&registry.products, product_id),
            errors::product_not_found());

        let product = smart_table::borrow_mut(&mut registry.products, product_id);
        assert!(product.seller == seller_addr, errors::not_product_owner());

        product.inventory = inventory;

        event::emit(InventoryUpdated { product_id, new_inventory: inventory });
    }

    /// Deactivate a product
    public entry fun deactivate_product(
        seller: &signer,
        product_id: u64,
    ) acquires ProductRegistry {
        let seller_addr = signer::address_of(seller);
        let registry = borrow_global_mut<ProductRegistry>(@ember);

        assert!(smart_table::contains(&registry.products, product_id),
            errors::product_not_found());

        let product = smart_table::borrow_mut(&mut registry.products, product_id);
        assert!(product.seller == seller_addr, errors::not_product_owner());

        product.is_active = false;

        event::emit(ProductDeactivated { product_id });
    }

    // === Friend Functions ===

    /// Record a sale (called by OrderEscrow)
    public(friend) fun record_sale(
        product_id: u64,
        quantity: u64,
    ) acquires ProductRegistry {
        let registry = borrow_global_mut<ProductRegistry>(@ember);
        let product = smart_table::borrow_mut(&mut registry.products, product_id);

        assert!(product.inventory >= quantity, errors::insufficient_inventory());

        product.inventory = product.inventory - quantity;
        product.total_sold = product.total_sold + quantity;
    }

    /// Update product rating (called by ReviewRegistry)
    public(friend) fun update_rating(
        product_id: u64,
        rating: u64,
    ) acquires ProductRegistry {
        let registry = borrow_global_mut<ProductRegistry>(@ember);
        let product = smart_table::borrow_mut(&mut registry.products, product_id);
        product.rating_sum = product.rating_sum + rating;
        product.rating_count = product.rating_count + 1;
    }

    // === View Functions ===

    #[view]
    public fun get_product(product_id: u64): Product acquires ProductRegistry {
        let registry = borrow_global<ProductRegistry>(@ember);
        assert!(smart_table::contains(&registry.products, product_id),
            errors::product_not_found());
        *smart_table::borrow(&registry.products, product_id)
    }

    #[view]
    public fun get_seller_products(seller: address): vector<u64> acquires ProductRegistry {
        let registry = borrow_global<ProductRegistry>(@ember);
        if (!smart_table::contains(&registry.seller_products, seller)) {
            return vector::empty()
        };
        *smart_table::borrow(&registry.seller_products, seller)
    }

    #[view]
    public fun get_product_count(): u64 acquires ProductRegistry {
        let registry = borrow_global<ProductRegistry>(@ember);
        registry.product_count
    }

    #[view]
    public fun get_platform_fee_bps(): u64 acquires ProductRegistry {
        let registry = borrow_global<ProductRegistry>(@ember);
        registry.platform_fee_bps
    }

    #[view]
    public fun get_fee_recipient(): address acquires ProductRegistry {
        let registry = borrow_global<ProductRegistry>(@ember);
        registry.fee_recipient
    }

    #[view]
    public fun is_product_active(product_id: u64): bool acquires ProductRegistry {
        let product = get_product(product_id);
        product.is_active
    }

    #[view]
    public fun get_product_seller(product_id: u64): address acquires ProductRegistry {
        let product = get_product(product_id);
        product.seller
    }

    #[view]
    public fun get_product_price(product_id: u64): u64 acquires ProductRegistry {
        let product = get_product(product_id);
        product.price
    }

    // === Test Functions ===

    #[test_only]
    public fun init_for_test(admin: &signer, fee_recipient: address) {
        initialize(admin, fee_recipient);
    }
}
