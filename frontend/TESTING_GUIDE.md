# Ember dApp Comprehensive Testing Guide

## Overview

This guide covers end-to-end testing of the Ember live commerce dApp on Movement blockchain. Tests use Playwright for browser automation.

**Test Users:**
- **User 1 (Buyer/Seller):** gabrielantony56@gmail.com
- **User 2 (Buyer):** loganfernando69@gmail.com

**Network:** Movement Testnet (chainId: 250)
**Gas:** Covered by Shinami Gas Station (gasless transactions)

---

## Prerequisites

1. Ember contracts deployed to Movement testnet
2. `NEXT_PUBLIC_EMBER_ADDRESS` set in environment
3. `NEXT_PUBLIC_PRIVY_APP_ID` configured
4. `SHINAMI_KEY` for gas sponsorship
5. Frontend running at `http://localhost:3000`

---

## Test Sections

### Section 1: Public Pages (No Auth Required)

#### 1.1 Home Page (`/`)
| Test | Action | Expected Result |
|------|--------|-----------------|
| Page loads | Navigate to `/` | Hero section with video, logo, and CTA buttons visible |
| Navigation | Click "Start Shopping" | Redirects to `/products` |
| Navigation | Click "Become a Seller" | Redirects to `/sell` |
| Navbar | Verify logo | Ember logo with text visible at top-left |
| Navbar | Click Live link | Redirects to `/live` |
| Navbar | Click Products link | Redirects to `/products` |
| Navbar | Click Sellers link | Redirects to `/sellers` |

#### 1.2 Products Page (`/products`)
| Test | Action | Expected Result |
|------|--------|-----------------|
| Page loads | Navigate to `/products` | Product grid or empty state displayed |
| Category filter | Click category buttons | Products filter by category |
| Search | Type in search box | Products filter by search term |
| Product card | If products exist, verify card | Shows image, title, price, seller |
| Product click | Click product card | Redirects to `/product/[id]` |

#### 1.3 Sellers Page (`/sellers`)
| Test | Action | Expected Result |
|------|--------|-----------------|
| Page loads | Navigate to `/sellers` | Seller grid or empty state displayed |
| Category filter | Click category buttons | Sellers filter by category |
| Search | Type in search box | Sellers filter by name |
| Seller card | If sellers exist, verify card | Shows avatar, name, verification badge |
| Seller click | Click seller card | Redirects to `/seller/[address]` |

#### 1.4 Live Page (`/live`)
| Test | Action | Expected Result |
|------|--------|-----------------|
| Page loads | Navigate to `/live` | Three sections: Live Now, Upcoming, Replays |
| Live badge | Check Live Now section | Pulsing red badge if streams exist |
| Category filter | Click category buttons | Streams filter by category |
| Sort dropdown | Change sort option | Streams reorder |

---

### Section 2: Authentication Flow

#### 2.1 Connect Wallet (Privy)
| Test | Action | Expected Result |
|------|--------|-----------------|
| Connect button | Click "Connect" in navbar | Privy modal opens |
| Email login | Enter email, click continue | OTP sent to email |
| OTP entry | Enter OTP code | Wallet created/connected |
| Wallet display | After connect | Truncated address shown in navbar |
| Logout | Click wallet dropdown > Disconnect | User logged out, Connect button shown |

**OTP Flow:**
1. Click Connect button
2. Enter email (e.g., `gabrielantony56@gmail.com`)
3. Check email for OTP
4. **PAUSE TEST - Request OTP from user**
5. Enter OTP to complete authentication

---

### Section 3: Buyer Flow (User 2: loganfernando69@gmail.com)

#### 3.1 Browse & Purchase Product
| Test | Action | Expected Result |
|------|--------|-----------------|
| Find product | Navigate to `/products`, select a product | Product detail page loads |
| Product details | Check page content | Title, description, price, seller info, reviews |
| Add to cart | Click "Buy Now" | Purchase modal opens |
| Shipping info | Fill shipping form | Name, phone, address, memo fields |
| Confirm purchase | Click "Confirm Purchase" | Transaction sent via Shinami (gasless) |
| Transaction success | Wait for confirmation | Success toast with "View TX" link |
| Order created | Check `/orders` | New order appears with "Paid" status |

**Contract Call:** `order_escrow::create_order`
- Parameters: productId, quantity, shippingInfo
- Escrow holds payment until delivery confirmed

#### 3.2 Track Orders (`/orders`)
| Test | Action | Expected Result |
|------|--------|-----------------|
| View orders | Navigate to `/orders` | List of buyer's orders |
| Filter by status | Click status tabs (All, Paid, Shipped, etc.) | Orders filter correctly |
| Order details | Click order card | Order detail modal/page opens |
| Order status | Check status badge | Matches blockchain state |

#### 3.3 Confirm Delivery
| Test | Action | Expected Result |
|------|--------|-----------------|
| Find shipped order | Filter orders by "Shipped" | Shipped orders displayed |
| Confirm delivery | Click "Confirm Delivery" button | Confirmation modal opens |
| Submit confirmation | Click confirm | Transaction sent |
| Order updated | After TX success | Status changes to "Delivered" |
| Funds released | Verify on-chain | Seller receives payment minus fee |

**Contract Call:** `order_escrow::confirm_delivery`

#### 3.4 Leave Review (After Delivery)
| Test | Action | Expected Result |
|------|--------|-----------------|
| Find delivered order | Go to delivered order | "Leave Review" button visible |
| Open review form | Click "Leave Review" | Review form modal opens |
| Fill review | Select rating (1-5), write content | Form validates |
| Submit review | Click submit | Transaction sent |
| Review saved | After TX success | Review appears on product page |

**Contract Call:** `review_registry::submit_review`
- Only allowed for delivered orders
- Verified purchase badge shown

#### 3.5 Dispute Order
| Test | Action | Expected Result |
|------|--------|-----------------|
| Find paid/shipped order | Go to active order | "Dispute" button visible |
| Open dispute | Click "Dispute Order" | Dispute form opens |
| Submit dispute | Fill reason, submit | Transaction sent |
| Order disputed | After TX success | Status changes to "Disputed" |

**Contract Call:** `order_escrow::dispute_order`

#### 3.6 Cancel Order (Before Shipping)
| Test | Action | Expected Result |
|------|--------|-----------------|
| Find paid order | Go to order with "Paid" status | "Cancel" button visible |
| Cancel order | Click "Cancel Order" | Confirmation prompt |
| Confirm cancel | Click confirm | Transaction sent |
| Order cancelled | After TX success | Status "Cancelled", refund issued |

**Contract Call:** `order_escrow::cancel_order`

---

### Section 4: Seller Flow (User 1: gabrielantony56@gmail.com)

#### 4.1 Register as Seller
| Test | Action | Expected Result |
|------|--------|-----------------|
| Go to sell page | Navigate to `/sell` | Registration form shown (if not registered) |
| Fill form | Shop name, description, category, YouTube | Form validates |
| Submit registration | Click "Register Shop" | Transaction sent |
| Registration success | After TX success | Seller dashboard loads |

**Contract Call:** `seller_registry::register_seller`

#### 4.2 Seller Dashboard (`/sell`)
| Test | Action | Expected Result |
|------|--------|-----------------|
| Dashboard loads | Navigate to `/sell` (as registered seller) | 4 tabs: Products, Orders, Go Live, Earnings |
| Products tab | Click Products tab | Product list with "Add Product" button |
| Orders tab | Click Orders tab | Seller's received orders |
| Go Live tab | Click Go Live tab | Stream setup form |
| Earnings tab | Click Earnings tab | Revenue stats and charts |

#### 4.3 Add Product
| Test | Action | Expected Result |
|------|--------|-----------------|
| Open form | Click "Add Product" | Product form modal opens |
| Fill details | Title, description, price, inventory, category | Form validates |
| Upload image | Select image file | Image uploaded to IPFS |
| Submit product | Click "Create Product" | Transaction sent |
| Product created | After TX success | Product appears in list |

**Contract Call:** `product_registry::create_product`

**IPFS Upload:** `/api/upload` → Pinata

#### 4.4 Update Product
| Test | Action | Expected Result |
|------|--------|-----------------|
| Select product | Click edit on existing product | Edit form opens with data |
| Modify fields | Change title, price, etc. | Form updates |
| Save changes | Click "Save" | Transaction sent |
| Product updated | After TX success | Changes reflected |

**Contract Call:** `product_registry::update_product`

#### 4.5 Update Inventory
| Test | Action | Expected Result |
|------|--------|-----------------|
| Find product | Go to product in list | Inventory count shown |
| Update inventory | Change inventory number | Update button enabled |
| Save inventory | Click update | Transaction sent |
| Inventory updated | After TX success | New count reflected |

**Contract Call:** `product_registry::update_inventory`

#### 4.6 Deactivate Product
| Test | Action | Expected Result |
|------|--------|-----------------|
| Find product | Go to active product | Deactivate option available |
| Deactivate | Click "Deactivate" | Confirmation prompt |
| Confirm | Click confirm | Transaction sent |
| Product deactivated | After TX success | Product hidden from store |

**Contract Call:** `product_registry::deactivate_product`

#### 4.7 Manage Orders (Seller Side)
| Test | Action | Expected Result |
|------|--------|-----------------|
| View orders | Go to Orders tab | List of received orders |
| Filter orders | Click status filters | Orders filter correctly |
| Order details | Click order | Order details shown |

#### 4.8 Mark Order Shipped
| Test | Action | Expected Result |
|------|--------|-----------------|
| Find paid order | Go to order with "Paid" status | "Mark Shipped" button visible |
| Ship order | Click "Mark Shipped" | Confirmation prompt |
| Confirm shipping | Click confirm | Transaction sent |
| Order shipped | After TX success | Status changes to "Shipped" |

**Contract Call:** `order_escrow::mark_shipped`

#### 4.9 Update Seller Profile
| Test | Action | Expected Result |
|------|--------|-----------------|
| Go to profile | Navigate to profile/settings | Edit profile option |
| Edit fields | Change shop name, description | Form validates |
| Save changes | Click save | Transaction sent |
| Profile updated | After TX success | Changes reflected |

**Contract Call:** `seller_registry::update_profile`

---

### Section 5: Live Stream Features

#### 5.1 Go Live (Seller)
| Test | Action | Expected Result |
|------|--------|-----------------|
| Open Go Live | Go to Sell > Go Live tab | Stream setup form |
| Enter YouTube URL | Paste YouTube live URL | URL validates |
| Add products | Select products for stream | Products listed |
| Start stream | Click "Go Live" | Stream page opens |

#### 5.2 Watch Stream (Buyer)
| Test | Action | Expected Result |
|------|--------|-----------------|
| Find stream | Go to `/live`, find active stream | Stream card visible |
| Open stream | Click stream card | Stream page loads |
| Video player | Check video area | YouTube embed plays |
| Product sidebar | Check right sidebar | Stream products listed |
| Quick buy | Click product "Buy" | Purchase flow opens |

#### 5.3 Send Tip
| Test | Action | Expected Result |
|------|--------|-----------------|
| Open tip modal | Click "Tip" button | Tip modal opens |
| Enter amount | Input tip amount in MOVE | Amount validates |
| Add message | Type optional message | Message field works |
| Send tip | Click "Send Tip" | Transaction sent |
| Tip success | After TX success | Tip appears in activity feed |

**Contract Call:** `tip_jar::send_tip`

#### 5.4 Send Gift
| Test | Action | Expected Result |
|------|--------|-----------------|
| Open gift modal | Click "Gift" button | Gift selector opens |
| Select gift type | Click gift (Heart, Star, Fire, Diamond, Crown) | Gift selected |
| Select quantity | Choose quantity | Price updates |
| Send gift | Click "Send" | Transaction sent |
| Gift success | After TX success | Gift animation plays |

**Contract Call:** `gift_shop::send_gift`

Gift Types & Prices:
- Heart (0): Base price
- Star (1): 2x
- Fire (2): 5x
- Diamond (3): 10x
- Crown (4): 20x

---

### Section 6: Contract Read Calls Verification

#### 6.1 Product Queries
| Query | Location | Expected |
|-------|----------|----------|
| `getProduct(id)` | Product detail page | Returns product struct |
| `getSellerProducts(addr)` | Seller profile | Returns product IDs |
| `getActiveProducts(limit)` | Products page | Returns active products |
| `getProductsByCategory(cat)` | Filtered products | Returns matching products |
| `getProductCount()` | Stats | Returns total count |

#### 6.2 Order Queries
| Query | Location | Expected |
|-------|----------|----------|
| `getOrder(id)` | Order detail | Returns order struct with fees |
| `getBuyerOrders(addr)` | /orders page | Returns buyer's orders |
| `getSellerOrders(addr)` | Sell > Orders | Returns seller's orders |
| `hasDeliveredOrder(buyer, product)` | Review button | Returns boolean |

#### 6.3 Review Queries
| Query | Location | Expected |
|-------|----------|----------|
| `getProductReviews(productId)` | Product page | Returns reviews array |
| `getProductRating(productId)` | Product card | Returns {avg, count} |
| `hasReviewedOrder(orderId)` | Order page | Returns boolean |

#### 6.4 Seller Queries
| Query | Location | Expected |
|-------|----------|----------|
| `getSeller(addr)` | Seller profile | Returns seller struct |
| `isRegisteredSeller(addr)` | /sell page | Returns boolean |
| `isVerifiedSeller(addr)` | Seller badge | Returns boolean |
| `getSellerRating(addr)` | Seller card | Returns {sum, count} |

#### 6.5 Tip & Gift Queries
| Query | Location | Expected |
|-------|----------|----------|
| `getStreamerTips(addr, limit)` | Stream page | Returns tips array |
| `getStreamerTotal(addr)` | Earnings | Returns total tips |
| `getStreamerGifts(addr, limit)` | Stream page | Returns gifts array |
| `getStreamerEarnings(addr)` | Earnings | Returns total gift value |
| `getGiftPrice(type)` | Gift modal | Returns price |

---

### Section 7: Gas Sponsorship Verification

#### 7.1 Shinami Integration
| Test | Action | Expected |
|------|--------|----------|
| Sponsored TX | Any write transaction | User pays 0 gas |
| API call | Check `/api/shinami/sponsor` | Returns sponsored TX hash |
| Fallback | If Shinami fails | User prompted to pay gas |

**Test Gas Sponsorship:**
1. Ensure user wallet has 0 MOVE
2. Attempt a transaction (e.g., create product)
3. Transaction should succeed (Shinami pays gas)
4. Verify TX on explorer shows sponsor paid fees

---

### Section 8: Error Handling

#### 8.1 Expected Errors
| Scenario | Expected Behavior |
|----------|-------------------|
| Not connected | "Connect wallet" prompt |
| Insufficient balance | Error toast with message |
| Product out of stock | "Out of stock" displayed |
| Already reviewed | Review button hidden |
| Not seller | Registration form shown |
| Network error | Retry option shown |

---

## Playwright Test Structure

```
tests/
├── auth/
│   ├── login.spec.ts          # Privy email + OTP flow
│   └── logout.spec.ts         # Disconnect wallet
├── public/
│   ├── home.spec.ts           # Home page tests
│   ├── products.spec.ts       # Products listing
│   ├── sellers.spec.ts        # Sellers listing
│   └── live.spec.ts           # Live streams
├── buyer/
│   ├── browse.spec.ts         # Product browsing
│   ├── purchase.spec.ts       # Purchase flow
│   ├── orders.spec.ts         # Order management
│   ├── reviews.spec.ts        # Review submission
│   └── dispute.spec.ts        # Dispute flow
├── seller/
│   ├── register.spec.ts       # Seller registration
│   ├── products.spec.ts       # Product CRUD
│   ├── orders.spec.ts         # Order fulfillment
│   └── earnings.spec.ts       # Earnings dashboard
├── stream/
│   ├── watch.spec.ts          # Watch stream
│   ├── tips.spec.ts           # Send tips
│   └── gifts.spec.ts          # Send gifts
└── contracts/
    ├── reads.spec.ts          # All read calls
    └── writes.spec.ts         # All write calls
```

---

## Test Data Requirements

### Products to Create (User 1)
1. **Test Product 1:** Fashion category, 100 MOVE, 10 inventory
2. **Test Product 2:** Electronics category, 250 MOVE, 5 inventory
3. **Test Product 3:** Beauty category, 50 MOVE, 20 inventory

### Orders to Create (User 2)
1. Order Product 1 → Complete full flow to Delivered
2. Order Product 2 → Test dispute flow
3. Order Product 3 → Test cancellation

---

## Environment Variables Checklist

```env
# Required
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_EMBER_ADDRESS=0x_deployed_contract_address
SHINAMI_KEY=your_shinami_api_key

# Optional but recommended
NEXT_PUBLIC_INDEXER_URL=https://your-indexer.com
PINATA_API_KEY=your_pinata_key
PINATA_API_SECRET=your_pinata_secret
```

---

## Execution Order

1. **Setup:** Deploy contracts, configure env
2. **Auth Test:** Login both users with OTP
3. **Seller Setup:** User 1 registers as seller, adds products
4. **Buyer Flow:** User 2 purchases products
5. **Order Flow:** Complete purchase → ship → deliver → review
6. **Stream Test:** User 1 goes live, User 2 watches and tips
7. **Edge Cases:** Test errors, disputes, cancellations

---

## Notes

- **OTP Handling:** Tests will pause at OTP entry - manual input required
- **Transaction Timing:** Allow 5-10 seconds for Movement testnet confirmation
- **Gas:** All transactions sponsored by Shinami - users need 0 MOVE balance
- **State Reset:** Each test run may need fresh product/order data
