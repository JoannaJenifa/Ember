// Auto-generated types from schema.graphql
// Generated at: 2025-12-30T09:57:16.686Z

export interface Order {
  id: string
  buyer: string
  seller: string
  productId: string
  amount: string
  status: unknown
  createdAt: string
  confirmedAt?: string
  releasedAmount?: string
  txHash: string
  blockNumber: string
}

export interface Review {
  id: string
  order: unknown
  productId: string
  buyer: string
  rating: number
  contentHash: string
  createdAt: string
  txHash: string
  blockNumber: string
}

export interface ProductRating {
  id: string
  totalRating: string
  reviewCount: string
  averageRating: string
}

export interface Tip {
  id: string
  from: string
  streamer: string
  amount: string
  message?: string
  createdAt: string
  txHash: string
  blockNumber: string
}

export interface Gift {
  id: string
  name: string
  price: string
  animationURI: string
  active: boolean
  createdAt: string
  txHash: string
}

export interface GiftSent {
  id: string
  from: string
  streamer: string
  gift: unknown
  quantity: string
  totalValue: string
  createdAt: string
  txHash: string
  blockNumber: string
}

export interface StreamerStats {
  id: string
  totalTips: string
  totalGifts: string
  tipCount: string
  giftCount: string
}

export interface DailyVolume {
  id: string
  date: string
  orderVolume: string
  tipVolume: string
  giftVolume: string
  orderCount: string
  tipCount: string
  giftCount: string
}
