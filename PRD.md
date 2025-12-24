# Labang (라방) — Product Requirements Document

## Live Commerce with Crypto Payments

---

## 1. Executive Summary

**Product Name:** Labang (라방)
**Tagline:** "라이브로 쇼핑, 크립토로 결제" (Shop Live, Pay Crypto)
**Category:** E-commerce / Live Streaming

Labang is a live commerce platform where streamers sell products in real-time and viewers purchase with VERY tokens. KYC-verified reviews ensure authentic feedback, and instant crypto payments remove traditional payment friction.

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

### Market Context

- Korean live commerce market: ₩10T+ (2024)
- Naver Shopping Live, Kakao Shopping dominate
- 60% of Korean shoppers have used live commerce
- Crypto payments emerging globally

---

## 3. Solution Overview

Labang creates a crypto-native live shopping experience where:

1. **Real-Time Shopping** — Buy during live streams with one tap
2. **Instant Settlement** — Sellers receive VERY immediately
3. **Verified Reviews** — Only KYC users who purchased can review
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
1. Seller opens Labang
2. Logs in with VeryChat
3. Completes seller profile:
   - Shop name
   - Category
   - About
4. KYC verified (via VeryChat)
5. Connects Wepin wallet
6. Uploads products:
   - Photos
   - Description
   - Price (in VERY)
   - Inventory
7. Seller approved (basic review)
8. Can now start streaming
```

### Flow 2: Starting a Live Stream

```
1. Seller opens dashboard
2. Clicks "라이브 시작" (Start Live)
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
4. Viewer taps "구매하기" (Buy)
5. Quantity selection
6. Wepin wallet confirms
7. Payment instant (VERY)
8. Seller notified in real-time
9. Viewer sees order confirmation
10. Continues watching
```

### Flow 4: Interactive Features

```
During stream, viewers can:
1. Send comments (real-time)
2. Send gifts (VERY tips)
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
4. Review posted with:
   - "Verified Purchase" badge
   - KYC-verified user badge
5. Review visible on product page
6. Reviewer earns VERY reward
```

---

## 6. Feature Breakdown

### Core Features (MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Live Streaming** | RTMP-based broadcasting | P0 |
| **Product Overlay** | Display products during stream | P0 |
| **One-Tap Purchase** | Buy without leaving stream | P0 |
| **Instant Payment** | VERY to seller wallet | P0 |
| **Chat** | Real-time viewer comments | P0 |
| **Product Catalog** | Seller uploads inventory | P0 |
| **Order Management** | Track orders, shipping | P0 |
| **Verified Reviews** | Purchase-gated reviews | P0 |

### Viewer Engagement

| Feature | Description | Priority |
|---------|-------------|----------|
| **Gifts/Tips** | Send VERY to streamer | P1 |
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
| **KYC Seller Badge** | Verified seller identity | P0 |
| **Verified Purchase Reviews** | Only buyers can review | P0 |
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
│                      Backend Services                       │
│  - Stream Management                                        │
│  - Order Processing                                         │
│  - Chat/Notifications                                       │
│  - Analytics                                                │
└─────────────────────────────────────────────────────────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
┌───────────────────┐ ┌───────────────────┐ ┌───────────────┐
│   Streaming       │ │   VeryChat Auth   │ │   VeryChain   │
│   Infrastructure  │ │   - Login         │ │   - Payments  │
│   - RTMP server   │ │   - KYC           │ │   - Escrow    │
│   - CDN           │ │   - Profile       │ │   - Reviews   │
└───────────────────┴─┴───────────────────┴─┴───────────────┘
```

### Smart Contracts

| Contract | Purpose |
|----------|---------|
| **OrderEscrow** | Hold payment until delivery confirmed |
| **ReviewRegistry** | Verified reviews on-chain |
| **TipJar** | Manage streamer tips |
| **GiftShop** | Virtual gift purchases |

### Data Model

**Product:**
- productId
- sellerId
- title
- description
- images[]
- price (VERY)
- inventory
- category
- reviews[]
- rating

**Stream:**
- streamId
- sellerId
- title
- status (scheduled/live/ended)
- startedAt
- endedAt
- viewers (current/peak)
- featuredProducts[]
- recording URL

**Order:**
- orderId
- buyerId
- sellerId
- productId
- quantity
- totalPrice
- status (paid/shipped/delivered/disputed)
- txHash
- createdAt
- shippingInfo

**Review:**
- reviewId
- orderId
- productId
- buyerId
- rating
- content
- photos[]
- verified (purchase + KYC)
- createdAt

---

## 8. Payment Flow

### Purchase Flow

```
Buyer clicks "Buy"
          │
          ▼
    ┌───────────┐
    │  Wepin    │
    │  Wallet   │
    └─────┬─────┘
          │ VERY
          ▼
    ┌───────────┐
    │  Escrow   │ (holds funds)
    │  Contract │
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
    │ Escrow releases   │──► Seller receives VERY
    │ to seller         │
    └───────────────────┘
```

### Fee Structure

| Fee | Amount | Recipient |
|-----|--------|-----------|
| Platform fee | 3% | Labang treasury |
| Gas | ~0.01 VERY | Network |
| Payment processing | 0% | (No card fees) |

---

## 9. Watch-to-Earn Mechanics

### Earning VERY

| Action | Reward |
|--------|--------|
| Watch 5 min | 1 VERY |
| Watch 30 min | 5 VERY |
| Comment (quality) | 0.5 VERY |
| First purchase | 10 VERY bonus |
| Leave verified review | 5 VERY |

### Anti-Farming

| Measure | Implementation |
|---------|----------------|
| Attention verification | Random captcha popups |
| Unique viewer tracking | KYC prevents multi-accounts |
| Quality comments | AI filters spam |
| Daily caps | Max 50 VERY/day from viewing |

---

## 10. Success Metrics

### Primary KPIs

| Metric | Target (3 months) |
|--------|-------------------|
| Active sellers | 200+ |
| Live streams | 1,000+ |
| Orders completed | 5,000+ |
| GMV | 1M+ VERY |
| Verified reviews | 2,000+ |

### Secondary KPIs

| Metric | Target |
|--------|--------|
| Avg viewers per stream | 50+ |
| Conversion rate | 5%+ |
| Seller repeat rate | 60% |
| Buyer repeat rate | 40% |

---

## 11. Korean Market Positioning

### Messaging

**Primary:** "라이브 쇼핑, 수수료 3%"  
(Live shopping, 3% fee)

**Secondary:** "가짜 리뷰 없는 진짜 쇼핑"  
(Real shopping without fake reviews)

### Cultural Alignment

| Korean Trend | Labang Feature |
|--------------|---------------------|
| 라이브 커머스 boom | Native live shopping |
| 리뷰 중시 | Verified-only reviews |
| 인플루언서 경제 | Streamer monetization |
| 빠른 결제 | Instant crypto payment |

### Product Categories (Korea Focus)

1. **Fashion** — 의류, 악세서리
2. **Beauty** — 화장품, 스킨케어
3. **Food** — 간식, 건강식품
4. **Home** — 생활용품
5. **Tech** — 가젯, 액세서리

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Seller fraud | Medium | High | KYC, escrow, ratings |
| Low viewer count | High | Medium | Viewer rewards, discovery |
| Streaming quality | Medium | Medium | Tech support, guidelines |
| Crypto barrier | High | Medium | Simple UX, education |
| Product quality | Medium | High | Reviews, dispute system |

---

## 13. Demo Script (For Hackathon)

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
- Wepin confirms
- Payment instant
- Seller sees order

### Scene 4: Verified Review (30 sec)
- Product delivered
- Buyer reviews
- "Verified Purchase" badge
- "KYC Verified" badge

### Scene 5: Earnings (20 sec)
- Show viewer rewards
- Seller earnings (low fees)
- "Everyone wins"

### Closing (10 sec)
- "라이브로 쇼핑, 크립토로 결제. Labang"

---

## 14. Timeline Estimate

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Design | 3 days | UI/UX, stream experience |
| Streaming Infra | 4 days | RTMP, player, CDN |
| Backend | 4 days | Orders, products, chat |
| Smart Contracts | 2 days | Escrow, reviews |
| Frontend | 5 days | All screens, overlays |
| Integration | 2 days | VeryChat, Wepin |
| Testing | 2 days | Stream testing, payments |
| Demo Prep | 1 day | Recording |
| **Total** | **~3.5 weeks** | |

---

## 15. Open Questions

1. Streaming infrastructure: Build or use service (Mux, Agora)?
2. Escrow period: How long before auto-release?
3. Minimum seller requirements (inventory, verification)?
4. Should viewers see VERY prices or fiat equivalents?
5. Return/refund policy: Who decides disputes?
