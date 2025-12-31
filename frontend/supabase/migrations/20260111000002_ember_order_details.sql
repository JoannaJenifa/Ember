-- Store sensitive order data (shipping info) off-chain
-- Public order data (product, quantity, status) is stored on-chain
CREATE TABLE ember_order_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash TEXT NOT NULL UNIQUE,
  buyer_address TEXT NOT NULL,
  seller_address TEXT NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price BIGINT NOT NULL,

  -- Shipping info (sensitive, stored off-chain only)
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT,
  shipping_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for looking up orders by buyer or seller
CREATE INDEX idx_ember_order_details_buyer ON ember_order_details(buyer_address);
CREATE INDEX idx_ember_order_details_seller ON ember_order_details(seller_address);
CREATE INDEX idx_ember_order_details_tx ON ember_order_details(tx_hash);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_ember_order_details_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ember_order_details_updated_at
  BEFORE UPDATE ON ember_order_details
  FOR EACH ROW
  EXECUTE FUNCTION update_ember_order_details_updated_at();
