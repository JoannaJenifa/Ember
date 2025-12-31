import { NextRequest, NextResponse } from 'next/server'
import { labangReviewService } from '@/lib/services/labang-review-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/reviews/[id] - Get a single review with full content
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const review = await labangReviewService.getById(id)

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      review,
    })
  } catch (error) {
    console.error('GET /api/reviews/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}
