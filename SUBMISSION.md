# Labang (라방) - Hackathon Submission

## 1. One-Liner Vision

**Live commerce platform where streamers sell products in real-time and viewers purchase with crypto, featuring KYC-verified reviews and instant settlements.**

---

## 2. GitHub URL

**https://github.com/JoelOffBeat/labang**

---

## 3. Key Innovation Domains

1. **Live Commerce / Social Commerce**
2. **DeFi Payments & Escrow**
3. **Decentralized Identity & Reputation**

---

## 4. Detailed Description

### Problem

Live commerce is a $10T+ market in Korea alone, yet suffers from critical trust issues:
- **Fake reviews** distort product perception (paid/bot reviews everywhere)
- **Payment delays** force sellers to wait days for settlement
- **High platform fees** of 10-30% eat into seller margins
- **Chargebacks** enable fraudulent buyers to reverse legitimate payments
- **No viewer rewards** — watching streams provides no tangible value

### Solution: Labang (라방)

Labang ("Live Room" in Korean) is a crypto-native live shopping platform built on VeryChain that solves these problems:

**Real-Time Shopping**
- Viewers buy products during live streams with one tap
- Product overlays appear seamlessly during broadcasts
- No need to leave the stream to complete purchases

**Instant Settlement**
- Sellers receive VERY tokens immediately via smart contract escrow
- No more waiting days for payment processing
- 3% platform fee vs 20%+ on traditional platforms

**Verified Reviews Only**
- Only KYC-verified users who actually purchased can leave reviews
- Eliminates fake review problem entirely
- Reviews stored on-chain for transparency and immutability

**Watch-to-Earn**
- Viewers earn VERY tokens for engagement (watching, quality comments, reviews)
- Anti-farming measures via attention verification and daily caps
- Creates sustainable viewer economy

### Technical Implementation

**Smart Contracts:**
- `OrderEscrow` - Holds payment until delivery confirmed
- `ReviewRegistry` - Verified reviews on-chain
- `TipJar` - Manages streamer tips/gifts
- `GiftShop` - Virtual gift purchases during streams

**Stack:**
- Frontend: Next.js + shadcn/ui
- Auth: WEPIN (VeryChain native wallet)
- Messaging: VeryChat API integration
- Indexing: TheGraph (self-hosted for VeryChain)
- Contracts: Foundry (Solidity)

### Key Features

| Feature | Description |
|---------|-------------|
| Live Streaming | RTMP-based broadcasting with product overlays |
| One-Tap Purchase | Buy without leaving the stream |
| Instant Payment | VERY transferred via escrow contract |
| Real-Time Chat | Viewer comments and interactions |
| Gifts & Tips | Send VERY to streamers |
| Verified Reviews | Purchase + KYC gated reviews |
| Watch-to-Earn | Earn VERY for engagement |
| Seller Dashboard | Analytics, order management, flash sales |

### Why VeryChain?

- Native VERY token integration for seamless payments
- Low transaction fees enable micro-transactions (tips, small purchases)
- VeryChat integration provides built-in KYC verification
- WEPIN wallet support for mainstream user experience

### Market Opportunity

- Korean live commerce market: ₩10T+ (2024)
- 60% of Korean shoppers have used live commerce
- Crypto payments emerging as alternative to high-fee card processing
- Influencer economy seeking new monetization channels

### Tagline

**"라이브로 쇼핑, 크립토로 결제"** (Shop Live, Pay Crypto)
