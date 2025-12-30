-- Disable RLS on all Labang tables (using service role key)

-- Drop all policies first
DROP POLICY IF EXISTS "labang_sellers_select_all" ON labang_sellers;
DROP POLICY IF EXISTS "labang_sellers_insert_any" ON labang_sellers;
DROP POLICY IF EXISTS "labang_sellers_update_own" ON labang_sellers;

DROP POLICY IF EXISTS "labang_products_select_active" ON labang_products;
DROP POLICY IF EXISTS "labang_products_insert_seller" ON labang_products;
DROP POLICY IF EXISTS "labang_products_update_seller" ON labang_products;
DROP POLICY IF EXISTS "labang_products_delete_seller" ON labang_products;

DROP POLICY IF EXISTS "labang_streams_select_all" ON labang_streams;
DROP POLICY IF EXISTS "labang_streams_insert_seller" ON labang_streams;
DROP POLICY IF EXISTS "labang_streams_update_seller" ON labang_streams;

DROP POLICY IF EXISTS "labang_stream_products_select_all" ON labang_stream_products;
DROP POLICY IF EXISTS "labang_stream_products_manage_seller" ON labang_stream_products;

DROP POLICY IF EXISTS "labang_orders_select_own" ON labang_orders;
DROP POLICY IF EXISTS "labang_orders_insert_buyer" ON labang_orders;
DROP POLICY IF EXISTS "labang_orders_update_participant" ON labang_orders;

DROP POLICY IF EXISTS "labang_reviews_select_all" ON labang_reviews;
DROP POLICY IF EXISTS "labang_reviews_insert_buyer" ON labang_reviews;
DROP POLICY IF EXISTS "labang_reviews_update_own" ON labang_reviews;

-- Disable RLS on all tables
ALTER TABLE labang_sellers DISABLE ROW LEVEL SECURITY;
ALTER TABLE labang_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE labang_streams DISABLE ROW LEVEL SECURITY;
ALTER TABLE labang_stream_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE labang_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE labang_reviews DISABLE ROW LEVEL SECURITY;
