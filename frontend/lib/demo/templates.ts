/**
 * Demo form templates for faster demos
 * Each form has 3-5 alternatives in both English and Korean
 */

export type Locale = 'en' | 'ko';

// Helper to get random template
export function getRandomTemplate<T>(templates: T[]): T {
  return templates[Math.floor(Math.random() * templates.length)];
}

// ============================================
// PRODUCT FORM TEMPLATES
// ============================================
export const productTemplates = {
  en: [
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
  ],
  ko: [
    {
      title: '프리미엄 한국 인삼차 세트',
      description: '6년근 인삼으로 만든 정통 한국 인삼차입니다. 티백 30개와 아름다운 도자기 컵이 포함되어 있습니다. 건강을 생각하는 분들께 완벽한 선물입니다.',
      priceVery: '25',
      inventory: '100',
      category: 'food',
    },
    {
      title: 'K-뷰티 스킨케어 번들',
      description: '한국 최고의 브랜드들로 구성된 완벽한 스킨케어 루틴. 클렌저, 토너, 세럼, 모이스처라이저가 포함되어 있습니다. 모든 피부 타입에 적합합니다.',
      priceVery: '45',
      inventory: '50',
      category: 'beauty',
    },
    {
      title: '수제 도자기 화병',
      description: '장인이 직접 만든 전통 한국 청자 화병입니다. 천연 유약의 변화로 각 작품이 유일무이합니다. 높이: 25cm.',
      priceVery: '120',
      inventory: '20',
      category: 'home',
    },
    {
      title: '유기농 김치 만들기 키트',
      description: '집에서 정통 한국 김치를 만드는 데 필요한 모든 것. 양념, 젓갈, 상세한 레시피 가이드가 포함되어 있습니다.',
      priceVery: '35',
      inventory: '75',
      category: 'food',
    },
    {
      title: '한국 스트릿 패션 후디',
      description: '홍대 패션에서 영감을 받은 오버사이즈 스트릿웨어 후디. 프리미엄 코튼 블렌드, 유니섹스 디자인. 다양한 색상 선택 가능.',
      priceVery: '55',
      inventory: '200',
      category: 'fashion',
    },
  ],
};

// ============================================
// STREAM FORM TEMPLATES
// ============================================
export const streamTemplates = {
  en: [
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
  ],
  ko: [
    {
      title: '봄 컬렉션 론칭 - 독점 프리뷰',
      youtubeUrl: 'https://youtube.com/live/demo123',
    },
    {
      title: '메이크업 튜토리얼 & 제품 쇼케이스',
      youtubeUrl: 'https://youtube.com/live/beauty456',
    },
    {
      title: '주말 플래시 세일 - 최대 70% 할인',
      youtubeUrl: 'https://youtube.com/live/sale789',
    },
    {
      title: '비하인드 스토리: 제품 제작 과정 공개',
      youtubeUrl: 'https://youtube.com/live/bts101',
    },
    {
      title: '대표와의 Q&A 세션 + 경품 증정',
      youtubeUrl: 'https://youtube.com/live/qna202',
    },
  ],
};

// ============================================
// SELLER REGISTRATION TEMPLATES
// ============================================
export const sellerTemplates = {
  en: [
    {
      shopName: 'Seoul Style Boutique',
      description: 'Curated Korean fashion and lifestyle products. We bring the best of Seoul street style directly to you. Free shipping on orders over 50 VERY.',
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
  ],
  ko: [
    {
      shopName: '서울 스타일 부티크',
      description: '엄선된 한국 패션과 라이프스타일 제품. 서울 스트릿 스타일의 베스트를 직접 전달합니다. 50 VERY 이상 주문 시 무료 배송.',
      category: 'fashion',
    },
    {
      shopName: 'K-뷰티 헤이븐',
      description: '정통 한국 스킨케어와 화장품을 한 곳에서. 한국 브랜드와 직접 파트너십을 맺어 정품과 신선도를 보장합니다.',
      category: 'beauty',
    },
    {
      shopName: '한옥 홈 굿즈',
      description: '전통 한국 홈 데코와 수공예품. 각 제품은 한국의 유산과 장인정신의 이야기를 담고 있습니다.',
      category: 'home',
    },
    {
      shopName: '서울 스낵 박스',
      description: '한국의 맛을 발견하세요! 엄선된 한국 과자, 차, 특산물을 신선하게 배송합니다.',
      category: 'food',
    },
    {
      shopName: '테크 코리아 스토어',
      description: '최신 한국 전자제품과 가젯을 경쟁력 있는 가격에. 공식 리셀러로 전체 보증 지원.',
      category: 'electronics',
    },
  ],
};

// ============================================
// SHIPPING INFO TEMPLATES
// ============================================
export const shippingTemplates = {
  en: [
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
  ],
  ko: [
    {
      name: '김민수',
      phone: '010-1234-5678',
      address: '서울특별시 강남구 테헤란로 123\n삼성동 아파트 101동 1502호\n06234',
      memo: '문 앞에 놓아주세요',
    },
    {
      name: '이지은',
      phone: '010-9876-5432',
      address: '서울특별시 마포구 홍대입구로 456\n서교동 오피스텔 303호\n04066',
      memo: '벨 두 번 눌러주세요',
    },
    {
      name: '박준혁',
      phone: '010-5555-1234',
      address: '부산광역시 해운대구 해운대로 789\n우동 현대아파트 507동 1203호\n48094',
      memo: '도착 시 전화주세요',
    },
    {
      name: '최서연',
      phone: '010-4321-8765',
      address: '인천광역시 연수구 송도동 321\n송도타워 A동 2501호\n21990',
      memo: '경비실에 맡겨주세요',
    },
    {
      name: '정현우',
      phone: '010-6789-0123',
      address: '대전광역시 유성구 대학로 654\n봉명동 주공아파트 102동 801호\n34126',
      memo: '',
    },
  ],
};

// ============================================
// TIP MESSAGE TEMPLATES
// ============================================
export const tipTemplates = {
  en: [
    { amount: '10', message: 'Love your stream! Keep it up!' },
    { amount: '50', message: 'Amazing products! Just bought two items!' },
    { amount: '100', message: 'Best live shopping experience ever! Thank you!' },
    { amount: '25', message: 'Your energy is contagious! Great show!' },
    { amount: '75', message: 'Supporting from NYC! Love Korean products!' },
  ],
  ko: [
    { amount: '10', message: '방송 너무 재미있어요! 화이팅!' },
    { amount: '50', message: '제품 너무 좋아요! 두 개 샀어요!' },
    { amount: '100', message: '최고의 라이브 쇼핑 경험이에요! 감사합니다!' },
    { amount: '25', message: '에너지가 넘쳐요! 멋진 방송이에요!' },
    { amount: '75', message: '부산에서 응원해요! 앞으로도 화이팅!' },
  ],
};

// ============================================
// REVIEW TEMPLATES
// ============================================
export const reviewTemplates = {
  en: [
    { rating: 5, content: 'Absolutely love this product! Quality exceeded my expectations. Fast shipping and great packaging. Will definitely buy again!' },
    { rating: 4, content: 'Great product overall. The quality is good and it arrived on time. Minor issue with sizing but customer service was helpful.' },
    { rating: 5, content: 'Perfect gift for my friend! She loved it. The Korean quality is evident. Highly recommend this seller!' },
    { rating: 5, content: 'Exactly as described. Beautiful craftsmanship and attention to detail. Worth every VERY token spent!' },
    { rating: 4, content: 'Good value for the price. Shipping took a bit longer than expected but product quality makes up for it.' },
  ],
  ko: [
    { rating: 5, content: '이 제품 정말 사랑해요! 품질이 기대 이상이에요. 빠른 배송과 멋진 포장. 꼭 다시 구매할 거예요!' },
    { rating: 4, content: '전반적으로 좋은 제품이에요. 품질도 좋고 정시에 도착했어요. 사이즈에 약간 문제가 있었지만 고객 서비스가 도움이 됐어요.' },
    { rating: 5, content: '친구 선물로 완벽해요! 너무 좋아했어요. 한국 품질이 확실히 느껴져요. 이 판매자 강력 추천합니다!' },
    { rating: 5, content: '설명과 정확히 일치해요. 아름다운 장인정신과 세심한 디테일. 지불한 VERY 토큰의 가치가 있어요!' },
    { rating: 4, content: '가격 대비 좋은 가치에요. 배송이 예상보다 조금 오래 걸렸지만 제품 품질이 그것을 보상해요.' },
  ],
};

// ============================================
// BRIDGE FORM TEMPLATES
// ============================================
export const bridgeTemplates = {
  en: [
    { amount: '100', slippage: '0.5' },
    { amount: '500', slippage: '1' },
    { amount: '1000', slippage: '0.5' },
    { amount: '250', slippage: '1' },
    { amount: '50', slippage: '0.5' },
  ],
  ko: [
    { amount: '100', slippage: '0.5' },
    { amount: '500', slippage: '1' },
    { amount: '1000', slippage: '0.5' },
    { amount: '250', slippage: '1' },
    { amount: '50', slippage: '0.5' },
  ],
};

// ============================================
// GIFT QUANTITY TEMPLATES
// ============================================
export const giftTemplates = {
  en: [
    { quantity: 1 },
    { quantity: 5 },
    { quantity: 10 },
    { quantity: 3 },
    { quantity: 7 },
  ],
  ko: [
    { quantity: 1 },
    { quantity: 5 },
    { quantity: 10 },
    { quantity: 3 },
    { quantity: 7 },
  ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getDemoProduct(locale: Locale) {
  return getRandomTemplate(productTemplates[locale]);
}

export function getDemoStream(locale: Locale) {
  return getRandomTemplate(streamTemplates[locale]);
}

export function getDemoSeller(locale: Locale) {
  return getRandomTemplate(sellerTemplates[locale]);
}

export function getDemoShipping(locale: Locale) {
  return getRandomTemplate(shippingTemplates[locale]);
}

export function getDemoTip(locale: Locale) {
  return getRandomTemplate(tipTemplates[locale]);
}

export function getDemoReview(locale: Locale) {
  return getRandomTemplate(reviewTemplates[locale]);
}

export function getDemoBridge(locale: Locale) {
  return getRandomTemplate(bridgeTemplates[locale]);
}

export function getDemoGift(locale: Locale) {
  return getRandomTemplate(giftTemplates[locale]);
}
