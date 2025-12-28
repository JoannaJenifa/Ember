import { NextRequest, NextResponse } from 'next/server'

// NEXT_PUBLIC_INDEXER_URL is required - validated by env-config.ts
const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL!
const SUBGRAPH_URL = `${INDEXER_URL}/subgraphs/name/labang`

// GET /api/subgraph/reviews - Fetch reviews from subgraph (real on-chain data)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const buyerAddress = searchParams.get('buyer')
    const first = parseInt(searchParams.get('first') || '50')

    // Build where clause
    const whereConditions: string[] = []
    if (productId) {
      whereConditions.push(`productId: "${productId}"`)
    }
    if (buyerAddress) {
      whereConditions.push(`buyer: "${buyerAddress.toLowerCase()}"`)
    }

    const whereClause = whereConditions.length > 0
      ? `where: { ${whereConditions.join(', ')} }`
      : ''

    const query = `
      query GetReviews {
        reviews(
          first: ${first}
          orderBy: createdAt
          orderDirection: desc
          ${whereClause}
        ) {
          id
          order {
            id
            buyer
            seller
            amount
          }
          productId
          buyer
          rating
          contentHash
          createdAt
          txHash
          blockNumber
        }
        productRatings(first: 100) {
          id
          totalRating
          reviewCount
          averageRating
        }
      }
    `

    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Subgraph error: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Subgraph query failed')
    }

    // Transform data
    const reviews = (result.data?.reviews || []).map((review: any) => ({
      ...review,
      createdAtDate: new Date(parseInt(review.createdAt) * 1000).toISOString(),
    }))

    const productRatings = (result.data?.productRatings || []).reduce((acc: any, pr: any) => {
      acc[pr.id] = {
        averageRating: parseFloat(pr.averageRating),
        reviewCount: parseInt(pr.reviewCount),
      }
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        productRatings,
      }
    })
  } catch (error) {
    console.error('Subgraph reviews error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
