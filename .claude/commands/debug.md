---
description: Strategic debugging across frontend and Move modules
argument: <error description or unexpected behavior>
---

# Full-Stack Debug

Strategic debugging system that identifies issues across the entire stack: **frontend <-> Movement Node <-> Move modules**.

**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Identify which layer(s) the error originates from
- Load relevant skill (`ui-dev`, `move-dev`)

### Context7 Lookups (for debugging patterns)

If unsure about debugging techniques:
- Aptos SDK: `mcp__context7__resolve-library-id({ libraryName: "aptos-ts-sdk" })`
- Next.js: `mcp__context7__resolve-library-id({ libraryName: "next.js" })`

## Debug Strategy

### Phase 1: Classify the Issue

| Symptom | Primary Layer | Check Also |
|---------|---------------|------------|
| Transaction fails | Move module | Frontend (wrong params) |
| UI shows wrong data | Frontend | Move view functions |
| Wallet connection fails | Frontend | Wallet provider config |
| Escrow not releasing | Move module | Order status logic |
| Product not showing | Frontend | ProductRegistry query |

### Phase 2: Layer-Specific Debugging

#### Frontend Issues

1. **API Call Failures:**
   - Check browser console for errors
   - Verify RPC endpoint URL
   - Check request payload format

2. **State Display Issues:**
   - Add console.log to hooks
   - Check React Query cache
   - Verify response parsing

#### Move Module Issues

1. **Transaction Failures:**
   ```bash
   # Test Move function directly
   aptos move run \
     --function-id 'MODULE_ADDR::module::function' \
     --args TYPE:VALUE \
     --profile movement-testnet
   ```

2. **Test Failures:**
   ```bash
   cd contracts
   aptos move test
   ```

### Phase 3: Common Ember Integration Bugs

| Bug Pattern | Cause | Fix |
|-------------|-------|-----|
| Purchase fails | Insufficient balance | Check user balance first |
| Review not saving | Missing order verification | Verify order completed |
| Products not showing | Wrong seller address | Check registry query |
| Escrow stuck | Missing confirmation | Check order status enum |

### Debug Checklist

```
□ Reproduced the issue
□ Identified which layer (frontend/Move)
□ Checked network connectivity
□ Checked request/response format
□ Read error messages carefully
□ Tested component in isolation
□ Fixed and verified resolution
```

## Example Usage

```
/debug Purchase transaction reverts with E_INSUFFICIENT_BALANCE
```

```
/debug Products not showing on live stream page
```

```
/debug Escrow release failing after buyer confirmation
```
