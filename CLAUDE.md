# Labang (라방) - VeryChain dApp

**⭐ Reference Implementation: `../04-shinroe/`**

Always look at Shinroe for patterns, code structure, and implementation details. Copy and adapt from Shinroe, not from template/.

---

## Stack Overview

| Layer | Technology | Notes |
|-------|------------|-------|
| **Auth** | WEPIN | Only auth layer supporting VeryChain mainnet |
| **Chat** | VeryChat API | Messaging integration |
| **Indexing** | TheGraph (self-hosted) | No external indexers support VeryChain |
| **Contracts** | Foundry | EVM compatible |
| **Frontend** | Next.js + shadcn/ui | Standard template |

---

## Critical Rules

**NEVER mock or create placeholder code.** If blocked, STOP and explain why.

- No scope creep - only implement what's requested
- No assumptions - ask for clarification
- Follow existing patterns in Shinroe (`../04-shinroe/`)
- Verify work before completing
- Use conventional commits (`feat:`, `fix:`, `refactor:`)

---

## Before Starting Any Work

1. **Read the PRD:** `../../prds/08-labang-prd.md`
2. **Reference Shinroe:** Look at `../04-shinroe/` for all patterns
3. **Load required skills** before starting tasks

---

## File Size Limits (CRITICAL)

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

---

## Documentation Lookup (MANDATORY)

**ALWAYS use Context7 MCP for documentation. NEVER use WebFetch for docs.**

---

## DO NOT

- **Create files over 300 lines**
- **Use WebFetch for documentation** - Use Context7
- **Skip loading skills**
- Mock WEPIN/VeryChat implementations
- Use `template/` as reference - use `04-shinroe/` instead

## DO

- **Reference `../04-shinroe/`** for all patterns and code
- **Use `/strategy`** to plan multi-step integrations
- **Use Context7 MCP** for all documentation
- Keep files under 300 lines

---

## Issues & Learnings (READ BEFORE STARTING)

### Before Starting These Tasks, Read Relevant Issues:

| Task Type | Read First |
|-----------|------------|
| Contract deployment | `docs/issues/contracts/README.md` → CONTRACT-001 (get PRIVATE_KEY first!) |
| Contract testing | `docs/issues/contracts/README.md` → CONTRACT-001 |
| Subgraph deployment | `docs/issues/subgraph/README.md` → SUBGRAPH-001 (local graph-node only!) |
| Subgraph integration | `docs/issues/subgraph/README.md` → SUBGRAPH-001 |
| i18n / multilingual | `docs/issues/ui/README.md` |
| VeryChain specifics | `docs/issues/verychain/README.md` |

### Key Learnings Summary

1. **Contract Deployment**: Copy `.env` from `../04-shinroe/contracts/.env` for `PRIVATE_KEY`. Deploy to **Polygon Amoy** testnet.

2. **Subgraph Deployment**: ALWAYS deploy to local graph-node at `/Users/gabrielantonyxaviour/Documents/starters/very/graph-node/`, NEVER to Graph Studio.
   ```bash
   graph create --node http://localhost:8020/ <project-name>
   graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 <project-name>
   ```
