/// TipJar module for streamer tips on Ember
module ember::tip_jar {
    use std::string::String;
    use std::signer;
    use std::vector;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use ember::errors;

    // === Constants ===

    const BASIS_POINTS: u64 = 10000;
    const DEFAULT_PLATFORM_FEE: u64 = 500; // 5%

    // === Structs ===

    struct Tip has store, drop, copy {
        id: u64,
        sender: address,
        streamer: address,
        amount: u64,
        message: String,
        timestamp: u64,
    }

    struct TipJar has key {
        tips: SmartTable<u64, Tip>,
        streamer_tips: SmartTable<address, vector<u64>>,
        streamer_total: SmartTable<address, u64>,
        tip_count: u64,
        platform_fee_bps: u64,
        fee_recipient: address,
    }

    // === Events ===

    #[event]
    struct TipSent has drop, store {
        tip_id: u64,
        sender: address,
        streamer: address,
        amount: u64,
        message: String,
    }

    // === Entry Functions ===

    /// Initialize the tip jar (admin only)
    public entry fun initialize(admin: &signer, fee_recipient: address) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<TipJar>(admin_addr), errors::already_initialized());

        move_to(admin, TipJar {
            tips: smart_table::new(),
            streamer_tips: smart_table::new(),
            streamer_total: smart_table::new(),
            tip_count: 0,
            platform_fee_bps: DEFAULT_PLATFORM_FEE,
            fee_recipient,
        });
    }

    /// Send a tip to a streamer
    public entry fun send_tip(
        sender: &signer,
        streamer: address,
        amount: u64,
        message: String,
    ) acquires TipJar {
        let sender_addr = signer::address_of(sender);
        assert!(amount > 0, errors::invalid_price());

        let jar = borrow_global_mut<TipJar>(@ember);

        // Calculate fee
        let fee = (amount * jar.platform_fee_bps) / BASIS_POINTS;
        let streamer_amount = amount - fee;

        // Transfer MOVE from sender
        let payment = coin::withdraw<AptosCoin>(sender, amount);
        let fee_payment = coin::extract(&mut payment, fee);

        // Send to streamer and fee recipient
        coin::deposit(streamer, payment);
        coin::deposit(jar.fee_recipient, fee_payment);

        // Create tip record
        let tip_id = jar.tip_count + 1;
        let tip = Tip {
            id: tip_id,
            sender: sender_addr,
            streamer,
            amount: streamer_amount,
            message,
            timestamp: timestamp::now_seconds(),
        };

        smart_table::add(&mut jar.tips, tip_id, tip);

        // Add to streamer's tip list
        if (!smart_table::contains(&jar.streamer_tips, streamer)) {
            smart_table::add(&mut jar.streamer_tips, streamer, vector::empty());
        };
        vector::push_back(smart_table::borrow_mut(&mut jar.streamer_tips, streamer), tip_id);

        // Update streamer total
        if (!smart_table::contains(&jar.streamer_total, streamer)) {
            smart_table::add(&mut jar.streamer_total, streamer, 0);
        };
        let total = smart_table::borrow_mut(&mut jar.streamer_total, streamer);
        *total = *total + streamer_amount;

        jar.tip_count = tip_id;

        event::emit(TipSent { tip_id, sender: sender_addr, streamer, amount: streamer_amount, message: tip.message });
    }

    // === View Functions ===

    #[view]
    public fun get_tip(tip_id: u64): Tip acquires TipJar {
        let jar = borrow_global<TipJar>(@ember);
        assert!(smart_table::contains(&jar.tips, tip_id), errors::order_not_found());
        *smart_table::borrow(&jar.tips, tip_id)
    }

    #[view]
    public fun get_streamer_tips(streamer: address, limit: u64): vector<Tip> acquires TipJar {
        let jar = borrow_global<TipJar>(@ember);
        if (!smart_table::contains(&jar.streamer_tips, streamer)) {
            return vector::empty()
        };
        let tip_ids = smart_table::borrow(&jar.streamer_tips, streamer);
        let len = vector::length(tip_ids);
        let actual_limit = if (limit < len) { limit } else { len };

        let tips = vector::empty<Tip>();
        let i = 0;
        // Get most recent tips (from end of array)
        while (i < actual_limit && len > i) {
            let idx = len - 1 - i;
            let tip_id = *vector::borrow(tip_ids, idx);
            vector::push_back(&mut tips, *smart_table::borrow(&jar.tips, tip_id));
            i = i + 1;
        };
        tips
    }

    #[view]
    public fun get_streamer_total(streamer: address): u64 acquires TipJar {
        let jar = borrow_global<TipJar>(@ember);
        if (!smart_table::contains(&jar.streamer_total, streamer)) {
            return 0
        };
        *smart_table::borrow(&jar.streamer_total, streamer)
    }

    #[view]
    public fun get_recent_tips(limit: u64): vector<Tip> acquires TipJar {
        let jar = borrow_global<TipJar>(@ember);
        let count = jar.tip_count;
        let actual_limit = if (limit < count) { limit } else { count };

        let tips = vector::empty<Tip>();
        let i = 0;
        while (i < actual_limit) {
            let tip_id = count - i;
            if (smart_table::contains(&jar.tips, tip_id)) {
                vector::push_back(&mut tips, *smart_table::borrow(&jar.tips, tip_id));
            };
            i = i + 1;
        };
        tips
    }

    #[view]
    public fun get_tip_count(): u64 acquires TipJar {
        borrow_global<TipJar>(@ember).tip_count
    }
}
