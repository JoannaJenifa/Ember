import { NextRequest, NextResponse } from 'next/server'
import { labangStreamService } from '@/lib/services/labang-stream-service'

interface RouteContext {
  params: Promise<{ id: string }>
}

// Helper function for decrementing viewer count
async function handleLeave(id: string) {
  try {
    const stream = await labangStreamService.getById(id)
    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    const currentCount = stream.viewer_count ?? 0
    const newCount = Math.max(0, currentCount - 1)
    await labangStreamService.updateViewerCount(id, newCount)

    return NextResponse.json({ success: true, viewerCount: newCount })
  } catch (error) {
    console.error('Error decrementing viewer count:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update viewer count' },
      { status: 500 }
    )
  }
}

// POST: Increment viewer count (user joined)
// DELETE: Decrement viewer count (user left)
// POST with ?_method=DELETE: Used by sendBeacon for page unload
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)

    // Handle sendBeacon with _method=DELETE for page unload
    if (searchParams.get('_method') === 'DELETE') {
      return handleLeave(id)
    }

    const stream = await labangStreamService.getById(id)

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    if (stream.status !== 'live') {
      return NextResponse.json({ error: 'Stream is not live' }, { status: 400 })
    }

    const newCount = (stream.viewer_count ?? 0) + 1
    await labangStreamService.updateViewerCount(id, newCount)

    return NextResponse.json({
      success: true,
      viewerCount: newCount,
    })
  } catch (error) {
    console.error('Error incrementing viewer count:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update viewer count' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  return handleLeave(id)
}
