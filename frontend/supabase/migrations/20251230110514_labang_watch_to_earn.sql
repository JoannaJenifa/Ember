-- Labang Watch-to-Earn Tables
-- Migration: labang_watch_to_earn
-- Description: Tables for watch sessions, rewards, and daily earning limits

-- ============================================================================
-- Table: labang_watch_sessions
-- Tracks watch time per user per stream
-- ============================================================================
CREATE TABLE labang_watch_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  stream_id UUID REFERENCES labang_streams(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  total_seconds INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  attention_check_pending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Table: labang_rewards
-- Log of all rewards earned by users
-- ============================================================================
CREATE TABLE labang_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN (
    'watch_5min', 'watch_30min', 'comment', 'review', 'first_purchase'
  )),
  amount_very DECIMAL NOT NULL,
  stream_id UUID REFERENCES labang_streams(id) ON DELETE SET NULL,
  order_id UUID REFERENCES labang_orders(id) ON DELETE SET NULL,
  review_id UUID REFERENCES labang_reviews(id) ON DELETE SET NULL,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Table: labang_daily_earnings
-- Tracks daily earning limits per user
-- ============================================================================
CREATE TABLE labang_daily_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  date DATE NOT NULL,
  watch_rewards DECIMAL DEFAULT 0,
  comment_rewards DECIMAL DEFAULT 0,
  total_rewards DECIMAL DEFAULT 0,
  UNIQUE(user_address, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX labang_idx_watch_sessions_user ON labang_watch_sessions(user_address);
CREATE INDEX labang_idx_watch_sessions_stream ON labang_watch_sessions(stream_id);
CREATE INDEX labang_idx_watch_sessions_active ON labang_watch_sessions(is_active);
CREATE INDEX labang_idx_rewards_user ON labang_rewards(user_address);
CREATE INDEX labang_idx_rewards_type ON labang_rewards(reward_type);
CREATE INDEX labang_idx_rewards_claimed ON labang_rewards(claimed);
CREATE INDEX labang_idx_daily_earnings_user ON labang_daily_earnings(user_address);
CREATE INDEX labang_idx_daily_earnings_date ON labang_daily_earnings(date);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE labang_watch_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE labang_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE labang_daily_earnings ENABLE ROW LEVEL SECURITY;

-- Watch sessions: users see only their own
CREATE POLICY "labang_watch_sessions_select_own" ON labang_watch_sessions FOR SELECT
  USING (user_address = current_setting('app.wallet_address', true));
CREATE POLICY "labang_watch_sessions_insert_own" ON labang_watch_sessions FOR INSERT
  WITH CHECK (user_address = current_setting('app.wallet_address', true));
CREATE POLICY "labang_watch_sessions_update_own" ON labang_watch_sessions FOR UPDATE
  USING (user_address = current_setting('app.wallet_address', true));

-- Rewards: users see only their own
CREATE POLICY "labang_rewards_select_own" ON labang_rewards FOR SELECT
  USING (user_address = current_setting('app.wallet_address', true));
CREATE POLICY "labang_rewards_insert_any" ON labang_rewards FOR INSERT
  WITH CHECK (true);
CREATE POLICY "labang_rewards_update_own" ON labang_rewards FOR UPDATE
  USING (user_address = current_setting('app.wallet_address', true));

-- Daily earnings: users see only their own
CREATE POLICY "labang_daily_earnings_select_own" ON labang_daily_earnings FOR SELECT
  USING (user_address = current_setting('app.wallet_address', true));
CREATE POLICY "labang_daily_earnings_insert_any" ON labang_daily_earnings FOR INSERT
  WITH CHECK (true);
CREATE POLICY "labang_daily_earnings_update_own" ON labang_daily_earnings FOR UPDATE
  USING (user_address = current_setting('app.wallet_address', true));
