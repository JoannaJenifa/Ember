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

    if (stream.status === 'ended') {
      return NextResponse.json(
        { error: 'Stream has already ended' },
        { status: 400 }
      )
    }

    // Update database to mark stream as ended
    const updatedStream = await labangStreamService.endStream(id)

    return NextResponse.json({ data: updatedStream })
  } catch (error) {
    console.error('Failed to end stream:', error)
    return NextResponse.json({ error: 'Failed to end stream' }, { status: 500 })
  }
}
