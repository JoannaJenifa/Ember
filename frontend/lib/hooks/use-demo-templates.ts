'use client'

import {
  getDemoProduct,
  getDemoStream,
  getDemoSeller,
  getDemoShipping,
  getDemoTip,
  getDemoReview,
  getDemoBridge,
  getDemoGift,
} from '@/lib/demo/templates'

/**
 * Hook to get demo templates
 * Each call to a getter function returns a random template
 */
export function useDemoTemplates() {
  return {
    getProduct: getDemoProduct,
    getStream: getDemoStream,
    getSeller: getDemoSeller,
    getShipping: getDemoShipping,
    getTip: getDemoTip,
    getReview: getDemoReview,
    getBridge: getDemoBridge,
    getGift: getDemoGift,
  }
}
