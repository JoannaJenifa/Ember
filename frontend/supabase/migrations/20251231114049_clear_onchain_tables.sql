-- Clear tables that will be handled on-chain via smart contracts and subgraph indexing
-- These tables are no longer needed in Supabase

-- Must delete in order due to foreign key constraints
DELETE FROM labang_rewards;
DELETE FROM labang_daily_earnings;
DELETE FROM labang_orders;
DELETE FROM labang_products;
DELETE FROM labang_sellers;
