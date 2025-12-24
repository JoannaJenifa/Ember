---
name: db-operations
description: Add/remove/edit data or run migrations or make changes in our supabase tables
---

**NEVER: Use Playwright, create manual SQL scripts, or use local DB**

## Project ID: qrsdodlbzjghfxoppcsp

## IMPORTANT: All tables/views/functions MUST be prefixed with `labang_`

## Active tables (off-chain data):
- `labang_chat_messages` - Stream chat messages
- `labang_streams` - Stream metadata
- `labang_stream_products` - Products linked to streams
- `labang_watch_sessions` - Watch time tracking
- `labang_reviews` - User reviews

## Deprecated tables (now on-chain via subgraph):
- `labang_orders`, `labang_products`, `labang_sellers`, `labang_rewards`, `labang_daily_earnings`

## Auth: Using SERVICE ROLE KEY (no RLS)
- RLS is DISABLED on all labang_ tables
- No Supabase auth - wallet-based auth handled by WEPIN

## Data operations (use migrations):
```bash
cd frontend

# Create migration for data changes
npx supabase migration new description

# Write SQL in the migration file, then push
npx supabase db push --linked
```

## Schema operations:
```bash
# Create migration
npx supabase migration new description

# Push to remote
npx supabase db push

# Regenerate types (always after schema change)
npx supabase gen types typescript --project-id qrsdodlbzjghfxoppcsp > types/supabase.ts

# Check current schema
npx supabase db dump --remote --schema-only
```

## Check types:
See `types/supabase.ts` for current schema TypeScript types

Always execute commands directly. Never generate scripts for manual execution.
