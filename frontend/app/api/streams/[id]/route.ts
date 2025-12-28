import { NextRequest, NextResponse } from 'next/server'
import { labangStreamService } from '@/lib/services/labang-stream-service'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const stream = await labangStreamService.getById(id)

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      stream: {
        id: stream.id,
        title: stream.title,
        titleKo: stream.title_ko,
        status: stream.status,
        youtubeUrl: stream.youtube_url,
        thumbnail: stream.thumbnail,
        viewerCount: stream.viewer_count,
        peakViewers: stream.peak_viewers,
      },
    })
  } catch (error) {
    console.error('Error getting stream:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get stream' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    await labangStreamService.endStream(id)

    return NextResponse.json({
      success: true,
      message: 'Stream ended successfully',
    })
  } catch (error) {
    console.error('Error ending stream:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to end stream' },
      { status: 500 }
    )
  }
}
