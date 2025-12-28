import { NextRequest, NextResponse } from 'next/server'
import { labangStreamService } from '@/lib/services/labang-stream-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const stream = await labangStreamService.getById(id)

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    if (stream.status === 'live') {
      return NextResponse.json(
        { error: 'Stream is already live' },
        { status: 400 }
      )
    }

    if (stream.status === 'ended') {
      return NextResponse.json(
        { error: 'Cannot go live on an ended stream' },
        { status: 400 }
      )
    }

    // Update stream status to live and return YouTube URL
    await labangStreamService.goLive(id)

    return NextResponse.json({
      youtubeUrl: stream.youtube_url,
    })
  } catch (error) {
    console.error('Failed to get stream credentials:', error)
    return NextResponse.json(
      { error: 'Failed to get stream credentials' },
      { status: 500 }
    )
  }
}
