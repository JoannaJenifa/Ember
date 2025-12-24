# Labang (라방) Implementation Strategy

## Parallel Execution Guide

Run prompts with: `/run-prompt wepin <number>`

---

## Phase Overview

| Phase | Prompts | Parallel Group | Est. Sessions |
|-------|---------|----------------|---------------|
| **1. Foundation** | 1, 2, 3, 4 | A | 4 parallel |
| **2. Core UI** | 5, 6, 7, 8, 13, 14 | B | 4-6 parallel |
| **3. Live Streaming** | 9, 10, 11 | C | 3 parallel |
| **4. Engagement** | 12, 15 | D | 2 parallel |
| **5. Polish** | 16 | E | 1 sequential |

---

## Prompt Summary

### Phase 1: Foundation (Can all run in parallel)

| # | Title | Creates | Dependencies |
|---|-------|---------|--------------|
| **1** | Smart Contracts - Core | OrderEscrow, ReviewRegistry | None |
| **2** | Smart Contracts - Engagement | TipJar, GiftShop | None |
| **3** | Subgraph | Schema, Mappings | None* |
| **4** | Database Schema | Supabase tables | None |

*Subgraph can use placeholder addresses initially

### Phase 2: Core UI (Can run in parallel)

| # | Title | Creates | Dependencies |
|---|-------|---------|--------------|
| **5** | Branding & Layout | Navbar, Footer, Pages stubs | None |
| **6** | Product Catalog | Product CRUD, Browse | 4 |
| **7** | Order & Purchase | Purchase flow, Orders | 1, 4 |
| **8** | Review System | Review submit/display | 1, 7 |
| **13** | Seller Onboarding | Registration, Dashboard | 4, 5 |
| **14** | Streams Discovery | Live page, Filters | 5, 9 |

### Phase 3: Live Streaming (Can run in parallel)

| # | Title | Creates | Dependencies |
|---|-------|---------|--------------|
| **9** | Streaming Infra | Mux integration | None |
| **10** | Viewer Experience | Stream page, Chat | 9, 6 |
| **11** | Seller Dashboard | Go live, Analytics | 9, 6 |

### Phase 4: Engagement (Can run in parallel)

| # | Title | Creates | Dependencies |
|---|-------|---------|--------------|
| **12** | Tips & Gifts | Gift/tip system | 2, 10 |
| **15** | Watch-to-Earn | Reward mechanics | 10, 4 |

### Phase 5: Polish (Sequential)

| # | Title | Creates | Dependencies |
|---|-------|---------|--------------|
| **16** | Final Integration | Testing, Demo | All |

---

## Recommended Parallel Sessions

### Session Batch 1 (Foundation)
```bash
# Terminal 1
/run-prompt wepin 1   # Smart Contracts - Core

# Terminal 2
/run-prompt wepin 2   # Smart Contracts - Engagement

# Terminal 3
/run-prompt wepin 3   # Subgraph

# Terminal 4
/run-prompt wepin 4   # Database
```

### Session Batch 2 (UI + Streaming)
After contracts deployed:
```bash
# Terminal 1
/run-prompt wepin 5   # Branding

# Terminal 2
/run-prompt wepin 6   # Products

# Terminal 3
/run-prompt wepin 9   # Streaming Infra

# Terminal 4
/run-prompt wepin 13  # Seller Onboarding
```

### Session Batch 3 (Features)
After batch 2:
```bash
# Terminal 1
/run-prompt wepin 7   # Orders

# Terminal 2
/run-prompt wepin 10  # Stream Viewer

# Terminal 3
/run-prompt wepin 11  # Seller Streaming

# Terminal 4
/run-prompt wepin 14  # Discovery
```

### Session Batch 4 (Engagement)
After batch 3:
```bash
# Terminal 1
/run-prompt wepin 8   # Reviews

# Terminal 2
/run-prompt wepin 12  # Tips & Gifts

# Terminal 3
/run-prompt wepin 15  # Watch-to-Earn
```

### Session Batch 5 (Final)
```bash
/run-prompt wepin 16  # Integration & Testing
```

---

## Dependency Graph

```
Phase 1 (Foundation)
├── [1] Contracts-Core ─────────┬──► [7] Orders ──► [8] Reviews
├── [2] Contracts-Engagement ───┼──► [12] Tips/Gifts
├── [3] Subgraph ───────────────┤
└── [4] Database ───────────────┼──► [6] Products ─┬──► [10] Viewer
                                │                  └──► [11] Seller
Phase 2 (UI)                    │
├── [5] Branding ───────────────┼──► [13] Seller Onboard
│                               │
Phase 3 (Streaming)             │
├── [9] Streaming Infra ────────┴──► [10] Viewer ──► [12] Gifts
│                                    [11] Seller     [15] Watch2Earn
│
Phase 4 (Engagement)
├── [12] Tips/Gifts
├── [15] Watch-to-Earn
│
Phase 5 (Polish)
└── [16] Integration ◄── ALL
```

---

## Quick Start

1. **Start with Foundation** (4 parallel sessions)
2. **Deploy contracts** before starting Phase 2
3. **Set up Mux** before streaming prompts
4. **Run final integration** after all features complete

---

## Notes

- Each prompt is self-contained with full context
- Follow 300 line limit per file
- Reference `../04-shinroe/` for patterns
- Use Context7 MCP for documentation (not WebFetch)
