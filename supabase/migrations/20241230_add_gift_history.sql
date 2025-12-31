-- Gift/Tip history table for analytics and tracking
-- Complements on-chain data with additional metadata

CREATE TABLE IF NOT EXISTS labang_gift_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID REFERENCES labang_streams(id) ON DELETE SET NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  gift_id TEXT,
  gift_name TEXT,
  quantity INTEGER DEFAULT 1,
  value_very DECIMAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('gift', 'tip')),
  message TEXT,
  tx_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_gift_history_stream ON labang_gift_history(stream_id);
CREATE INDEX IF NOT EXISTS idx_gift_history_from ON labang_gift_history(from_address);
CREATE INDEX IF NOT EXISTS idx_gift_history_to ON labang_gift_history(to_address);
CREATE INDEX IF NOT EXISTS idx_gift_history_type ON labang_gift_history(type);
CREATE INDEX IF NOT EXISTS idx_gift_history_created ON labang_gift_history(created_at DESC);

-- Enable RLS
ALTER TABLE labang_gift_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Gift history is viewable by all" ON labang_gift_history
  FOR SELECT USING (true);

CREATE POLICY "Gift history can be inserted by authenticated users" ON labang_gift_history
  FOR INSERT WITH CHECK (true);
