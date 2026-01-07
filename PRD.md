# Ember — Product Requirements Document

## Live Commerce with Crypto Payments on Movement

---

## 1. Executive Summary

**Product Name:** Ember
**Tagline:** "Ignite Your Shopping Experience"
**Category:** E-commerce / Live Streaming / Web3

Ember is a live commerce platform built on Movement blockchain where streamers sell products in real-time and viewers purchase with crypto. On-chain verified reviews ensure authentic feedback, and instant crypto payments remove traditional payment friction.

---

## 2. Problem Statement

### The Live Commerce Trust Gap

Live commerce is exploding, but trust issues persist.

**Current Pain Points:**

| Problem | Impact |
|---------|--------|
| **Fake Reviews** | Paid/bot reviews distort product perception |
| **Payment Delays** | Sellers wait days for settlement |
| **High Fees** | Platforms take 10-30% |
| **Chargebacks** | Fraudulent buyers reverse payments |
| **No Viewer Rewards** | Watching brings no value |

---

## 3. Solution Overview

Ember creates a crypto-native live shopping experience where:

1. **Real-Time Shopping** — Buy during live streams with one tap
2. **Instant Settlement** — Sellers receive payment immediately
3. **Verified Reviews** — Only purchasers can review (on-chain verified)
4. **Watch-to-Earn** — Viewers earn for engagement
5. **Low Fees** — 3% vs. 20%+ on traditional platforms

---

## 4. Target Users

### Sellers/Streamers

**Primary: Small Business Owners**
- Fashion, beauty, food sellers
- Looking for new channels
- Comfortable with live video

**Secondary: Influencers**
- Already have audience
- Want to monetize beyond ads
- Affiliate/commission model

### Buyers/Viewers

**Primary: Young Shoppers (18-35)**
- Active on live platforms
- Crypto-curious
- Enjoy interactive shopping

**Secondary: Deal Hunters**
- Looking for flash sales
- Live-exclusive discounts

---

## 5. User Flows

### Flow 1: Seller Onboarding

```
1. Seller opens Ember
2. Connects Movement wallet
3. Completes seller profile:
   - Shop name
   - Category
   - About
4. Identity verification
5. Uploads products:
   - Photos
   - Description
   - Price (in MOVE)
   - Inventory
6. Seller approved
7. Can now start streaming
```

### Flow 2: Starting a Live Stream

```
1. Seller opens dashboard
2. Clicks "Go Live"
3. Configures stream:
   - Title
   - Products to feature
   - Stream duration
   - Special offers
4. Sets up camera/audio
5. Goes live
6. Viewers start joining
```

### Flow 3: Buying During Stream

```
1. Viewer watching live stream
2. Streamer showcases product
3. Product card appears on screen
4. Viewer taps "Buy Now"
5. Quantity selection
6. Wallet confirms transaction
7. Payment instant (MOVE)
8. Seller notified in real-time
9. Viewer sees order confirmation
10. Continues watching
```

### Flow 4: Interactive Features

```
During stream, viewers can:
1. Send comments (real-time)
2. Send gifts (crypto tips)
3. React (emojis, effects)
4. Ask questions
5. Request product demos
6. Participate in polls
7. Enter giveaways

Streamer sees all interactions
Can respond live
Creates engagement
```

### Flow 5: Post-Purchase Review

```
1. Product delivered
2. Buyer prompted to review
3. Review form:
   - Star rating (1-5)
   - Photo/video (optional)
   - Written review
4. Review posted on-chain with:
   - "Verified Purchase" badge
   - Verified buyer badge
5. Review visible on product page
6. Reviewer earns MOVE reward
```

---

## 6. Feature Breakdown

### Core Features (MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Live Streaming** | RTMP-based broadcasting | P0 |
| **Product Overlay** | Display products during stream | P0 |
| **One-Tap Purchase** | Buy without leaving stream | P0 |
| **Instant Payment** | MOVE to seller wallet | P0 |
| **Chat** | Real-time viewer comments | P0 |
| **Product Catalog** | Seller uploads inventory | P0 |
| **Order Management** | Track orders, shipping | P0 |
| **Verified Reviews** | Purchase-gated reviews (on-chain) | P0 |

### Viewer Engagement

| Feature | Description | Priority |
|---------|-------------|----------|
| **Gifts/Tips** | Send crypto to streamer | P1 |
| **Reactions** | Emoji reactions | P1 |
| **Polls** | Interactive voting | P1 |
| **Watch-to-Earn** | Earn for viewing | P1 |
| **Giveaways** | Random viewer prizes | P1 |
| **Q&A Mode** | Structured questions | P2 |

### Seller Tools

| Feature | Description | Priority |
|---------|-------------|----------|
| **Analytics Dashboard** | Views, sales, engagement | P1 |
| **Flash Sales** | Limited-time discounts | P1 |
| **Countdown Timers** | Urgency creation | P1 |
| **Multi-Product Showcase** | Rotate featured items | P1 |
| **Stream Scheduling** | Announce upcoming streams | P1 |
| **Replay Upload** | VOD for missed streams | P2 |

### Trust Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Verified Seller Badge** | Verified seller identity | P0 |
| **Verified Purchase Reviews** | Only buyers can review (on-chain) | P0 |
| **Seller Ratings** | Aggregate score | P0 |
| **Dispute Resolution** | Buyer/seller conflicts | P1 |
| **Return Policy Display** | Clear refund terms | P1 |

---

## 7. Technical Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  - Live Stream Player                                       │
│  - Product Overlays                                         │
│  - Chat Interface                                           │
│  - Seller Dashboard                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Movement Blockchain                      │
│  - All state stored on-chain                                │
│  - No database dependency                                   │
│  - Fully decentralized                                      │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────┐
│   Streaming       │ │   Movement        │ │   Indexer     │
│   Infrastructure  │ │   Wallet          │ │   (Query)     │
│   - RTMP server   │ │   - Auth          │ │   - Events    │
│   - CDN           │ │   - Signing       │ │   - History   │
└───────────────────┴─┴───────────────────┴─┴───────────────┘
```

### Move Modules

| Module | Purpose |
|--------|---------|
| **order_escrow** | Hold payment until delivery confirmed |
| **review_registry** | Verified reviews on-chain |
| **product_registry** | Product catalog management |
| **seller_registry** | Seller profiles and verification |
| **tip_jar** | Manage streamer tips |
| **gift_shop** | Virtual gift purchases |

### Data Model (On-Chain)

**Product:**
- product_id
- seller_address
- title
- description
- images[]
- price (MOVE)
- inventory
- category
- rating

**Order:**
- order_id
- buyer_address
- seller_address
- product_id
- quantity
- total_price
- status (paid/shipped/delivered/disputed)
- created_at

**Review:**
- review_id
- order_id
- product_id
- buyer_address
- rating
- content
- verified (purchase proof on-chain)
- created_at

---

## 8. Payment Flow

### Purchase Flow

```
Buyer clicks "Buy"
          │
          ▼
    ┌───────────┐
    │  Movement │
    │  Wallet   │
    └─────┬─────┘
          │ MOVE
          ▼
    ┌───────────┐
    │  Escrow   │ (holds funds on-chain)
    │  Module   │
    └─────┬─────┘
          │
          ▼
    ┌───────────────────┐
    │ Seller ships      │
    │ Buyer confirms    │
    └─────────┬─────────┘
              │
              ▼
    ┌───────────────────┐
    │ Escrow releases   │──► Seller receives MOVE
    │ to seller         │
    └───────────────────┘
```

### Fee Structure

| Fee | Amount | Recipient |
|-----|--------|-----------|
| Platform fee | 3% | Ember treasury |
| Gas | Minimal | Network |
| Payment processing | 0% | (No card fees) |

---

## 9. Watch-to-Earn Mechanics

### Earning MOVE

| Action | Reward |
|--------|--------|
| Watch 5 min | Small reward |
| Watch 30 min | Larger reward |
| Comment (quality) | Bonus |
| First purchase | Welcome bonus |
| Leave verified review | Review reward |

### Anti-Farming

| Measure | Implementation |
|---------|----------------|
| Attention verification | Random captcha popups |
| Unique viewer tracking | Wallet-based identity |
| Quality comments | AI filters spam |
| Daily caps | Max earnings/day from viewing |

---

## 10. Success Metrics

### Primary KPIs

| Metric | Target (3 months) |
|--------|-------------------|
| Active sellers | 200+ |
| Live streams | 1,000+ |
| Orders completed | 5,000+ |
| GMV | Significant MOVE volume |
| Verified reviews | 2,000+ |

### Secondary KPIs

| Metric | Target |
|--------|--------|
| Avg viewers per stream | 50+ |
| Conversion rate | 5%+ |
| Seller repeat rate | 60% |
| Buyer repeat rate | 40% |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Seller fraud | Medium | High | Verification, escrow, ratings |
| Low viewer count | High | Medium | Viewer rewards, discovery |
| Streaming quality | Medium | Medium | Tech support, guidelines |
| Crypto barrier | High | Medium | Simple UX, education |
| Product quality | Medium | High | Reviews, dispute system |

---

## 12. Demo Script

### Scene 1: The Problem (20 sec)
- "Traditional live commerce: 20% fees"
- "Fake reviews everywhere"

### Scene 2: Seller Goes Live (40 sec)
- Seller starts stream
- Showcases product
- Viewers join
- Chat active

### Scene 3: One-Tap Purchase (40 sec)
- Viewer taps product
- Wallet confirms
- Payment instant
- Seller sees order

### Scene 4: Verified Review (30 sec)
- Product delivered
- Buyer reviews
- "Verified Purchase" badge on-chain
- Transparent and trustworthy

### Scene 5: Earnings (20 sec)
- Show viewer rewards
- Seller earnings (low fees)
- "Everyone wins"

### Closing (10 sec)
- "Ignite Your Shopping. Ember"

---

## 13. Open Questions

1. Streaming infrastructure: Build or use service (Mux, Agora)?
2. Escrow period: How long before auto-release?
3. Minimum seller requirements (inventory, verification)?
4. Movement wallet integration options?
5. Return/refund policy: Who decides disputes?
