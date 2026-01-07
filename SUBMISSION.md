# Ember - Hackathon Submission

## 1. One-Liner Vision

**Live commerce platform where streamers sell products in real-time and viewers purchase with crypto, featuring on-chain verified reviews and instant settlements on Movement blockchain.**

---

## 2. GitHub URL

**TBD**

---

## 3. Key Innovation Domains

1. **Live Commerce / Social Commerce**
2. **DeFi Payments & Escrow**
3. **Decentralized Identity & Reputation**
4. **Movement Blockchain Native**

---

## 4. Detailed Description

### Problem

Live commerce is a massive market, yet suffers from critical trust issues:
- **Fake reviews** distort product perception (paid/bot reviews everywhere)
- **Payment delays** force sellers to wait days for settlement
- **High platform fees** of 10-30% eat into seller margins
- **Chargebacks** enable fraudulent buyers to reverse legitimate payments
- **No viewer rewards** — watching streams provides no tangible value

### Solution: Ember

Ember is a crypto-native live shopping platform built on Movement blockchain that solves these problems:

**Real-Time Shopping**
- Viewers buy products during live streams with one tap
- Product overlays appear seamlessly during broadcasts
- No need to leave the stream to complete purchases

**Instant Settlement**
- Sellers receive MOVE tokens immediately via smart contract escrow
- No more waiting days for payment processing
- 3% platform fee vs 20%+ on traditional platforms

**Verified Reviews Only**
- Only verified users who actually purchased can leave reviews
- Eliminates fake review problem entirely
- Reviews stored on-chain for transparency and immutability

**Watch-to-Earn**
- Viewers earn tokens for engagement (watching, quality comments, reviews)
- Anti-farming measures via attention verification and daily caps
- Creates sustainable viewer economy

### Technical Implementation

**Move Modules:**
- `order_escrow` - Holds payment until delivery confirmed
- `review_registry` - Verified reviews on-chain
- `product_registry` - Product catalog management
- `seller_registry` - Seller profiles and verification
- `tip_jar` - Manages streamer tips/gifts
- `gift_shop` - Virtual gift purchases during streams

**Stack:**
- Frontend: Next.js + shadcn/ui
- Blockchain: Movement (Move language)
- Wallet: Movement-compatible wallet
- Indexing: Movement indexer

### Key Features

| Feature | Description |
|---------|-------------|
| Live Streaming | RTMP-based broadcasting with product overlays |
| One-Tap Purchase | Buy without leaving the stream |
| Instant Payment | MOVE transferred via escrow module |
| Real-Time Chat | Viewer comments and interactions |
| Gifts & Tips | Send crypto to streamers |
| Verified Reviews | Purchase-gated reviews (on-chain) |
| Watch-to-Earn | Earn rewards for engagement |
| Seller Dashboard | Analytics, order management, flash sales |

### Why Movement?

- Move language provides secure, verifiable smart contracts
- Low transaction fees enable micro-transactions (tips, small purchases)
- High throughput for real-time commerce
- Growing ecosystem with strong developer tools

### Tagline

**"Ignite Your Shopping Experience"**
