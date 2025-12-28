import { NextRequest, NextResponse } from 'next/server'
import { labangStreamService } from '@/lib/services/labang-stream-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || undefined
    const sort = (searchParams.get('sort') as 'popular' | 'latest') || 'popular'
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!, 10)
      : 20

    const streams = await labangStreamService.getReplays({
      category,
      sort,
      limit,
    })

    // Note: Seller data should be fetched from subgraph on frontend
    return NextResponse.json({
      success: true,
      streams,
    })
  } catch (error) {
    console.error('Error fetching replays:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch replays', streams: [] },
      { status: 500 }
    )
  }
}
