import { NextRequest, NextResponse } from 'next/server'
import { labangStreamService } from '@/lib/services/labang-stream-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    const streams = await labangStreamService.getLive()

    // Note: Seller data should be fetched from subgraph on frontend
    const enrichedStreams = streams.map((stream) => ({
      ...stream,
      category: category || undefined,
    }))

    // Apply limit if specified
    const limitedStreams = limit
      ? enrichedStreams.slice(0, parseInt(limit, 10))
      : enrichedStreams

    return NextResponse.json({
      success: true,
      streams: limitedStreams,
    })
  } catch (error) {
    console.error('Error fetching live streams:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch live streams', streams: [] },
      { status: 500 }
    )
  }
}
