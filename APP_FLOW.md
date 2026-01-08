# Ember App Flow & Testing Guide

## Quick Start Testing

### Prerequisites
```bash
# 1. Install dependencies
pnpm install

# 2. Set environment variables (copy from .env.example)
cp .env.example .env.local

# 3. Required env vars:
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_MODULE_ADDRESS=<deployed_contract_address>
SHINAMI_KEY=<your_shinami_key>  # For gasless transactions

# 4. Start the app
pnpm dev
```

### Testing URLs
- **Local:** http://localhost:3000
- **Dev pages:** `/basic-web3`, `/contracts`, `/indexer`

---

## Complete Testing Flow

### 1. Wallet Connection
1. Visit http://localhost:3000
2. Click "Connect Wallet" in navbar
3. Connect via Privy (email) or native Aptos wallet
4. Verify wallet address appears in navbar

### 2. Seller Registration & Verification
1. Navigate to `/sell`
2. Fill seller profile form:
   - Shop name, description, category
   - YouTube channel URL (optional)
3. Submit for verification
4. **Admin step:** Call `verify_seller` on contract
5. Refresh - status should show "Verified"

### 3. Product Creation (Requires Verified Seller)
1. Go to `/sell` → Products tab
2. Click "Add Product"
3. Fill product details:
   - Title, description, image
   - Price (in MOVE), inventory, category
4. Submit transaction
5. Product appears in Products tab
6. Verify at `/products` (public listing)

### 4. Buyer Purchase Flow
1. Browse `/products` or go to `/product/[id]`
2. Click "Buy Now"
3. Select quantity, enter shipping address
4. Confirm payment in wallet
5. Order created → Check `/orders`

### 5. Order Fulfillment
**Seller:**
1. Go to `/sell` → Orders tab
2. See new order with "Paid" status
3. Click "Mark as Shipped"

**Buyer:**
1. Go to `/orders`
2. See order with "Shipped" status
3. Click "Confirm Delivery"
4. Funds released to seller

### 6. Review Submission (Post-Delivery Only)
1. Navigate to delivered order or product page
2. Click "Leave Review"
3. Rate 1-5 stars, write review
4. Submit on-chain
5. Review appears with "Verified Buyer" badge

### 7. Live Streaming
**Seller - Start Stream:**
1. Go to `/sell` → Go Live tab
2. Enter stream title
3. Select products to feature
4. Paste YouTube video URL
5. Click "Start Stream"

**Viewer - Watch & Interact:**
1. Browse `/live` to see active streams
2. Click stream to watch at `/live/[streamId]`
3. Send gifts (Heart, Star, Fire, Diamond, Crown)
4. Send tips (custom amount)
5. Buy featured products with one-tap

---

## User Flows Summary

### Buyer Journey
```
Connect Wallet → Browse Products → View Product Details
→ Purchase (escrow) → Track Order → Confirm Delivery
→ Leave Review → Watch Streams → Send Gifts/Tips
```

### Seller Journey
```
Connect Wallet → Register Seller → Get Verified
→ Create Products → Receive Orders → Ship & Mark Shipped
→ Buyer Confirms → Receive Payment → Go Live → Earn Tips/Gifts
```

---

## Smart Contracts Overview

| Contract | Purpose |
|----------|---------|
| `SellerRegistry` | Seller profiles & verification |
| `ProductRegistry` | Product catalog (3% fee) |
| `OrderEscrow` | Payments & order lifecycle |
| `ReviewRegistry` | Verified purchase reviews |
| `GiftShop` | Virtual gifts (10% fee) |
| `TipJar` | Direct tips (5% fee) |

---

## Order Status Flow
```
Paid → Shipped → Delivered
  ↓        ↓
Cancelled  Disputed
```

---

## Key Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/products` | Browse all products |
| `/product/[id]` | Product details |
| `/sellers` | Seller directory |
| `/seller/[id]` | Seller profile |
| `/live` | Browse streams |
| `/live/[id]` | Watch stream |
| `/orders` | Buyer orders |
| `/sell` | Seller dashboard |
| `/profile` | User profile |

---

## API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/shinami/sponsor` | Sponsor gasless TX |
| `POST /api/upload` | Upload to IPFS |
| `POST /api/ipfs/json` | Upload JSON metadata |

---

## Testing Checklist

- [ ] Wallet connects successfully
- [ ] Seller registration works
- [ ] Admin can verify seller
- [ ] Verified seller can create products
- [ ] Products appear in public listing
- [ ] Buyer can purchase product
- [ ] Order appears in buyer's orders
- [ ] Order appears in seller's dashboard
- [ ] Seller can mark as shipped
- [ ] Buyer can confirm delivery
- [ ] Funds released to seller
- [ ] Buyer can leave verified review
- [ ] Seller can start live stream
- [ ] Viewers can see stream
- [ ] Gifts work (10% fee)
- [ ] Tips work (5% fee)
- [ ] Featured products buyable from stream

---

## Troubleshooting

**Wallet not connecting:**
- Check Privy app ID in env vars
- Try native Aptos wallet extension

**Transaction failing:**
- Verify contract address is correct
- Check SHINAMI_KEY for gas sponsorship
- Ensure sufficient MOVE balance

**Products not showing:**
- Verify seller is verified
- Check product is active
- Refresh page / clear cache

**Review blocked:**
- Must have delivered order for that product
- Can only review once per order
