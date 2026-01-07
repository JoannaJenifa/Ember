/// Review registry module for Ember commerce platform
/// Only verified purchasers can leave reviews
module ember::review_registry {
    use std::string::String;
    use std::signer;
    use std::vector;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use ember::errors;
    use ember::order_escrow;
    use ember::product_registry;
    use ember::seller_registry;

    // === Structs ===

    struct Review has store, drop, copy {
        id: u64,
        order_id: u64,
        product_id: u64,
        reviewer: address,
        seller: address,
        rating: u64,
        content: String,
        is_verified: bool,
        created_at: u64,
    }

    struct ReviewRegistry has key {
        reviews: SmartTable<u64, Review>,
        product_reviews: SmartTable<u64, vector<u64>>,
        user_reviews: SmartTable<address, vector<u64>>,
        order_reviewed: SmartTable<u64, bool>,
        review_count: u64,
    }

    // === Events ===

    #[event]
    struct ReviewSubmitted has drop, store {
        review_id: u64,
        order_id: u64,
        product_id: u64,
        reviewer: address,
        rating: u64,
    }

    // === Entry Functions ===

    /// Initialize the review registry (admin only)
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<ReviewRegistry>(admin_addr), errors::already_initialized());

        move_to(admin, ReviewRegistry {
            reviews: smart_table::new(),
            product_reviews: smart_table::new(),
            user_reviews: smart_table::new(),
            order_reviewed: smart_table::new(),
            review_count: 0,
        });
    }

    /// Submit a review for a delivered order
    public entry fun submit_review(
        reviewer: &signer,
        order_id: u64,
        rating: u64,
        content: String,
    ) acquires ReviewRegistry {
        let reviewer_addr = signer::address_of(reviewer);
        let registry = borrow_global_mut<ReviewRegistry>(@ember);

        // Validate rating 1-5
        assert!(rating >= 1 && rating <= 5, errors::invalid_rating());

        // Check order hasn't been reviewed
        assert!(!smart_table::contains(&registry.order_reviewed, order_id) ||
                !*smart_table::borrow(&registry.order_reviewed, order_id),
                errors::already_reviewed());

        // Verify order exists and is delivered
        assert!(order_escrow::is_order_delivered(order_id), errors::invalid_order_status());
        assert!(order_escrow::get_order_buyer(order_id) == reviewer_addr, errors::not_verified_buyer());

        // Create review
        let review_id = registry.review_count + 1;
        let product_id = order_escrow::get_order_product_id(order_id);
        let seller = order_escrow::get_order_seller(order_id);

        let review = Review {
            id: review_id,
            order_id,
            product_id,
            reviewer: reviewer_addr,
            seller,
            rating,
            content,
            is_verified: true,
            created_at: timestamp::now_seconds(),
        };

        smart_table::add(&mut registry.reviews, review_id, review);

        // Add to product reviews
        if (!smart_table::contains(&registry.product_reviews, product_id)) {
            smart_table::add(&mut registry.product_reviews, product_id, vector::empty());
        };
        vector::push_back(smart_table::borrow_mut(&mut registry.product_reviews, product_id), review_id);

        // Add to user reviews
        if (!smart_table::contains(&registry.user_reviews, reviewer_addr)) {
            smart_table::add(&mut registry.user_reviews, reviewer_addr, vector::empty());
        };
        vector::push_back(smart_table::borrow_mut(&mut registry.user_reviews, reviewer_addr), review_id);

        // Mark order as reviewed
        if (!smart_table::contains(&registry.order_reviewed, order_id)) {
            smart_table::add(&mut registry.order_reviewed, order_id, true);
        } else {
            *smart_table::borrow_mut(&mut registry.order_reviewed, order_id) = true;
        };

        registry.review_count = review_id;

        // Update product rating
        product_registry::update_rating(product_id, rating);

        // Update seller rating
        seller_registry::update_rating(seller, rating);

        event::emit(ReviewSubmitted { review_id, order_id, product_id, reviewer: reviewer_addr, rating });
    }

    // === View Functions ===

    #[view]
    public fun get_review(review_id: u64): Review acquires ReviewRegistry {
        let registry = borrow_global<ReviewRegistry>(@ember);
        assert!(smart_table::contains(&registry.reviews, review_id), errors::not_verified_buyer());
        *smart_table::borrow(&registry.reviews, review_id)
    }

    #[view]
    public fun get_product_reviews(product_id: u64): vector<Review> acquires ReviewRegistry {
        let registry = borrow_global<ReviewRegistry>(@ember);
        if (!smart_table::contains(&registry.product_reviews, product_id)) {
            return vector::empty()
        };
        let review_ids = smart_table::borrow(&registry.product_reviews, product_id);
        let reviews = vector::empty<Review>();
        let i = 0;
        while (i < vector::length(review_ids)) {
            let review_id = *vector::borrow(review_ids, i);
            vector::push_back(&mut reviews, *smart_table::borrow(&registry.reviews, review_id));
            i = i + 1;
        };
        reviews
    }

    #[view]
    public fun has_reviewed_order(order_id: u64): bool acquires ReviewRegistry {
        let registry = borrow_global<ReviewRegistry>(@ember);
        if (!smart_table::contains(&registry.order_reviewed, order_id)) {
            return false
        };
        *smart_table::borrow(&registry.order_reviewed, order_id)
    }

    #[view]
    public fun get_product_rating(product_id: u64): (u64, u64) acquires ReviewRegistry {
        let registry = borrow_global<ReviewRegistry>(@ember);
        if (!smart_table::contains(&registry.product_reviews, product_id)) {
            return (0, 0)
        };
        let review_ids = smart_table::borrow(&registry.product_reviews, product_id);
        let count = vector::length(review_ids);
        if (count == 0) {
            return (0, 0)
        };
        let sum = 0u64;
        let i = 0;
        while (i < count) {
            let review = smart_table::borrow(&registry.reviews, *vector::borrow(review_ids, i));
            sum = sum + review.rating;
            i = i + 1;
        };
        // Return avg*100 for precision
        ((sum * 100) / count, count)
    }

    #[view]
    public fun get_review_count(): u64 acquires ReviewRegistry {
        borrow_global<ReviewRegistry>(@ember).review_count
    }

    #[view]
    public fun get_user_reviews(user: address): vector<u64> acquires ReviewRegistry {
        let registry = borrow_global<ReviewRegistry>(@ember);
        if (!smart_table::contains(&registry.user_reviews, user)) {
            return vector::empty()
        };
        *smart_table::borrow(&registry.user_reviews, user)
    }
}
