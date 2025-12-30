-- Test data for Labang: 5 sellers with products and live streams

-- SELLERS (5 sellers across different categories)
INSERT INTO labang_sellers (id, wallet_address, shop_name, shop_name_ko, description, category, profile_image, banner_image, kyc_verified, is_approved, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '0x1234567890abcdef1234567890abcdef12345678',
   'Glow Beauty Korea', 'Glow Beauty Korea',
   'Premium Korean skincare and makeup products',
   'beauty',
   'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
   'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200',
   true, true, NOW() - INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222222', '0x2345678901bcdef12345678901bcdef123456789',
   'Seoul Street Style', 'Seoul Street Style',
   'Trendy K-fashion for the modern generation',
   'fashion',
   'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
   true, true, NOW() - INTERVAL '45 days'),
  ('33333333-3333-3333-3333-333333333333', '0x3456789012cdef123456789012cdef1234567890',
   'Kimchi Kitchen', 'Kimchi Kitchen',
   'Authentic Korean food and snacks delivered fresh',
   'food',
   'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400',
   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
   true, true, NOW() - INTERVAL '20 days'),
  ('44444444-4444-4444-4444-444444444444', '0x4567890123def1234567890123def12345678901',
   'Tech Galaxy Korea', 'Tech Galaxy Korea',
   'Latest gadgets and electronics from Korea',
   'electronics',
   'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
   'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200',
   true, true, NOW() - INTERVAL '60 days'),
  ('55555555-5555-5555-5555-555555555555', '0x5678901234ef12345678901234ef123456789012',
   'Hanok Living', 'Hanok Living',
   'Traditional Korean home decor with modern touch',
   'home',
   'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400',
   'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200',
   true, true, NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO UPDATE SET shop_name = EXCLUDED.shop_name;

-- PRODUCTS (2-3 products per seller)
INSERT INTO labang_products (id, seller_id, title, title_ko, description, description_ko, price_very, inventory, category, images, is_active, created_at)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Glow Serum Set', 'Glow Serum Set', 'Vitamin C brightening serum with hyaluronic acid', 'Vitamin C serum', 45.00, 100, 'beauty', ARRAY['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'], true, NOW() - INTERVAL '25 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '11111111-1111-1111-1111-111111111111', 'K-Beauty Sheet Mask Pack', 'Sheet Mask Pack', '10-piece hydrating sheet mask collection', 'Sheet masks', 25.00, 200, 'beauty', ARRAY['https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400'], true, NOW() - INTERVAL '20 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', '11111111-1111-1111-1111-111111111111', 'Cushion Foundation SPF50', 'Cushion Foundation', 'Natural coverage with sun protection', 'Foundation', 38.00, 75, 'beauty', ARRAY['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'], true, NOW() - INTERVAL '15 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbba', '22222222-2222-2222-2222-222222222222', 'Oversized Blazer', 'Oversized Blazer', 'Korean street style oversized blazer', 'Blazer', 89.00, 50, 'fashion', ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'], true, NOW() - INTERVAL '30 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222222', 'Wide Leg Pants', 'Wide Leg Pants', 'Comfortable high-waist wide leg pants', 'Pants', 55.00, 80, 'fashion', ARRAY['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'], true, NOW() - INTERVAL '25 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '22222222-2222-2222-2222-222222222222', 'Bucket Hat', 'Bucket Hat', 'Trendy bucket hat in multiple colors', 'Hat', 28.00, 150, 'fashion', ARRAY['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400'], true, NOW() - INTERVAL '20 days'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', '33333333-3333-3333-3333-333333333333', 'Premium Kimchi Set', 'Kimchi Set', 'Handmade traditional kimchi variety pack', 'Kimchi', 35.00, 60, 'food', ARRAY['https://images.unsplash.com/photo-1583224964978-2257b960c3e3?w=400'], true, NOW() - INTERVAL '10 days'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', '33333333-3333-3333-3333-333333333333', 'Korean Snack Box', 'Snack Box', 'Curated box of popular Korean snacks', 'Snacks', 42.00, 40, 'food', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], true, NOW() - INTERVAL '8 days'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd1', '44444444-4444-4444-4444-444444444444', 'Wireless Earbuds Pro', 'Earbuds Pro', 'Active noise cancelling wireless earbuds', 'Earbuds', 129.00, 35, 'electronics', ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'], true, NOW() - INTERVAL '40 days'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd2', '44444444-4444-4444-4444-444444444444', 'Smart Watch Band', 'Watch Band', 'Premium leather band for smartwatches', 'Watch band', 45.00, 120, 'electronics', ARRAY['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400'], true, NOW() - INTERVAL '35 days'),
  ('dddddddd-dddd-dddd-dddd-ddddddddddd3', '44444444-4444-4444-4444-444444444444', 'Portable Charger 20000mAh', 'Portable Charger', 'Fast charging portable power bank', 'Charger', 59.00, 90, 'electronics', ARRAY['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400'], true, NOW() - INTERVAL '30 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', '55555555-5555-5555-5555-555555555555', 'Ceramic Tea Set', 'Tea Set', 'Traditional Korean ceramic tea set', 'Tea set', 78.00, 25, 'home', ARRAY['https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'], true, NOW() - INTERVAL '12 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', '55555555-5555-5555-5555-555555555555', 'Hanji Lamp', 'Hanji Lamp', 'Handcrafted Korean paper lamp', 'Lamp', 65.00, 30, 'home', ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], true, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- STREAMS (5 live streams with real YouTube URLs)
INSERT INTO labang_streams (id, seller_id, title, title_ko, status, thumbnail, youtube_url, viewer_count, peak_viewers, scheduled_at, started_at, created_at)
VALUES
  ('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'K-Beauty Skincare Routine Live', 'K-Beauty Live', 'live', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800', 'https://www.youtube.com/watch?v=jfKfPfyJRdk', 1250, 1500, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '2 hours'),
  ('f2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Seoul Fashion Week Looks', 'Fashion Week', 'live', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'https://www.youtube.com/watch?v=5qap5aO4i9A', 890, 1200, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '3 hours'),
  ('f3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Making Traditional Kimchi Live', 'Kimchi Making', 'live', 'https://images.unsplash.com/photo-1583224964978-2257b960c3e3?w=800', 'https://www.youtube.com/watch?v=21qNxnCS8WU', 650, 800, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '1 hour'),
  ('f4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'New Tech Unboxing and Review', 'Tech Unboxing', 'live', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 2100, 2500, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '4 hours'),
  ('f5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'Korean Home Styling Tips', 'Home Styling', 'live', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'https://www.youtube.com/watch?v=lTRiuFIWV54', 420, 550, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '90 minutes')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, viewer_count = EXCLUDED.viewer_count;

-- STREAM PRODUCTS (Link products to streams)
INSERT INTO labang_stream_products (stream_id, product_id, display_order, is_featured)
VALUES
  ('f1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 0, true),
  ('f1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', 1, false),
  ('f1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', 2, false),
  ('f2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbba', 0, true),
  ('f2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 1, false),
  ('f2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 2, false),
  ('f3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', 0, true),
  ('f3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-ccccccccccc2', 1, false),
  ('f4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-ddddddddddd1', 0, true),
  ('f4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-ddddddddddd2', 1, false),
  ('f4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-ddddddddddd3', 2, false),
  ('f5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 0, true),
  ('f5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 1, false)
ON CONFLICT (stream_id, product_id) DO UPDATE SET display_order = EXCLUDED.display_order, is_featured = EXCLUDED.is_featured;
