# Ember Implementation Prompts

8 focused prompts for implementing Ember - a live commerce platform on Movement blockchain.

## How to Use

```bash
/run-prompt 1   # Execute prompt 1
```

---

## Prompt Overview

| # | Title | Priority | Skill | Focus |
|---|-------|----------|-------|-------|
| 1 | Move Setup & Core Registries | CRITICAL | move-dev | Project init, types, SellerRegistry, ProductRegistry |
| 2 | Order & Review System | CRITICAL | move-dev | OrderEscrow, ReviewRegistry |
| 3 | Streamer Monetization | HIGH | move-dev | TipJar, GiftShop |
| 4 | Frontend Foundation | CRITICAL | ui-dev | Privy setup, wallet context, UI components |
| 5 | Data Layer | CRITICAL | ui-dev | Transactions, queries, React hooks |
| 6 | Product & Discovery | HIGH | ui-dev | Products, home page, seller pages |
| 7 | Live Streaming | HIGH | ui-dev | YouTube embed, tips/gifts UI, activity feed |
| 8 | User Dashboards | HIGH | ui-dev | Seller dashboard, buyer orders, profile |

---

## Execution Order

### Phase 1: Foundation (Parallel)

```
┌─────────────────────────┐    ┌─────────────────────────┐
│    MOVE CONTRACTS       │    │    FRONTEND SETUP       │
│                         │    │                         │
│  [1] Setup + Registries │    │  [4] Privy + Wallet     │
│           ↓             │    │                         │
│  [2] Order + Review     │    │                         │
│  [3] Tips + Gifts       │    │                         │
└─────────────────────────┘    └─────────────────────────┘
```

**Prompts 1-3** and **Prompt 4** can run in parallel.

### Phase 2: Integration

```
[4] Frontend Foundation ──┐
                          ├──→ [5] Data Layer
[1-3] Contracts Deployed ─┘
```

### Phase 3: UI Pages (Parallel)

```
[6] Product & Discovery ───┐
[7] Live Streaming ────────┼──→ Complete App
[8] User Dashboards ───────┘
```

**Prompts 6, 7, 8** can run in parallel after Prompt 5.

---

## Dependencies Graph

```
[1] ──→ [2] ──→ [5] ──→ [6]
    ↘         ↗       ↗
     [3] ────/       /
                    /
[4] ────────→ [5] →───→ [7]
                   ↘
                    [8]
```

---

## Key Decisions

| Decision | Choice |
|----------|--------|
| Indexing | No indexers - view functions only |
| Streaming | YouTube embed (user provides URL) |
| Payments | Native MOVE token |
| Wallet | Privy embedded + native wallet |
| Orders | Escrow-based with delivery confirmation |
| Reviews | Verified purchase only (on-chain proof) |
| Fees | Orders: 3%, Tips: 5%, Gifts: 10% |

---

## Verification

```bash
# Move contracts
cd contracts && aptos move compile && aptos move test

# Frontend
cd frontend && npm run build
```

---

## File Limits

**HARD LIMIT: 300 lines per file maximum.**

---

## Progress Tracking

| Prompt | Status |
|--------|--------|
| 1. Move Setup & Core Registries | ⏳ Pending |
| 2. Order & Review System | ⏳ Pending |
| 3. Streamer Monetization | ⏳ Pending |
| 4. Frontend Foundation | ⏳ Pending |
| 5. Data Layer | ⏳ Pending |
| 6. Product & Discovery | ⏳ Pending |
| 7. Live Streaming | ⏳ Pending |
| 8. User Dashboards | ⏳ Pending |
