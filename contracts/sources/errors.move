/// Error codes for Ember commerce platform
module ember::errors {
    // === General errors ===
    const E_NOT_INITIALIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_UNAUTHORIZED: u64 = 3;

    // === Seller errors (100-199) ===
    const E_SELLER_NOT_FOUND: u64 = 100;
    const E_SELLER_NOT_VERIFIED: u64 = 101;
    const E_SELLER_ALREADY_EXISTS: u64 = 102;
    const E_EMPTY_SHOP_NAME: u64 = 103;

    // === Product errors (200-299) ===
    const E_PRODUCT_NOT_FOUND: u64 = 200;
    const E_INSUFFICIENT_INVENTORY: u64 = 201;
    const E_INVALID_PRICE: u64 = 202;
    const E_NOT_PRODUCT_OWNER: u64 = 203;
    const E_PRODUCT_INACTIVE: u64 = 204;

    // === Order errors (300-399) ===
    const E_ORDER_NOT_FOUND: u64 = 300;
    const E_INVALID_ORDER_STATUS: u64 = 301;
    const E_NOT_ORDER_BUYER: u64 = 302;
    const E_NOT_ORDER_SELLER: u64 = 303;

    // === Review errors (400-499) ===
    const E_NOT_VERIFIED_BUYER: u64 = 401;
    const E_ALREADY_REVIEWED: u64 = 402;
    const E_INVALID_RATING: u64 = 403;

    // === Getter functions ===
    public fun not_initialized(): u64 { E_NOT_INITIALIZED }
    public fun already_initialized(): u64 { E_ALREADY_INITIALIZED }
    public fun unauthorized(): u64 { E_UNAUTHORIZED }

    public fun seller_not_found(): u64 { E_SELLER_NOT_FOUND }
    public fun seller_not_verified(): u64 { E_SELLER_NOT_VERIFIED }
    public fun seller_already_exists(): u64 { E_SELLER_ALREADY_EXISTS }
    public fun empty_shop_name(): u64 { E_EMPTY_SHOP_NAME }

    public fun product_not_found(): u64 { E_PRODUCT_NOT_FOUND }
    public fun insufficient_inventory(): u64 { E_INSUFFICIENT_INVENTORY }
    public fun invalid_price(): u64 { E_INVALID_PRICE }
    public fun not_product_owner(): u64 { E_NOT_PRODUCT_OWNER }
    public fun product_inactive(): u64 { E_PRODUCT_INACTIVE }

    public fun order_not_found(): u64 { E_ORDER_NOT_FOUND }
    public fun invalid_order_status(): u64 { E_INVALID_ORDER_STATUS }
    public fun not_order_buyer(): u64 { E_NOT_ORDER_BUYER }
    public fun not_order_seller(): u64 { E_NOT_ORDER_SELLER }

    public fun not_verified_buyer(): u64 { E_NOT_VERIFIED_BUYER }
    public fun already_reviewed(): u64 { E_ALREADY_REVIEWED }
    public fun invalid_rating(): u64 { E_INVALID_RATING }
}
