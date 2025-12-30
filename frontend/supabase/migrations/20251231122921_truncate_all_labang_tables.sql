-- Force truncate all labang tables (CASCADE handles foreign keys)
TRUNCATE TABLE
  labang_chat_messages,
  labang_watch_sessions,
  labang_reviews,
  labang_rewards,
  labang_daily_earnings,
  labang_orders,
  labang_stream_products,
  labang_streams,
  labang_products,
  labang_sellers
CASCADE;
