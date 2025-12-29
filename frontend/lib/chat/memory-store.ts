'use server'

/**
 * In-memory chat store for development/demo purposes.
 * Messages are stored in a Map keyed by streamId.
 * This is NOT persistent - messages are lost on server restart.
 */

export interface ChatMessage {
  id: string
  stream_id: string
  user_address: string
  username: string | null
  message: string
  type: 'message' | 'gift' | 'system'
  gift_amount: number | null
  created_at: string
}

// Global in-memory store (persists across requests in dev server)
const chatStore = new Map<string, ChatMessage[]>()

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function getMessages(
  streamId: string,
  limit = 100
): Promise<ChatMessage[]> {
  const messages = chatStore.get(streamId) || []
  return messages.slice(-limit)
}

export async function addMessage(
  streamId: string,
  userAddress: string,
  message: string,
  username?: string | null,
  type: 'message' | 'gift' | 'system' = 'message',
  giftAmount?: number | null
): Promise<ChatMessage> {
  const newMessage: ChatMessage = {
    id: generateId(),
    stream_id: streamId,
    user_address: userAddress,
    username: username || null,
    message,
    type,
    gift_amount: giftAmount || null,
    created_at: new Date().toISOString(),
  }

  const messages = chatStore.get(streamId) || []
  messages.push(newMessage)

  // Keep only last 500 messages per stream
  if (messages.length > 500) {
    messages.splice(0, messages.length - 500)
  }

  chatStore.set(streamId, messages)
  return newMessage
}

export async function getMessagesSince(
  streamId: string,
  sinceId?: string
): Promise<ChatMessage[]> {
  const messages = chatStore.get(streamId) || []

  if (!sinceId) {
    return messages.slice(-50)
  }

  const index = messages.findIndex((m) => m.id === sinceId)
  if (index === -1) {
    return messages.slice(-50)
  }

  return messages.slice(index + 1)
}
