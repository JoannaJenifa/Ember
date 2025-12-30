-- Chat messages for live streams
CREATE TABLE labang_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES labang_streams(id) ON DELETE CASCADE,
  user_address TEXT NOT NULL,
  username TEXT,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'message' CHECK (type IN ('message', 'gift', 'system')),
  gift_amount NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching messages by stream, ordered by time
CREATE INDEX idx_labang_chat_stream ON labang_chat_messages(stream_id, created_at DESC);

-- Index for user message history
CREATE INDEX idx_labang_chat_user ON labang_chat_messages(user_address, created_at DESC);

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE labang_chat_messages;
