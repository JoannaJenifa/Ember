/**
 * Subgraph queries for reviews
 * Queries the local graph-node for review data
 */

import type { SubgraphReview } from '@/lib/types/review'

// NEXT_PUBLIC_INDEXER_URL is required - validated by env-config.ts
const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL!
const SUBGRAPH_URL = `${INDEXER_URL}/subgraphs/name/labang`

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

async function querySubgraph<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Subgraph query failed: ${response.status}`)
  }

  const result: GraphQLResponse<T> = await response.json()

  if (result.errors?.length) {
    throw new Error(result.errors.map(e => e.message).join(', '))
  }

  if (!result.data) {
    throw new Error('No data returned from subgraph')
  }

  return result.data
}

// Get reviews for a product
export async function getProductReviews(
  productId: string,
  options: { first?: number; skip?: number; orderBy?: string; orderDirection?: 'asc' | 'desc' } = {}
): Promise<SubgraphReview[]> {
  const { first = 20, skip = 0, orderBy = 'createdAt', orderDirection = 'desc' } = options

  const query = `
    query ProductReviews($productId: String!, $first: Int!, $skip: Int!, $orderBy: String!, $orderDirection: String!) {
      reviews(
        where: { productId: $productId }
        first: $first
        skip: $skip
        orderBy: $orderBy
        orderDirection: $orderDirection
      ) {
        id
        order { id }
        productId
        buyer
        rating
        contentHash
        createdAt
        txHash
        blockNumber
      }
    }
  `

  const result = await querySubgraph<{ reviews: SubgraphReview[] }>(query, {
    productId,
    first,
    skip,
    orderBy,
    orderDirection,
  })

  return result.reviews
}

// Get product rating aggregation
export async function getProductRating(
  productId: string
): Promise<{ averageRating: number; totalRatings: number } | null> {
  const query = `
    query ProductRating($productId: ID!) {
      productRating(id: $productId) {
        id
        totalRating
        reviewCount
        averageRating
      }
    }
  `

  const result = await querySubgraph<{
    productRating: { totalRating: string; reviewCount: string; averageRating: string } | null
  }>(query, { productId })

  if (!result.productRating) {
    return null
  }

  return {
    averageRating: parseFloat(result.productRating.averageRating),
    totalRatings: parseInt(result.productRating.reviewCount, 10),
  }
}

// Get reviews by buyer address
export async function getBuyerReviews(
  buyerAddress: string,
  options: { first?: number; skip?: number } = {}
): Promise<SubgraphReview[]> {
  const { first = 20, skip = 0 } = options

  const query = `
    query BuyerReviews($buyer: Bytes!, $first: Int!, $skip: Int!) {
      reviews(
        where: { buyer: $buyer }
        first: $first
        skip: $skip
        orderBy: createdAt
        orderDirection: desc
      ) {
        id
        order { id }
        productId
        buyer
        rating
        contentHash
        createdAt
        txHash
        blockNumber
      }
    }
  `

  const result = await querySubgraph<{ reviews: SubgraphReview[] }>(query, {
    buyer: buyerAddress.toLowerCase(),
    first,
    skip,
  })

  return result.reviews
}

// Get a single review by ID
export async function getReviewById(reviewId: string): Promise<SubgraphReview | null> {
  const query = `
    query Review($id: ID!) {
      review(id: $id) {
        id
        order { id }
        productId
        buyer
        rating
        contentHash
        createdAt
        txHash
        blockNumber
      }
    }
  `

  const result = await querySubgraph<{ review: SubgraphReview | null }>(query, { id: reviewId })

  return result.review
}

// Check if an order has been reviewed
export async function checkOrderReviewed(orderId: string): Promise<boolean> {
  const query = `
    query OrderReview($orderId: String!) {
      reviews(where: { order: $orderId }, first: 1) {
        id
      }
    }
  `

  const result = await querySubgraph<{ reviews: Array<{ id: string }> }>(query, { orderId })

  return result.reviews.length > 0
}

// Get recent reviews (for homepage/dashboard)
export async function getRecentReviews(limit: number = 10): Promise<SubgraphReview[]> {
  const query = `
    query RecentReviews($first: Int!) {
      reviews(first: $first, orderBy: createdAt, orderDirection: desc) {
        id
        order { id }
        productId
        buyer
        rating
        contentHash
        createdAt
        txHash
        blockNumber
      }
    }
  `

  const result = await querySubgraph<{ reviews: SubgraphReview[] }>(query, { first: limit })

  return result.reviews
}
