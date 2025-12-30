-- Migration: fix_stream_products_product_id
-- Description: Change product_id from UUID to TEXT to support on-chain product IDs from subgraph

-- Drop the foreign key constraint
ALTER TABLE labang_stream_products
  DROP CONSTRAINT IF EXISTS labang_stream_products_product_id_fkey;

-- Drop the unique constraint that includes product_id
ALTER TABLE labang_stream_products
  DROP CONSTRAINT IF EXISTS labang_stream_products_stream_id_product_id_key;

-- Change the column type from UUID to TEXT
ALTER TABLE labang_stream_products
  ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;

-- Recreate the unique constraint
ALTER TABLE labang_stream_products
  ADD CONSTRAINT labang_stream_products_stream_id_product_id_key
  UNIQUE (stream_id, product_id);
