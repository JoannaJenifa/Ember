'use client'

import { useTranslation } from '@/lib/i18n'
import {
  getDemoProduct,
  getDemoStream,
  getDemoSeller,
  getDemoShipping,
  getDemoTip,
  getDemoReview,
  getDemoBridge,
  getDemoGift,
  type Locale,
} from '@/lib/demo/templates'

/**
 * Hook to get demo templates based on current locale
 * Each call to a getter function returns a random template
 */
export function useDemoTemplates() {
  const { locale } = useTranslation()

  return {
    locale: locale as Locale,
    getProduct: () => getDemoProduct(locale as Locale),
    getStream: () => getDemoStream(locale as Locale),
    getSeller: () => getDemoSeller(locale as Locale),
    getShipping: () => getDemoShipping(locale as Locale),
    getTip: () => getDemoTip(locale as Locale),
    getReview: () => getDemoReview(locale as Locale),
    getBridge: () => getDemoBridge(locale as Locale),
    getGift: () => getDemoGift(locale as Locale),
  }
}
