/// Shared types for Ember commerce platform
module ember::types {
    /// Order status enum
    enum OrderStatus has store, drop, copy {
        Created,
        Paid,
        Shipped,
        Delivered,
        Disputed,
        Refunded,
        Cancelled
    }

    /// Product category enum
    enum Category has store, drop, copy {
        Fashion,
        Beauty,
        Food,
        Home,
        Tech,
        Other
    }

    /// Seller verification status
    enum SellerStatus has store, drop, copy {
        Pending,
        Verified,
        Suspended
    }

    /// Gift types for live streaming
    enum GiftType has store, drop, copy {
        Heart,
        Star,
        Fire,
        Diamond,
        Crown
    }

    // === Helper functions for Category ===

    public fun category_from_u8(value: u8): Category {
        if (value == 0) { Category::Fashion }
        else if (value == 1) { Category::Beauty }
        else if (value == 2) { Category::Food }
        else if (value == 3) { Category::Home }
        else if (value == 4) { Category::Tech }
        else { Category::Other }
    }

    public fun category_to_u8(cat: &Category): u8 {
        match (cat) {
            Category::Fashion => 0,
            Category::Beauty => 1,
            Category::Food => 2,
            Category::Home => 3,
            Category::Tech => 4,
            Category::Other => 5,
        }
    }

    // === Helper functions for SellerStatus ===

    public fun seller_status_pending(): SellerStatus { SellerStatus::Pending }
    public fun seller_status_verified(): SellerStatus { SellerStatus::Verified }
    public fun seller_status_suspended(): SellerStatus { SellerStatus::Suspended }

    public fun is_verified(status: &SellerStatus): bool {
        match (status) {
            SellerStatus::Verified => true,
            _ => false,
        }
    }

    // === Helper functions for OrderStatus ===

    public fun order_status_created(): OrderStatus { OrderStatus::Created }
    public fun order_status_paid(): OrderStatus { OrderStatus::Paid }
    public fun order_status_shipped(): OrderStatus { OrderStatus::Shipped }
    public fun order_status_delivered(): OrderStatus { OrderStatus::Delivered }
    public fun order_status_disputed(): OrderStatus { OrderStatus::Disputed }
    public fun order_status_refunded(): OrderStatus { OrderStatus::Refunded }
    public fun order_status_cancelled(): OrderStatus { OrderStatus::Cancelled }

    // === Helper functions for GiftType ===

    public fun gift_from_u8(value: u8): GiftType {
        if (value == 0) { GiftType::Heart }
        else if (value == 1) { GiftType::Star }
        else if (value == 2) { GiftType::Fire }
        else if (value == 3) { GiftType::Diamond }
        else { GiftType::Crown }
    }

    public fun gift_value(gift: &GiftType): u64 {
        match (gift) {
            GiftType::Heart => 100_000_000,      // 1 MOVE
            GiftType::Star => 500_000_000,       // 5 MOVE
            GiftType::Fire => 1_000_000_000,     // 10 MOVE
            GiftType::Diamond => 5_000_000_000,  // 50 MOVE
            GiftType::Crown => 10_000_000_000,   // 100 MOVE
        }
    }
}
