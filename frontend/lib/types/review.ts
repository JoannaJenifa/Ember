// Review types for the review system
import type { LabangReview } from '@/lib/db/supabase'

// Review with computed/display fields
export interface Review {
  id: string
  onchainReviewId: string
  orderId: string
  productId: string
  buyerAddress: string
  rating: number
  content?: string
  photos?: string[]
  isVerified: boolean
  txHash: string
  createdAt: Date
}

// Product rating aggregation
export interface ProductRating {
  productId: string
  averageRating: number
  totalRatings: number
  distribution: RatingDistribution
}

export interface RatingDistribution {
  5: number
  4: number
  3: number
  2: number
  1: number
}

// On-chain review from contract
export interface OnchainReview {
  orderId: `0x${string}`
  productId: bigint
  reviewer: `0x${string}`
  rating: number
  contentHash: `0x${string}`
  createdAt: bigint
}

// Subgraph review entity
export interface SubgraphReview {
  id: string
  order: { id: string }
  productId: string
  buyer: string
  rating: number
  contentHash: string
  createdAt: string
  txHash: string
  blockNumber: string
}

// Submit review input
export interface SubmitReviewInput {
  orderId: string
  rating: number
  content?: string
  photos?: File[]
}

// Review form state
export interface ReviewFormState {
  rating: number
  content: string
  photos: File[]
  uploading: boolean
  submitting: boolean
  error: string | null
}

// Review card display props
export interface ReviewCardProps {
  review: Review | LabangReview
  showProduct?: boolean
}

// Review list filter options
export interface ReviewFilters {
  productId?: string
  buyerAddress?: string
  sortBy?: 'latest' | 'rating'
  limit?: number
  offset?: number
}

// Convert database review to display review
export function toReview(dbReview: LabangReview): Review {
  return {
    id: dbReview.id,
    onchainReviewId: dbReview.onchain_review_id ?? '',
    orderId: dbReview.order_id ?? '',
    productId: dbReview.product_id ?? '',
    buyerAddress: dbReview.buyer_address ?? '',
    rating: dbReview.rating ?? 0,
    content: dbReview.content ?? undefined,
    photos: dbReview.photos ?? undefined,
    isVerified: dbReview.is_verified ?? false,
    txHash: dbReview.tx_hash ?? '',
    createdAt: new Date(dbReview.created_at ?? Date.now()),
  }
}

// Calculate rating distribution from reviews
export function calculateRatingDistribution(reviews: Review[]): RatingDistribution {
  const distribution: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  reviews.forEach(review => {
    const rating = Math.round(review.rating) as 1 | 2 | 3 | 4 | 5
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++
    }
  })

  return distribution
}

// Calculate product rating from reviews
export function calculateProductRating(productId: string, reviews: Review[]): ProductRating {
  if (reviews.length === 0) {
    return {
      productId,
      averageRating: 0,
      totalRatings: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    }
  }

  const total = reviews.reduce((sum, r) => sum + r.rating, 0)

  return {
    productId,
    averageRating: total / reviews.length,
    totalRatings: reviews.length,
    distribution: calculateRatingDistribution(reviews),
  }
}
