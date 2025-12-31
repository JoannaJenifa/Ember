-- Add message_type and metadata columns for transaction events in chat
-- Types: message, tip, gift, purchase

ALTER TABLE ember_chat_messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'message' CHECK (message_type IN ('message', 'tip', 'gift', 'purchase'));
ALTER TABLE ember_chat_messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;

-- Index for filtering by message type
CREATE INDEX IF NOT EXISTS idx_ember_chat_type ON ember_chat_messages(message_type);
