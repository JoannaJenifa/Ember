/// Order escrow module for Ember commerce platform (uses tUSDC)
module ember::order_escrow {
    use std::string::String;
    use std::signer;
    use std::vector;
    use aptos_std::smart_table::{Self, SmartTable};
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use ember::types::{Self, OrderStatus};
    use ember::errors;
    use ember::product_registry;
    use ember::seller_registry;
    use ember::test_tokens;

    const BASIS_POINTS: u64 = 10000;
    const DEFAULT_PLATFORM_FEE: u64 = 300; // 3%

    struct Order has store, drop, copy {
        id: u64, buyer: address, seller: address, product_id: u64, quantity: u64,
        total_price: u64, platform_fee: u64, seller_amount: u64, status: OrderStatus,
        shipping_info: String, created_at: u64, shipped_at: u64, delivered_at: u64,
    }

    struct OrderEscrow has key {
        orders: SmartTable<u64, Order>,
        buyer_orders: SmartTable<address, vector<u64>>,
        seller_orders: SmartTable<address, vector<u64>>,
        escrow_balance: u64,
        order_count: u64, auto_release_days: u64, platform_fee_bps: u64, fee_recipient: address,
    }

    #[event]
    struct OrderCreated has drop, store { order_id: u64, buyer: address, seller: address, product_id: u64, total_price: u64 }
    #[event]
    struct OrderShipped has drop, store { order_id: u64, shipped_at: u64 }
    #[event]
    struct OrderDelivered has drop, store { order_id: u64, seller_amount: u64, platform_fee: u64 }
    #[event]
    struct OrderDisputed has drop, store { order_id: u64 }
    #[event]
    struct OrderCancelled has drop, store { order_id: u64, refund_amount: u64 }

    public entry fun initialize(admin: &signer, fee_recipient: address, auto_release_days: u64) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<OrderEscrow>(admin_addr), errors::already_initialized());
        move_to(admin, OrderEscrow {
            orders: smart_table::new(), buyer_orders: smart_table::new(),
            seller_orders: smart_table::new(), escrow_balance: 0,
            order_count: 0, auto_release_days, platform_fee_bps: DEFAULT_PLATFORM_FEE, fee_recipient,
        });
    }

    public entry fun create_order(buyer: &signer, product_id: u64, quantity: u64, shipping_info: String) acquires OrderEscrow {
        let buyer_addr = signer::address_of(buyer);
        let escrow = borrow_global_mut<OrderEscrow>(@ember);
        let seller = product_registry::get_product_seller(product_id);
        let price = product_registry::get_product_price(product_id);
        assert!(product_registry::is_product_active(product_id), errors::product_inactive());

        let total_price = price * quantity;
        let platform_fee = (total_price * escrow.platform_fee_bps) / BASIS_POINTS;
        let seller_amount = total_price - platform_fee;

        // Transfer tUSDC from buyer to escrow (@ember holds the funds)
        test_tokens::transfer_tusdc(@ember, buyer_addr, @ember, total_price);
        escrow.escrow_balance = escrow.escrow_balance + total_price;

        product_registry::record_sale(product_id, quantity);

        let order_id = escrow.order_count + 1;
        let order = Order {
            id: order_id, buyer: buyer_addr, seller, product_id, quantity, total_price,
            platform_fee, seller_amount, status: types::order_status_paid(), shipping_info,
            created_at: timestamp::now_seconds(), shipped_at: 0, delivered_at: 0,
        };
        smart_table::add(&mut escrow.orders, order_id, order);
        add_to_list(&mut escrow.buyer_orders, buyer_addr, order_id);
        add_to_list(&mut escrow.seller_orders, seller, order_id);
        escrow.order_count = order_id;
        event::emit(OrderCreated { order_id, buyer: buyer_addr, seller, product_id, total_price });
    }

    public entry fun mark_shipped(seller: &signer, order_id: u64) acquires OrderEscrow {
        let seller_addr = signer::address_of(seller);
        let escrow = borrow_global_mut<OrderEscrow>(@ember);
        assert!(smart_table::contains(&escrow.orders, order_id), errors::order_not_found());
        let order = smart_table::borrow_mut(&mut escrow.orders, order_id);
        assert!(order.seller == seller_addr, errors::not_order_seller());
        assert!(order.status == types::order_status_paid(), errors::invalid_order_status());
        order.status = types::order_status_shipped();
        order.shipped_at = timestamp::now_seconds();
        event::emit(OrderShipped { order_id, shipped_at: order.shipped_at });
    }

    public entry fun confirm_delivery(buyer: &signer, order_id: u64) acquires OrderEscrow {
        let buyer_addr = signer::address_of(buyer);
        let escrow = borrow_global_mut<OrderEscrow>(@ember);
        assert!(smart_table::contains(&escrow.orders, order_id), errors::order_not_found());
        let order = smart_table::borrow_mut(&mut escrow.orders, order_id);
        assert!(order.buyer == buyer_addr, errors::not_order_buyer());
        assert!(order.status == types::order_status_shipped(), errors::invalid_order_status());
        order.status = types::order_status_delivered();
        order.delivered_at = timestamp::now_seconds();
        let (seller_amount, platform_fee, seller, fee_recipient) =
            (order.seller_amount, order.platform_fee, order.seller, escrow.fee_recipient);

        // Transfer tUSDC from escrow to seller and fee recipient
        test_tokens::transfer_tusdc(@ember, @ember, seller, seller_amount);
        test_tokens::transfer_tusdc(@ember, @ember, fee_recipient, platform_fee);
        escrow.escrow_balance = escrow.escrow_balance - order.total_price;

        seller_registry::record_sale(seller, seller_amount);
        event::emit(OrderDelivered { order_id, seller_amount, platform_fee });
    }

    public entry fun dispute_order(buyer: &signer, order_id: u64) acquires OrderEscrow {
        let buyer_addr = signer::address_of(buyer);
        let escrow = borrow_global_mut<OrderEscrow>(@ember);
        assert!(smart_table::contains(&escrow.orders, order_id), errors::order_not_found());
        let order = smart_table::borrow_mut(&mut escrow.orders, order_id);
        assert!(order.buyer == buyer_addr, errors::not_order_buyer());
        assert!(order.status == types::order_status_paid() || order.status == types::order_status_shipped(), errors::invalid_order_status());
        order.status = types::order_status_disputed();
        event::emit(OrderDisputed { order_id });
    }

    public entry fun cancel_order(buyer: &signer, order_id: u64) acquires OrderEscrow {
        let buyer_addr = signer::address_of(buyer);
        let escrow = borrow_global_mut<OrderEscrow>(@ember);
        assert!(smart_table::contains(&escrow.orders, order_id), errors::order_not_found());
        let order = smart_table::borrow_mut(&mut escrow.orders, order_id);
        assert!(order.buyer == buyer_addr, errors::not_order_buyer());
        assert!(order.status == types::order_status_paid(), errors::invalid_order_status());
        order.status = types::order_status_cancelled();
        let refund_amount = order.total_price;

        // Refund tUSDC to buyer
        test_tokens::transfer_tusdc(@ember, @ember, buyer_addr, refund_amount);
        escrow.escrow_balance = escrow.escrow_balance - refund_amount;

        event::emit(OrderCancelled { order_id, refund_amount });
    }

    fun add_to_list(table: &mut SmartTable<address, vector<u64>>, addr: address, id: u64) {
        if (!smart_table::contains(table, addr)) { smart_table::add(table, addr, vector::empty()); };
        vector::push_back(smart_table::borrow_mut(table, addr), id);
    }

    #[view]
    public fun get_order(order_id: u64): Order acquires OrderEscrow {
        let escrow = borrow_global<OrderEscrow>(@ember);
        assert!(smart_table::contains(&escrow.orders, order_id), errors::order_not_found());
        *smart_table::borrow(&escrow.orders, order_id)
    }

    #[view]
    public fun get_buyer_orders(buyer: address): vector<u64> acquires OrderEscrow {
        let escrow = borrow_global<OrderEscrow>(@ember);
        if (!smart_table::contains(&escrow.buyer_orders, buyer)) { return vector::empty() };
        *smart_table::borrow(&escrow.buyer_orders, buyer)
    }

    #[view]
    public fun get_seller_orders(seller: address): vector<u64> acquires OrderEscrow {
        let escrow = borrow_global<OrderEscrow>(@ember);
        if (!smart_table::contains(&escrow.seller_orders, seller)) { return vector::empty() };
        *smart_table::borrow(&escrow.seller_orders, seller)
    }

    #[view]
    public fun get_order_count(): u64 acquires OrderEscrow { borrow_global<OrderEscrow>(@ember).order_count }

    #[view]
    public fun has_delivered_order(buyer: address, product_id: u64): bool acquires OrderEscrow {
        let escrow = borrow_global<OrderEscrow>(@ember);
        if (!smart_table::contains(&escrow.buyer_orders, buyer)) { return false };
        let order_ids = smart_table::borrow(&escrow.buyer_orders, buyer);
        let i = 0;
        while (i < vector::length(order_ids)) {
            let order = smart_table::borrow(&escrow.orders, *vector::borrow(order_ids, i));
            if (order.product_id == product_id && order.status == types::order_status_delivered()) { return true };
            i = i + 1;
        };
        false
    }

    #[view]
    public fun get_order_buyer(order_id: u64): address acquires OrderEscrow { get_order(order_id).buyer }
    #[view]
    public fun get_order_seller(order_id: u64): address acquires OrderEscrow { get_order(order_id).seller }
    #[view]
    public fun get_order_product_id(order_id: u64): u64 acquires OrderEscrow { get_order(order_id).product_id }
    #[view]
    public fun get_order_status(order_id: u64): OrderStatus acquires OrderEscrow { get_order(order_id).status }
    #[view]
    public fun is_order_delivered(order_id: u64): bool acquires OrderEscrow { get_order(order_id).status == types::order_status_delivered() }
}
