import { NextRequest, NextResponse } from 'next/server'
import { getMessages, addMessage, getMessagesSince } from '@/lib/chat/memory-store'

interface RouteParams {
  params: Promise<{ streamId: string }>
}

// GET: Fetch chat messages for a stream
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { streamId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const sinceId = searchParams.get('since') || undefined

    // Use polling mode if sinceId is provided
    const messages = sinceId
      ? await getMessagesSince(streamId, sinceId)
      : await getMessages(streamId, limit)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Chat GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Send a new chat message or gift
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { streamId } = await params
    const body = await request.json()
    const { message, userAddress, username, type = 'message', giftAmount } = body

    if (!userAddress) {
      return NextResponse.json({ error: 'User address required' }, { status: 400 })
    }

    if (type === 'message' && (!message || message.trim().length === 0)) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    if (message && message.length > 200) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    const messageText = type === 'gift' ? `${giftAmount} VERY Gift` : message.trim()

    const newMessage = await addMessage(
      streamId,
      userAddress,
      messageText,
      username,
      type,
      type === 'gift' ? giftAmount : null
    )

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error('Chat POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
