# Ember - Movement Hackathon Submission

## Tagline
**"Live Commerce, On-Chain. Shop Live. Pay Instant. Trust Verified."**

---

## Table of Contents
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Smart Contracts](#smart-contracts)
- [Business Model](#business-model)
- [Market Opportunity](#market-opportunity)
- [Competitive Advantage](#competitive-advantage)
- [Future Roadmap](#future-roadmap)
- [Demo & Links](#demo--links)

---

## Problem Statement

### The Broken State of Live Commerce

Live commerce (live streaming + e-commerce) is a **$500B+ market** in Asia, growing rapidly in the West. But current platforms have critical flaws:

#### 1. Payment Friction
- Traditional payment processors charge 3-5% + currency conversion fees
- Cross-border purchases require multiple intermediaries
- Chargebacks cost merchants billions annually
- Settlement takes 14-30 days

#### 2. Fake Reviews Epidemic
- 30% of online reviews are fake (Amazon estimates)
- No way to verify reviewer actually purchased the product
- Trust erosion costs e-commerce $152B annually
- Platforms profit from fake positive reviews

#### 3. Creator Exploitation
- Platforms take 30-50% of creator earnings (YouTube, TikTok Shop)
- Delayed payouts (Net-30, Net-60)
- Arbitrary account suspensions
- No ownership of audience/data

#### 4. Buyer Risk
- Escrow controlled by centralized platform
- Dispute resolution is opaque
- No guarantee funds are actually held

---

## Solution

### Ember: Trustless Live Commerce on Movement

Ember is a **fully on-chain live commerce platform** where:

- **Streamers** showcase products in real-time video
- **Buyers** purchase with one tap during streams
- **Payments** settle instantly via smart contract escrow
- **Reviews** are cryptographically verified (only actual buyers can review)
- **Creators** keep 97% of sales, receive tips/gifts directly

#### Why Movement?

| Feature | Benefit for Ember |
|---------|-------------------|
| **Move Language** | Secure asset handling, no reentrancy bugs |
| **High TPS** | Handle live stream purchase spikes |
| **Low Fees** | Microtransactions viable (tips, gifts) |
| **Aptos Compatibility** | Rich tooling, wallet ecosystem |
| **Parallelization** | Multiple concurrent purchases |

---

## Key Features

### One-Tap Purchase
Buy products during live streams without leaving the video. Payment flows through on-chain escrow—funds locked until delivery confirmed.

### Verified Reviews
Only buyers with **delivered orders** can leave reviews. Every review is linked to an on-chain purchase record. No fake reviews possible.

### Instant Settlement
When buyers confirm delivery, sellers receive funds **immediately**—no 14-day holds, no payment processor delays.

### Virtual Gifts & Tips
Viewers support streamers with:
- **Gifts**: Heart (1 MOVE), Star (5), Fire (10), Diamond (50), Crown (100)
- **Tips**: Any custom amount

90-95% goes directly to creators.

### Trustless Escrow
- Buyer pays → Funds locked in smart contract
- Seller ships → Marks shipped on-chain
- Buyer confirms → Funds auto-release
- Dispute? → On-chain resolution

### Gasless Transactions
Powered by **Shinami Gas Station**—buyers and sellers never pay gas fees. Frictionless Web2-like UX.

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│  Landing │ Products │ Live Streams │ Seller Dashboard   │
│  Orders  │ Reviews  │ Profile      │ Checkout           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   API LAYER (Next.js)                   │
├─────────────────────────────────────────────────────────┤
│  Shinami Gas Sponsor │ IPFS Upload │ Stream Management  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  MOVEMENT BLOCKCHAIN                    │
├─────────────────────────────────────────────────────────┤
│  SellerRegistry │ ProductRegistry │ OrderEscrow        │
│  ReviewRegistry │ GiftShop        │ TipJar             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    STORAGE (IPFS)                       │
├─────────────────────────────────────────────────────────┤
│  Product Images │ Metadata │ Stream Thumbnails          │
└─────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | Movement (Aptos-compatible) |
| **Smart Contracts** | Move Language |
| **Frontend** | Next.js 14, React, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Wallet** | Privy (email onboarding) + Aptos Wallet Adapter |
| **Gas Sponsorship** | Shinami Gas Station |
| **Storage** | IPFS (Pinata) |
| **Streaming** | YouTube Live embed |

---

## Smart Contracts

### Contract Architecture

```
┌─────────────────┐     ┌─────────────────┐
│ SellerRegistry  │────▶│ ProductRegistry │
│                 │     │   (3% fee)      │
│ - register      │     │ - create        │
│ - verify        │     │ - update        │
│ - suspend       │     │ - deactivate    │
└─────────────────┘     └────────┬────────┘
                                 │
                                 ▼
┌─────────────────┐     ┌─────────────────┐
│  ReviewRegistry │◀────│   OrderEscrow   │
│                 │     │                 │
│ - submit (1-5)  │     │ - create_order  │
│ - verified only │     │ - mark_shipped  │
│ - updates avg   │     │ - confirm       │
└─────────────────┘     │ - dispute       │
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│    GiftShop     │     │     TipJar      │
│   (10% fee)     │     │    (5% fee)     │
│                 │     │                 │
│ - Heart    1M   │     │ - send_tip      │
│ - Star     5M   │     │ - any amount    │
│ - Fire    10M   │     │ - 95% to creator│
│ - Diamond 50M   │     │                 │
│ - Crown  100M   │     │                 │
└─────────────────┘     └─────────────────┘
```

### Security Features

- **No Reentrancy**: Move's resource model prevents reentrancy attacks
- **Access Control**: Admin-only verification, seller-only product management
- **Escrow Safety**: Funds locked until explicit release conditions met
- **Review Validation**: Cross-contract verification of purchase history

---

## Business Model

### Revenue Streams

| Source | Fee | Description |
|--------|-----|-------------|
| **Product Sales** | 3% | On every purchase through escrow |
| **Virtual Gifts** | 10% | On gift purchases during streams |
| **Tips** | 5% | On direct tips to streamers |
| **Premium Sellers** | TBD | Verified badge, priority listing |
| **Promoted Products** | TBD | Featured placement in streams |

### Unit Economics Example

```
Product Price: 100 MOVE
├── Seller Receives: 97 MOVE (97%)
├── Platform Fee: 3 MOVE (3%)
└── Gas: 0 MOVE (sponsored)

Gift (Diamond - 50 MOVE):
├── Streamer Receives: 45 MOVE (90%)
└── Platform Fee: 5 MOVE (10%)

Tip (20 MOVE):
├── Streamer Receives: 19 MOVE (95%)
└── Platform Fee: 1 MOVE (5%)
```

### Comparison vs Traditional Platforms

| Platform | Take Rate | Settlement |
|----------|-----------|------------|
| TikTok Shop | 5-8% + payment fees | 14-21 days |
| Amazon Live | 8-15% + referral | 14 days |
| Shopify | 2.9% + $0.30/tx | 2-3 days |
| **Ember** | **3% flat** | **Instant** |

---

## Market Opportunity

### Live Commerce Market Size

- **2024**: $512B (primarily China)
- **2026**: $800B projected
- **Western Growth**: 300% YoY

### Target Segments

1. **Indie Creators** - YouTubers, TikTokers seeking better monetization
2. **Small Merchants** - Artisans, vintage sellers, niche products
3. **Crypto-Native Sellers** - NFT creators, Web3 projects
4. **Cross-Border Commerce** - Instant settlement eliminates FX friction

### Why Now?

- Gen Z prefers video shopping (62% discover products on social video)
- Creator economy reaching $250B
- Web3 infrastructure finally mature enough for consumer apps
- Movement provides the speed/cost needed for real-time commerce

---

## Competitive Advantage

### vs Traditional Live Commerce (TikTok Shop, Amazon Live)

| Aspect | Traditional | Ember |
|--------|-------------|-------|
| Fees | 5-15% | 3% |
| Settlement | 14-30 days | Instant |
| Review Trust | Fake reviews rampant | Cryptographically verified |
| Ownership | Platform owns everything | Sellers own data |
| Global | Currency conversion fees | Native crypto |

### vs Other Web3 Commerce

| Aspect | Other Web3 | Ember |
|--------|------------|-------|
| UX | Wallet-first, complex | Email login, gasless |
| Focus | NFTs, collectibles | Real physical products |
| Live Commerce | None | Core feature |
| Mobile | Poor | Responsive-first |

### Moats

1. **Verified Reviews** - Unique on-chain purchase verification
2. **Gasless UX** - Shinami integration removes friction
3. **Live Commerce Focus** - Purpose-built, not retrofitted
4. **Movement Native** - First-mover on Movement for commerce

---

## Future Roadmap

### Phase 1: Foundation (Current)
- [x] Core smart contracts deployed
- [x] Product listing and purchase flow
- [x] Order escrow with dispute handling
- [x] Verified review system
- [x] Live streaming with embedded products
- [x] Gift and tip functionality
- [x] Gasless transactions via Shinami

### Phase 2: Growth (Q2 2025)
- [ ] Mobile app (React Native)
- [ ] Native streaming (WebRTC, no YouTube dependency)
- [ ] Multi-language support
- [ ] Seller analytics dashboard
- [ ] Affiliate/referral program on-chain

### Phase 3: Expansion (Q3 2025)
- [ ] Cross-chain payments (ETH, SOL via bridges)
- [ ] AI product recommendations
- [ ] AR try-on for fashion/beauty
- [ ] Bulk order discounts
- [ ] B2B wholesale module

### Phase 4: Ecosystem (Q4 2025)
- [ ] Ember Token (EMB) for governance
- [ ] Staking for premium features
- [ ] Creator DAOs
- [ ] White-label solution for brands
- [ ] Movement DeFi integrations (collateralized inventory)

---

## Demo & Links

### Repository
- **GitHub**: https://github.com/JoannaJenifa/Ember

### How to Test

```bash
# Clone repository
git clone https://github.com/JoannaJenifa/Ember.git
cd Ember

# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env.local
# Fill in SHINAMI_KEY, NEXT_PUBLIC_MODULE_ADDRESS

# Run locally
pnpm dev

# Visit http://localhost:3000
```

See `APP_FLOW.md` for detailed testing instructions.

---

## Why Ember Should Win

1. **Real Problem**: Live commerce is broken—we fix trust, fees, and settlement
2. **Movement Native**: Purpose-built for Movement's strengths
3. **Working Product**: Not a concept—full end-to-end flow works
4. **Innovative**: First verified review system tied to on-chain purchases
5. **Scalable Business**: Clear revenue model, massive market
6. **User-First**: Gasless, email login—Web2 UX with Web3 benefits

---

*Built with fire on Movement*
