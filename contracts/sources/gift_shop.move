/// GiftShop module for virtual gifts on Ember
module ember::gift_shop {
    use std::string::String;
    use std::signer;
    use std::vector;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use ember::types::{GiftType, gift_from_u8, gift_value};
    use ember::errors;

    // === Constants ===

    const BASIS_POINTS: u64 = 10000;
    const DEFAULT_PLATFORM_FEE: u64 = 1000; // 10%

    // === Structs ===

    struct Gift has store, drop, copy {
        id: u64,
        sender: address,
        streamer: address,
        gift_type: GiftType,
        quantity: u64,
        total_value: u64,
        message: String,
        timestamp: u64,
    }

    struct GiftShop has key {
        gifts: SmartTable<u64, Gift>,
        gift_prices: SmartTable<u8, u64>,
        streamer_gifts: SmartTable<address, vector<u64>>,
        streamer_earnings: SmartTable<address, u64>,
        gift_count: u64,
        platform_fee_bps: u64,
        fee_recipient: address,
    }

    // === Events ===

    #[event]
    struct GiftSent has drop, store {
        gift_id: u64,
        sender: address,
        streamer: address,
        gift_type: u8,
        quantity: u64,
        total_value: u64,
    }

    // === Entry Functions ===

    /// Initialize the gift shop with default prices (admin only)
    public entry fun initialize(admin: &signer, fee_recipient: address) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<GiftShop>(admin_addr), errors::already_initialized());

        let gift_prices = smart_table::new<u8, u64>();
        // Set default prices: Heart=1, Star=5, Fire=10, Diamond=50, Crown=100 MOVE
        smart_table::add(&mut gift_prices, 0, 100_000_000);      // Heart: 1 MOVE
        smart_table::add(&mut gift_prices, 1, 500_000_000);      // Star: 5 MOVE
        smart_table::add(&mut gift_prices, 2, 1_000_000_000);    // Fire: 10 MOVE
        smart_table::add(&mut gift_prices, 3, 5_000_000_000);    // Diamond: 50 MOVE
        smart_table::add(&mut gift_prices, 4, 10_000_000_000);   // Crown: 100 MOVE

        move_to(admin, GiftShop {
            gifts: smart_table::new(),
            gift_prices,
            streamer_gifts: smart_table::new(),
            streamer_earnings: smart_table::new(),
            gift_count: 0,
            platform_fee_bps: DEFAULT_PLATFORM_FEE,
            fee_recipient,
        });
    }

    /// Set gift price (admin only)
    public entry fun set_gift_price(admin: &signer, gift_type: u8, price: u64) acquires GiftShop {
        assert!(signer::address_of(admin) == @ember, errors::unauthorized());
        assert!(price > 0, errors::invalid_price());

        let shop = borrow_global_mut<GiftShop>(@ember);
        if (smart_table::contains(&shop.gift_prices, gift_type)) {
            *smart_table::borrow_mut(&mut shop.gift_prices, gift_type) = price;
        } else {
            smart_table::add(&mut shop.gift_prices, gift_type, price);
        };
    }

    /// Send a gift to a streamer
    public entry fun send_gift(
        sender: &signer,
        streamer: address,
        gift_type: u8,
        quantity: u64,
        message: String,
    ) acquires GiftShop {
        let sender_addr = signer::address_of(sender);
        assert!(quantity > 0, errors::invalid_price());

        let shop = borrow_global_mut<GiftShop>(@ember);

        // Get price
        let price = if (smart_table::contains(&shop.gift_prices, gift_type)) {
            *smart_table::borrow(&shop.gift_prices, gift_type)
        } else {
            gift_value(&gift_from_u8(gift_type))
        };

        let total_value = price * quantity;
        let fee = (total_value * shop.platform_fee_bps) / BASIS_POINTS;
        let streamer_amount = total_value - fee;

        // Transfer MOVE from sender
        let payment = coin::withdraw<AptosCoin>(sender, total_value);
        let fee_payment = coin::extract(&mut payment, fee);

        // Send to streamer and fee recipient
        coin::deposit(streamer, payment);
        coin::deposit(shop.fee_recipient, fee_payment);

        // Create gift record
        let gift_id = shop.gift_count + 1;
        let gift = Gift {
            id: gift_id,
            sender: sender_addr,
            streamer,
            gift_type: gift_from_u8(gift_type),
            quantity,
            total_value: streamer_amount,
            message,
            timestamp: timestamp::now_seconds(),
        };

        smart_table::add(&mut shop.gifts, gift_id, gift);

        // Add to streamer's gift list
        if (!smart_table::contains(&shop.streamer_gifts, streamer)) {
            smart_table::add(&mut shop.streamer_gifts, streamer, vector::empty());
        };
        vector::push_back(smart_table::borrow_mut(&mut shop.streamer_gifts, streamer), gift_id);

        // Update streamer earnings
        if (!smart_table::contains(&shop.streamer_earnings, streamer)) {
            smart_table::add(&mut shop.streamer_earnings, streamer, 0);
        };
        let earnings = smart_table::borrow_mut(&mut shop.streamer_earnings, streamer);
        *earnings = *earnings + streamer_amount;

        shop.gift_count = gift_id;

        event::emit(GiftSent { gift_id, sender: sender_addr, streamer, gift_type, quantity, total_value: streamer_amount });
    }

    // === View Functions ===

    #[view]
    public fun get_gift(gift_id: u64): Gift acquires GiftShop {
        let shop = borrow_global<GiftShop>(@ember);
        assert!(smart_table::contains(&shop.gifts, gift_id), errors::order_not_found());
        *smart_table::borrow(&shop.gifts, gift_id)
    }

    #[view]
    public fun get_gift_price(gift_type: u8): u64 acquires GiftShop {
        let shop = borrow_global<GiftShop>(@ember);
        if (smart_table::contains(&shop.gift_prices, gift_type)) {
            *smart_table::borrow(&shop.gift_prices, gift_type)
        } else {
            gift_value(&gift_from_u8(gift_type))
        }
    }

    #[view]
    public fun get_all_gift_prices(): vector<u64> acquires GiftShop {
        let shop = borrow_global<GiftShop>(@ember);
        let prices = vector::empty<u64>();
        let i = 0u8;
        while (i < 5) {
            if (smart_table::contains(&shop.gift_prices, i)) {
                vector::push_back(&mut prices, *smart_table::borrow(&shop.gift_prices, i));
            } else {
                vector::push_back(&mut prices, gift_value(&gift_from_u8(i)));
            };
            i = i + 1;
        };
        prices
    }

    #[view]
    public fun get_streamer_gifts(streamer: address, limit: u64): vector<Gift> acquires GiftShop {
        let shop = borrow_global<GiftShop>(@ember);
        if (!smart_table::contains(&shop.streamer_gifts, streamer)) {
            return vector::empty()
        };
        let gift_ids = smart_table::borrow(&shop.streamer_gifts, streamer);
        let len = vector::length(gift_ids);
        let actual_limit = if (limit < len) { limit } else { len };

        let gifts = vector::empty<Gift>();
        let i = 0;
        while (i < actual_limit && len > i) {
            let idx = len - 1 - i;
            let gift_id = *vector::borrow(gift_ids, idx);
            vector::push_back(&mut gifts, *smart_table::borrow(&shop.gifts, gift_id));
            i = i + 1;
        };
        gifts
    }

    #[view]
    public fun get_streamer_earnings(streamer: address): u64 acquires GiftShop {
        let shop = borrow_global<GiftShop>(@ember);
        if (!smart_table::contains(&shop.streamer_earnings, streamer)) {
            return 0
        };
        *smart_table::borrow(&shop.streamer_earnings, streamer)
    }

    #[view]
    public fun get_gift_count(): u64 acquires GiftShop {
        borrow_global<GiftShop>(@ember).gift_count
    }
}
