import { NextRequest, NextResponse } from 'next/server'
import { labangReviewService } from '@/lib/services/labang-review-service'
import type { LabangReviewInsert } from '@/lib/db/supabase'

// GET /api/reviews - List reviews (by product or user)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const buyerAddress = searchParams.get('buyerAddress')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (productId) {
      // Get reviews for a product
      const { data, count } = await labangReviewService.getAll({ productId, limit, offset })
      const rating = await labangReviewService.getProductRating(productId)

      return NextResponse.json({
        success: true,
        reviews: data,
        total: count,
        rating,
      })
    }

    if (buyerAddress) {
      // Get reviews by a buyer
      const reviews = await labangReviewService.getByBuyer(buyerAddress)

      return NextResponse.json({
        success: true,
        reviews,
        total: reviews.length,
      })
    }

    // Get all reviews
    const { data, count } = await labangReviewService.getAll({ limit, offset })

    return NextResponse.json({
      success: true,
      reviews: data,
      total: count,
    })
  } catch (error) {
    console.error('GET /api/reviews error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a review (after on-chain submission)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { orderId, productId, buyerAddress, rating, txHash, onchainReviewId } = body

    if (!orderId || !productId || !buyerAddress || !rating || !txHash) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const reviewInsert: LabangReviewInsert = {
      order_id: orderId,
      product_id: productId,
      buyer_address: buyerAddress,
      rating,
      content: body.content || null,
      photos: body.photos || null,
      tx_hash: txHash,
      onchain_review_id: onchainReviewId || null,
      is_verified: true, // Verified because we require on-chain tx
    }

    const review = await labangReviewService.create(reviewInsert)

    return NextResponse.json({
      success: true,
      review,
    })
  } catch (error) {
    console.error('POST /api/reviews error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
