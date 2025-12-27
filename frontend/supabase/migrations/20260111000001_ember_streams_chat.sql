-- Ember Streams and Chat Tables
-- Only streams and chat are off-chain, everything else is on-chain

-- ============================================================================
-- Table: ember_streams
-- ============================================================================
CREATE TABLE ember_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_address TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  featured_product_ids INTEGER[] DEFAULT '{}',
  is_live BOOLEAN DEFAULT TRUE,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ember_streams_seller ON ember_streams(seller_address);
CREATE INDEX idx_ember_streams_live ON ember_streams(is_live) WHERE is_live = true;
CREATE INDEX idx_ember_streams_started ON ember_streams(started_at DESC);

-- ============================================================================
-- Table: ember_chat_messages
-- ============================================================================
CREATE TABLE ember_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES ember_streams(id) ON DELETE CASCADE,
  sender_address TEXT NOT NULL,
  sender_name TEXT,
  message TEXT NOT NULL,
  is_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ember_chat_stream ON ember_chat_messages(stream_id, created_at ASC);
CREATE INDEX idx_ember_chat_sender ON ember_chat_messages(sender_address);

-- ============================================================================
-- Disable RLS for hackathon simplicity
-- ============================================================================
ALTER TABLE ember_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE ember_chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (hackathon mode)
CREATE POLICY "ember_streams_allow_all" ON ember_streams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ember_chat_allow_all" ON ember_chat_messages FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- Enable realtime for chat
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE ember_chat_messages;
