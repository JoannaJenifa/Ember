# Ember - Movement Live Commerce dApp

## Overview

Ember is a **live commerce platform** built on Movement blockchain where streamers sell products in real-time and viewers purchase with crypto. KYC-verified reviews ensure authentic feedback, and instant crypto payments remove traditional payment friction.

**Migrated from:** Labang (VeryChain EVM project)
**Target:** Movement blockchain

---

## Git Configuration

**Account:** JoannaJenifa (Jenifa)
```
user.name: JoannaJenifa
user.email: testerbuster564@gmail.com
```

### Auto-Commit Rule
**After completing ANY command/prompt, commit and push your changes to GitHub.**

---

## Stack Overview

| Layer | Technology | Notes |
|-------|------------|-------|
| **Contracts** | Move | Movement-native smart contracts |
| **Frontend** | Next.js + shadcn/ui | Existing React frontend |
| **Indexing** | TBD | Movement indexer integration |
| **Wallet** | Movement-compatible | TBD - needs research |

---

## Migration Notes

### DB Operations → On-Chain Operations

The original project used SQLite for data storage. For Movement, we're migrating to fully on-chain:

| Original DB | Movement On-Chain |
|-------------|-------------------|
| `users` table | On-chain identity via wallet |
| `transactions` table | Native transaction history |
| `tokens` table | Query token balances from chain |
| `nfts` table | Query NFT ownership from chain |
| Products | Move module: ProductRegistry |
| Orders | Move module: OrderEscrow |
| Reviews | Move module: ReviewRegistry |
| Seller profiles | Move module: SellerRegistry |

### Existing Smart Contracts (Solidity → Move)

These need to be rewritten in Move:

1. **OrderEscrow.sol** → `order_escrow.move`
2. **ReviewRegistry.sol** → `review_registry.move`
3. **ProductRegistry.sol** → `product_registry.move`
4. **SellerRegistry.sol** → `seller_registry.move`
5. **TipJar.sol** → `tip_jar.move`
6. **GiftShop.sol** → `gift_shop.move`

---

## Critical Rules

**NEVER mock or create placeholder code.** If blocked, STOP and explain why.

- No scope creep - only implement what's requested
- No assumptions - ask for clarification
- Verify work before completing
- Use conventional commits (`feat:`, `fix:`, `refactor:`)

---

## File Size Limits

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

---

## Key Features

1. **Live Streaming** - Real-time product showcases
2. **One-Tap Purchase** - Buy during live streams
3. **Instant Settlement** - Sellers receive crypto immediately
4. **Verified Reviews** - Only purchasers can review (on-chain verified)
5. **Watch-to-Earn** - Viewers earn for engagement
6. **Low Fees** - 3% platform fee

---

## Next Steps

1. [ ] Set up Movement development environment
2. [ ] Research Movement wallet integration
3. [ ] Rewrite smart contracts in Move language
4. [ ] Update frontend to use Movement SDK
5. [ ] Replace all DB operations with on-chain queries
6. [ ] Set up Movement indexer for efficient querying
