-- Reset all labang tables after contract reset
-- Order matters due to foreign key constraints

DELETE FROM labang_chat_messages;
DELETE FROM labang_watch_sessions;
DELETE FROM labang_reviews;
DELETE FROM labang_stream_products;
DELETE FROM labang_streams;
