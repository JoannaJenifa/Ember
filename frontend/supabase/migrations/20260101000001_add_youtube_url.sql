-- Add YouTube URL support for streams
-- This allows sellers to use YouTube Live instead of Mux

ALTER TABLE labang_streams ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS labang_idx_streams_youtube ON labang_streams(youtube_url) WHERE youtube_url IS NOT NULL;
