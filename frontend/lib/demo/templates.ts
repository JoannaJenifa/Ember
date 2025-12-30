/**
 * Demo form templates for faster demos
 * English-only templates
 */

// Helper to get random template
export function getRandomTemplate<T>(templates: T[]): T {
  return templates[Math.floor(Math.random() * templates.length)];
}

// ============================================
// PRODUCT FORM TEMPLATES
// ============================================
export const productTemplates = [
  {
    title: 'Premium Korean Ginseng Tea Set',
    description: 'Authentic Korean ginseng tea made from 6-year-old roots. Includes 30 tea bags and a beautiful ceramic cup. Perfect for health-conscious consumers.',
    priceVery: '25',
    inventory: '100',
    category: 'food',
  },
  {
    title: 'K-Beauty Skincare Bundle',
    description: 'Complete skincare routine featuring top Korean brands. Includes cleanser, toner, serum, and moisturizer. Suitable for all skin types.',
    priceVery: '45',
    inventory: '50',
    category: 'beauty',
  },
  {
    title: 'Handmade Ceramic Vase',
    description: 'Traditional Korean celadon vase handcrafted by master artisans. Each piece is unique with natural glaze variations. Height: 25cm.',
    priceVery: '120',
    inventory: '20',
    category: 'home',
  },
  {
    title: 'Organic Kimchi Starter Kit',
    description: 'Everything you need to make authentic Korean kimchi at home. Includes spices, fish sauce, and detailed recipe guide in English.',
    priceVery: '35',
    inventory: '75',
    category: 'food',
  },
  {
    title: 'Korean Street Fashion Hoodie',
    description: 'Oversized streetwear hoodie inspired by Hongdae fashion. Premium cotton blend, unisex design. Available in multiple colors.',
    priceVery: '55',
    inventory: '200',
    category: 'fashion',
  },
];

// ============================================
// STREAM FORM TEMPLATES
// ============================================
export const streamTemplates = [
  {
    title: 'Spring Collection Launch - Exclusive Preview',
    youtubeUrl: 'https://youtube.com/live/demo123',
  },
  {
    title: 'Makeup Tutorial & Product Showcase',
    youtubeUrl: 'https://youtube.com/live/beauty456',
  },
  {
    title: 'Weekend Flash Sale - Up to 70% Off',
    youtubeUrl: 'https://youtube.com/live/sale789',
  },
  {
    title: 'Behind the Scenes: How We Make Our Products',
    youtubeUrl: 'https://youtube.com/live/bts101',
  },
  {
    title: 'Q&A Session with Founder + Giveaway',
    youtubeUrl: 'https://youtube.com/live/qna202',
  },
];

// ============================================
// SELLER REGISTRATION TEMPLATES
// ============================================
export const sellerTemplates = [
  {
    shopName: 'Seoul Style Boutique',
    description: 'Curated Korean fashion and lifestyle products. We bring the best of Seoul street style directly to you. Free shipping on orders over 50 MOVE.',
    category: 'fashion',
  },
  {
    shopName: 'K-Beauty Haven',
    description: 'Your one-stop shop for authentic Korean skincare and cosmetics. We partner directly with Korean brands to ensure authenticity and freshness.',
    category: 'beauty',
  },
  {
    shopName: 'Hanok Home Goods',
    description: 'Traditional Korean home decor and handcrafted items. Each piece tells a story of Korean heritage and craftsmanship.',
    category: 'home',
  },
  {
    shopName: 'Seoul Snack Box',
    description: 'Discover the flavors of Korea! We offer carefully selected Korean snacks, teas, and specialty foods shipped fresh to your door.',
    category: 'food',
  },
  {
    shopName: 'Tech Korea Store',
    description: 'Latest Korean electronics and gadgets at competitive prices. Authorized reseller with full warranty support.',
    category: 'electronics',
  },
];

// ============================================
// SHIPPING INFO TEMPLATES
// ============================================
export const shippingTemplates = [
  {
    name: 'John Smith',
    phone: '010-1234-5678',
    address: '123 Main Street, Apt 4B\nNew York, NY 10001\nUSA',
    memo: 'Please leave at door',
  },
  {
    name: 'Sarah Johnson',
    phone: '010-9876-5432',
    address: '456 Oak Avenue\nLos Angeles, CA 90001\nUSA',
    memo: 'Ring doorbell twice',
  },
  {
    name: 'Michael Chen',
    phone: '010-5555-1234',
    address: '789 Maple Road, Unit 12\nSan Francisco, CA 94102\nUSA',
    memo: 'Call upon arrival',
  },
  {
    name: 'Emily Davis',
    phone: '010-4321-8765',
    address: '321 Pine Street\nSeattle, WA 98101\nUSA',
    memo: 'Deliver to concierge',
  },
  {
    name: 'David Wilson',
    phone: '010-6789-0123',
    address: '654 Birch Lane, Suite 5\nChicago, IL 60601\nUSA',
    memo: '',
  },
];

// ============================================
// TIP MESSAGE TEMPLATES
// ============================================
export const tipTemplates = [
  { amount: '10', message: 'Love your stream! Keep it up!' },
  { amount: '50', message: 'Amazing products! Just bought two items!' },
  { amount: '100', message: 'Best live shopping experience ever! Thank you!' },
  { amount: '25', message: 'Your energy is contagious! Great show!' },
  { amount: '75', message: 'Supporting from NYC! Love Korean products!' },
];

// ============================================
// REVIEW TEMPLATES
// ============================================
export const reviewTemplates = [
  { rating: 5, content: 'Absolutely love this product! Quality exceeded my expectations. Fast shipping and great packaging. Will definitely buy again!' },
  { rating: 4, content: 'Great product overall. The quality is good and it arrived on time. Minor issue with sizing but customer service was helpful.' },
  { rating: 5, content: 'Perfect gift for my friend! She loved it. The Korean quality is evident. Highly recommend this seller!' },
  { rating: 5, content: 'Exactly as described. Beautiful craftsmanship and attention to detail. Worth every MOVE token spent!' },
  { rating: 4, content: 'Good value for the price. Shipping took a bit longer than expected but product quality makes up for it.' },
];

// ============================================
// BRIDGE FORM TEMPLATES
// ============================================
export const bridgeTemplates = [
  { amount: '100', slippage: '0.5' },
  { amount: '500', slippage: '1' },
  { amount: '1000', slippage: '0.5' },
  { amount: '250', slippage: '1' },
  { amount: '50', slippage: '0.5' },
];

// ============================================
// GIFT QUANTITY TEMPLATES
// ============================================
export const giftTemplates = [
  { quantity: 1 },
  { quantity: 5 },
  { quantity: 10 },
  { quantity: 3 },
  { quantity: 7 },
];

// ============================================
// DISPUTE TEMPLATES
// ============================================
export const disputeTemplates = [
  { reason: 'not_received', description: 'Package shows as delivered but I never received it. I checked with neighbors and building management but no one has seen it.' },
  { reason: 'wrong_item', description: 'I ordered the rose serum but received the lavender version instead. The packaging and product are completely different from what I ordered.' },
  { reason: 'damaged', description: 'The product arrived with the bottle cracked and most of the serum leaked out. The packaging was not adequately protected.' },
  { reason: 'not_as_described', description: 'The serum consistency is much thinner than shown in the demo. The scent is also different from what was described in the stream.' },
  { reason: 'quality', description: 'The product quality seems lower than expected. The texture feels different from what was demonstrated and doesn\'t absorb well.' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getDemoProduct() {
  return getRandomTemplate(productTemplates);
}

export function getDemoStream() {
  return getRandomTemplate(streamTemplates);
}

export function getDemoSeller() {
  return getRandomTemplate(sellerTemplates);
}

export function getDemoShipping() {
  return getRandomTemplate(shippingTemplates);
}

export function getDemoTip() {
  return getRandomTemplate(tipTemplates);
}

export function getDemoReview() {
  return getRandomTemplate(reviewTemplates);
}

export function getDemoBridge() {
  return getRandomTemplate(bridgeTemplates);
}

export function getDemoGift() {
  return getRandomTemplate(giftTemplates);
}

export function getDemoDispute() {
  return getRandomTemplate(disputeTemplates);
}
