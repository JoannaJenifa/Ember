-- Labang Database Schema
-- Migration: labang_create_tables
-- Description: Create all core tables for Labang live commerce platform

-- ============================================================================
-- Table: labang_sellers
-- ============================================================================
CREATE TABLE labang_sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  shop_name TEXT NOT NULL,
  shop_name_ko TEXT,
  description TEXT,
  category TEXT NOT NULL,
  profile_image TEXT,
  banner_image TEXT,
  kyc_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Table: labang_products
-- ============================================================================
CREATE TABLE labang_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES labang_sellers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ko TEXT,
  description TEXT,
  description_ko TEXT,
  images TEXT[],
  price_very DECIMAL NOT NULL,
  inventory INTEGER DEFAULT 0,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Table: labang_streams
-- ============================================================================
CREATE TABLE labang_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES labang_sellers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ko TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  stream_key TEXT UNIQUE,
  playback_url TEXT,
  thumbnail TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Table: labang_stream_products
-- ============================================================================
CREATE TABLE labang_stream_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES labang_streams(id) ON DELETE CASCADE,
  product_id UUID REFERENCES labang_products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  special_price_very DECIMAL,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stream_id, product_id)
);

-- ============================================================================
-- Table: labang_orders
-- ============================================================================
CREATE TABLE labang_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onchain_order_id TEXT UNIQUE,
  buyer_address TEXT NOT NULL,
  seller_id UUID REFERENCES labang_sellers(id) ON DELETE SET NULL,
  product_id UUID REFERENCES labang_products(id) ON DELETE SET NULL,
  stream_id UUID REFERENCES labang_streams(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  total_price_very DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_name TEXT,
  shipping_address TEXT,
  shipping_phone TEXT,
  tracking_number TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Table: labang_reviews
-- ============================================================================
CREATE TABLE labang_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  onchain_review_id TEXT UNIQUE,
  order_id UUID REFERENCES labang_orders(id) ON DELETE SET NULL,
  product_id UUID REFERENCES labang_products(id) ON DELETE CASCADE,
  buyer_address TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  photos TEXT[],
  is_verified BOOLEAN DEFAULT FALSE,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX labang_idx_sellers_wallet ON labang_sellers(wallet_address);
CREATE INDEX labang_idx_sellers_category ON labang_sellers(category);
CREATE INDEX labang_idx_sellers_approved ON labang_sellers(is_approved);
CREATE INDEX labang_idx_products_seller ON labang_products(seller_id);
CREATE INDEX labang_idx_products_category ON labang_products(category);
CREATE INDEX labang_idx_products_active ON labang_products(is_active);
CREATE INDEX labang_idx_streams_seller ON labang_streams(seller_id);
CREATE INDEX labang_idx_streams_status ON labang_streams(status);
CREATE INDEX labang_idx_streams_scheduled ON labang_streams(scheduled_at);
CREATE INDEX labang_idx_stream_products_stream ON labang_stream_products(stream_id);
CREATE INDEX labang_idx_stream_products_product ON labang_stream_products(product_id);
CREATE INDEX labang_idx_orders_buyer ON labang_orders(buyer_address);
CREATE INDEX labang_idx_orders_seller ON labang_orders(seller_id);
CREATE INDEX labang_idx_orders_status ON labang_orders(status);
CREATE INDEX labang_idx_orders_stream ON labang_orders(stream_id);
CREATE INDEX labang_idx_reviews_product ON labang_reviews(product_id);
CREATE INDEX labang_idx_reviews_buyer ON labang_reviews(buyer_address);
CREATE INDEX labang_idx_reviews_order ON labang_reviews(order_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE labang_sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE labang_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE labang_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE labang_stream_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE labang_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE labang_reviews ENABLE ROW LEVEL SECURITY;

-- Sellers policies (public read, owner write)
CREATE POLICY "labang_sellers_select_all" ON labang_sellers FOR SELECT USING (true);
CREATE POLICY "labang_sellers_insert_any" ON labang_sellers FOR INSERT WITH CHECK (true);
CREATE POLICY "labang_sellers_update_own" ON labang_sellers FOR UPDATE
  USING (wallet_address = current_setting('app.wallet_address', true));

-- Products policies
CREATE POLICY "labang_products_select_active" ON labang_products FOR SELECT
  USING (is_active = true OR seller_id IN (
    SELECT id FROM labang_sellers WHERE wallet_address = current_setting('app.wallet_address', true)
  ));
CREATE POLICY "labang_products_insert_seller" ON labang_products FOR INSERT
  WITH CHECK (seller_id IN (
    SELECT id FROM labang_sellers WHERE wallet_address = current_setting('app.wallet_address', true)
  ));
CREATE POLICY "labang_products_update_seller" ON labang_products FOR UPDATE
  USING (seller_id IN (
    SELECT id FROM labang_sellers WHERE wallet_address = current_setting('app.wallet_address', true)
  ));
CREATE POLICY "labang_products_delete_seller" ON labang_products FOR DELETE
  USING (seller_id IN (
    SELECT id FROM labang_sellers WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

-- Streams policies
CREATE POLICY "labang_streams_select_all" ON labang_streams FOR SELECT USING (true);
CREATE POLICY "labang_streams_insert_seller" ON labang_streams FOR INSERT
  WITH CHECK (seller_id IN (
    SELECT id FROM labang_sellers WHERE wallet_address = current_setting('app.wallet_address', true)
  ));
CREATE POLICY "labang_streams_update_seller" ON labang_streams FOR UPDATE
  USING (seller_id IN (
    SELECT id FROM labang_sellers WHERE wallet_address = current_setting('app.wallet_address', true)
  ));

-- Stream products policies
CREATE POLICY "labang_stream_products_select_all" ON labang_stream_products FOR SELECT USING (true);
CREATE POLICY "labang_stream_products_manage_seller" ON labang_stream_products FOR ALL
  USING (stream_id IN (
    SELECT s.id FROM labang_streams s
    JOIN labang_sellers sel ON s.seller_id = sel.id
    WHERE sel.wallet_address = current_setting('app.wallet_address', true)
  ));

-- Orders policies
CREATE POLICY "labang_orders_select_own" ON labang_orders FOR SELECT
  USING (
    buyer_address = current_setting('app.wallet_address', true) OR
    seller_id IN (SELECT id FROM labang_sellers WHERE wallet_address = current_setting('app.wallet_address', true))
  );
CREATE POLICY "labang_orders_insert_buyer" ON labang_orders FOR INSERT
  WITH CHECK (buyer_address = current_setting('app.wallet_address', true));
CREATE POLICY "labang_orders_update_participant" ON labang_orders FOR UPDATE
  USING (
    buyer_address = current_setting('app.wallet_address', true) OR
    seller_id IN (SELECT id FROM labang_sellers WHERE wallet_address = current_setting('app.wallet_address', true))
  );

-- Reviews policies
CREATE POLICY "labang_reviews_select_all" ON labang_reviews FOR SELECT USING (true);
CREATE POLICY "labang_reviews_insert_buyer" ON labang_reviews FOR INSERT
  WITH CHECK (buyer_address = current_setting('app.wallet_address', true));
CREATE POLICY "labang_reviews_update_own" ON labang_reviews FOR UPDATE
  USING (buyer_address = current_setting('app.wallet_address', true));

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION labang_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER labang_sellers_updated_at
  BEFORE UPDATE ON labang_sellers
  FOR EACH ROW EXECUTE FUNCTION labang_update_updated_at();

CREATE TRIGGER labang_products_updated_at
  BEFORE UPDATE ON labang_products
  FOR EACH ROW EXECUTE FUNCTION labang_update_updated_at();

CREATE TRIGGER labang_orders_updated_at
  BEFORE UPDATE ON labang_orders
  FOR EACH ROW EXECUTE FUNCTION labang_update_updated_at();
