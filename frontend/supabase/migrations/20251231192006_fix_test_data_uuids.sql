-- Fix test data with proper UUIDs
-- Delete old fake UUID data and insert with real UUIDs

-- Delete old test data (cascade will handle related records)
DELETE FROM labang_sellers WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444',
  '55555555-5555-5555-5555-555555555555'
);

-- Insert sellers with proper UUIDs using gen_random_uuid()
DO $$
DECLARE
  seller1_id UUID := gen_random_uuid();
  seller2_id UUID := gen_random_uuid();
  seller3_id UUID := gen_random_uuid();
  seller4_id UUID := gen_random_uuid();
  seller5_id UUID := gen_random_uuid();
  prod1a UUID := gen_random_uuid();
  prod1b UUID := gen_random_uuid();
  prod1c UUID := gen_random_uuid();
  prod2a UUID := gen_random_uuid();
  prod2b UUID := gen_random_uuid();
  prod2c UUID := gen_random_uuid();
  prod3a UUID := gen_random_uuid();
  prod3b UUID := gen_random_uuid();
  prod4a UUID := gen_random_uuid();
  prod4b UUID := gen_random_uuid();
  prod4c UUID := gen_random_uuid();
  prod5a UUID := gen_random_uuid();
  prod5b UUID := gen_random_uuid();
  stream1_id UUID := gen_random_uuid();
  stream2_id UUID := gen_random_uuid();
  stream3_id UUID := gen_random_uuid();
  stream4_id UUID := gen_random_uuid();
  stream5_id UUID := gen_random_uuid();
BEGIN
  -- SELLERS
  INSERT INTO labang_sellers (id, wallet_address, shop_name, shop_name_ko, description, category, profile_image, banner_image, kyc_verified, is_approved, created_at)
  VALUES
    (seller1_id, '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12', 'Glow Beauty Korea', 'Glow Beauty Korea', 'Premium Korean skincare and makeup products', 'beauty', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200', true, true, NOW() - INTERVAL '30 days'),
    (seller2_id, '0x2b3c4d5e6f7890abcdef1234567890abcdef1234', 'Seoul Street Style', 'Seoul Street Style', 'Trendy K-fashion for the modern generation', 'fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200', true, true, NOW() - INTERVAL '45 days'),
    (seller3_id, '0x3c4d5e6f7890abcdef1234567890abcdef123456', 'Kimchi Kitchen', 'Kimchi Kitchen', 'Authentic Korean food and snacks delivered fresh', 'food', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200', true, true, NOW() - INTERVAL '20 days'),
    (seller4_id, '0x4d5e6f7890abcdef1234567890abcdef12345678', 'Tech Galaxy Korea', 'Tech Galaxy Korea', 'Latest gadgets and electronics from Korea', 'electronics', 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200', true, true, NOW() - INTERVAL '60 days'),
    (seller5_id, '0x5e6f7890abcdef1234567890abcdef1234567890', 'Hanok Living', 'Hanok Living', 'Traditional Korean home decor with modern touch', 'home', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200', true, true, NOW() - INTERVAL '15 days');

  -- PRODUCTS
  INSERT INTO labang_products (id, seller_id, title, title_ko, description, description_ko, price_very, inventory, category, images, is_active, created_at)
  VALUES
    (prod1a, seller1_id, 'Glow Serum Set', 'Glow Serum Set', 'Vitamin C brightening serum with hyaluronic acid', 'Vitamin C serum', 45.00, 100, 'beauty', ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'], true, NOW() - INTERVAL '25 days'),
    (prod1b, seller1_id, 'K-Beauty Sheet Mask Pack', 'Sheet Mask Pack', '10-piece hydrating sheet mask collection', 'Sheet masks', 25.00, 200, 'beauty', ARRAY['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400'], true, NOW() - INTERVAL '20 days'),
    (prod1c, seller1_id, 'Cushion Foundation SPF50', 'Cushion Foundation', 'Natural coverage with sun protection', 'Foundation', 38.00, 75, 'beauty', ARRAY['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'], true, NOW() - INTERVAL '15 days'),
    (prod2a, seller2_id, 'Oversized Blazer', 'Oversized Blazer', 'Korean street style oversized blazer', 'Blazer', 89.00, 50, 'fashion', ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'], true, NOW() - INTERVAL '30 days'),
    (prod2b, seller2_id, 'Wide Leg Pants', 'Wide Leg Pants', 'Comfortable high-waist wide leg pants', 'Pants', 55.00, 80, 'fashion', ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'], true, NOW() - INTERVAL '25 days'),
    (prod2c, seller2_id, 'Bucket Hat', 'Bucket Hat', 'Trendy bucket hat in multiple colors', 'Hat', 28.00, 150, 'fashion', ARRAY['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400'], true, NOW() - INTERVAL '20 days'),
    (prod3a, seller3_id, 'Premium Kimchi Set', 'Kimchi Set', 'Handmade traditional kimchi variety pack', 'Kimchi', 35.00, 60, 'food', ARRAY['https://images.unsplash.com/photo-1583224964978-2257b960c3e3?w=400'], true, NOW() - INTERVAL '10 days'),
    (prod3b, seller3_id, 'Korean Snack Box', 'Snack Box', 'Curated box of popular Korean snacks', 'Snacks', 42.00, 40, 'food', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], true, NOW() - INTERVAL '8 days'),
    (prod4a, seller4_id, 'Wireless Earbuds Pro', 'Earbuds Pro', 'Active noise cancelling wireless earbuds', 'Earbuds', 129.00, 35, 'electronics', ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'], true, NOW() - INTERVAL '40 days'),
    (prod4b, seller4_id, 'Smart Watch Band', 'Watch Band', 'Premium leather band for smartwatches', 'Watch band', 45.00, 120, 'electronics', ARRAY['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400'], true, NOW() - INTERVAL '35 days'),
    (prod4c, seller4_id, 'Portable Charger 20000mAh', 'Portable Charger', 'Fast charging portable power bank', 'Charger', 59.00, 90, 'electronics', ARRAY['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400'], true, NOW() - INTERVAL '30 days'),
    (prod5a, seller5_id, 'Ceramic Tea Set', 'Tea Set', 'Traditional Korean ceramic tea set', 'Tea set', 78.00, 25, 'home', ARRAY['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'], true, NOW() - INTERVAL '12 days'),
    (prod5b, seller5_id, 'Hanji Lamp', 'Hanji Lamp', 'Handcrafted Korean paper lamp', 'Lamp', 65.00, 30, 'home', ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], true, NOW() - INTERVAL '10 days');

  -- STREAMS
  INSERT INTO labang_streams (id, seller_id, title, title_ko, status, thumbnail, youtube_url, viewer_count, peak_viewers, scheduled_at, started_at, created_at)
  VALUES
    (stream1_id, seller1_id, 'K-Beauty Skincare Routine Live', 'K-Beauty Live', 'live', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', 'https://www.youtube.com/watch?v=jfKfPfyJRdk', 1250, 1500, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '2 hours'),
    (stream2_id, seller2_id, 'Seoul Fashion Week Looks', 'Fashion Week', 'live', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'https://www.youtube.com/watch?v=5qap5aO4i9A', 890, 1200, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '3 hours'),
    (stream3_id, seller3_id, 'Making Traditional Kimchi Live', 'Kimchi Making', 'live', 'https://images.unsplash.com/photo-1583224964978-2257b960c3e3?w=800', 'https://www.youtube.com/watch?v=21qNxnCS8WU', 650, 800, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '1 hour'),
    (stream4_id, seller4_id, 'New Tech Unboxing and Review', 'Tech Unboxing', 'live', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2100, 2500, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '4 hours'),
    (stream5_id, seller5_id, 'Korean Home Styling Tips', 'Home Styling', 'live', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'https://www.youtube.com/watch?v=lTRiuFIWV54', 420, 550, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '90 minutes');

  -- STREAM PRODUCTS
  INSERT INTO labang_stream_products (stream_id, product_id, display_order, is_featured)
  VALUES
    (stream1_id, prod1a, 0, true),
    (stream1_id, prod1b, 1, false),
    (stream1_id, prod1c, 2, false),
    (stream2_id, prod2a, 0, true),
    (stream2_id, prod2b, 1, false),
    (stream2_id, prod2c, 2, false),
    (stream3_id, prod3a, 0, true),
    (stream3_id, prod3b, 1, false),
    (stream4_id, prod4a, 0, true),
    (stream4_id, prod4b, 1, false),
    (stream4_id, prod4c, 2, false),
    (stream5_id, prod5a, 0, true),
    (stream5_id, prod5b, 1, false);
END $$;
