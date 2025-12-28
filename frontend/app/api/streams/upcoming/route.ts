import { NextRequest, NextResponse } from 'next/server'
import { labangStreamService } from '@/lib/services/labang-stream-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = searchParams.get('hours')
    const limit = hours ? Math.min(parseInt(hours, 10), 50) : 10

    const streams = await labangStreamService.getUpcoming(limit)

    // Note: Seller data should be fetched from subgraph on frontend
    return NextResponse.json({
      success: true,
      streams,
    })
  } catch (error) {
    console.error('Error fetching upcoming streams:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch upcoming streams', streams: [] },
      { status: 500 }
    )
  }
}
