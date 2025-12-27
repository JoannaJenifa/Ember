export const SELLER_CATEGORIES = [
  { value: 'fashion', labelKo: '패션', labelEn: 'Fashion', icon: '👕' },
  { value: 'beauty', labelKo: '뷰티', labelEn: 'Beauty', icon: '💄' },
  { value: 'food', labelKo: '식품', labelEn: 'Food', icon: '🍜' },
  { value: 'home', labelKo: '생활', labelEn: 'Home', icon: '🏠' },
  { value: 'tech', labelKo: '테크', labelEn: 'Tech', icon: '📱' },
  { value: 'sports', labelKo: '스포츠', labelEn: 'Sports', icon: '⚽' },
  { value: 'kids', labelKo: '키즈', labelEn: 'Kids', icon: '🧸' },
  { value: 'art', labelKo: '예술', labelEn: 'Art', icon: '🎨' },
] as const

export type SellerCategory = (typeof SELLER_CATEGORIES)[number]['value']

export function getCategoryLabel(value: string, locale: 'en' | 'ko' = 'en'): string {
  const category = SELLER_CATEGORIES.find((c) => c.value === value)
  if (!category) return value
  return locale === 'ko' ? category.labelKo : category.labelEn
}

export function getCategoryIcon(value: string): string {
  const category = SELLER_CATEGORIES.find((c) => c.value === value)
  return category ? category.icon : '📦'
}
