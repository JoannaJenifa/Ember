import { NextRequest, NextResponse } from 'next/server'
import { labangStreamService } from '@/lib/services/labang-stream-service'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const stream = await labangStreamService.getById(id)

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    // Get stream products
    const products = await labangStreamService.getStreamProducts(id)

    return NextResponse.json({ data: { ...stream, products } })
  } catch (error) {
    console.error('Failed to fetch stream:', error)
    return NextResponse.json({ error: 'Failed to fetch stream' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { title, titleKo, thumbnail, scheduledAt } = body

    const stream = await labangStreamService.update(id, {
      title,
      title_ko: titleKo,
      thumbnail,
      scheduled_at: scheduledAt,
    })

    return NextResponse.json({ data: stream })
  } catch (error) {
    console.error('Failed to update stream:', error)
    return NextResponse.json({ error: 'Failed to update stream' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const stream = await labangStreamService.getById(id)

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    if (stream.status === 'live') {
      return NextResponse.json(
        { error: 'Cannot delete a live stream. End it first.' },
        { status: 400 }
      )
    }

    // For now, soft delete by marking as ended
    await labangStreamService.update(id, { status: 'ended' })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete stream:', error)
    return NextResponse.json({ error: 'Failed to delete stream' }, { status: 500 })
  }
}
