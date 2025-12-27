'use client'

import { useEffect, useRef, useState, useCallback, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Gift, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from '@/lib/i18n'

export interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: Date
  type: 'message' | 'gift' | 'system'
  giftAmount?: number
}

interface StreamChatProps {
  streamId: string
  className?: string
}

const POLL_INTERVAL = 5000 // Poll every 5 seconds (reduced from 1s for performance)

export function StreamChat({ streamId, className }: StreamChatProps) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessageIdRef = useRef<string | undefined>(undefined)

  const fetchMessages = useCallback(async (since?: string) => {
    try {
      const url = since
        ? `/api/chat/${streamId}?since=${since}`
        : `/api/chat/${streamId}?limit=50`

      const res = await fetch(url)
      if (!res.ok) return

      const data = await res.json()
      const newMessages = (data.messages || []).map(mapApiToMessage)

      if (since && newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages])
        lastMessageIdRef.current = newMessages[newMessages.length - 1].id
      } else if (!since) {
        setMessages(newMessages)
        if (newMessages.length > 0) {
          lastMessageIdRef.current = newMessages[newMessages.length - 1].id
        }
      }

      setIsConnected(true)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setIsConnected(false)
    }
  }, [streamId])

  // Initial fetch
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Polling for new messages
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(lastMessageIdRef.current)
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchMessages])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className={cn('bg-card border-border flex flex-col', className)}>
      <div className="flex items-center gap-2 p-4 border-b">
        <MessageCircle className="h-5 w-5 text-coral" />
        <h2 className="font-semibold">{t('stream.chat')}</h2>
        {isConnected && (
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {t('live.liveNow')}
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            {t('chat.beFirst')}
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  )
}

const ChatMessageItem = memo(function ChatMessageItem({ message }: { message: ChatMessage }) {
  const { t } = useTranslation()

  if (message.type === 'system') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
        <Info className="h-3 w-3" />
        <span>{message.message}</span>
      </div>
    )
  }

  if (message.type === 'gift') {
    return (
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2">
        <div className="flex items-center gap-2 text-amber-500">
          <Gift className="h-4 w-4" />
          <span className="font-medium">{message.username}</span>
          <span className="text-xs">
            {t('tips.tip')} {message.giftAmount} VERY
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 text-sm">
      <span className="font-medium text-coral shrink-0">{message.username}</span>
      <span className="text-foreground break-words">{message.message}</span>
    </div>
  )
})

interface ApiMessage {
  id: string
  user_address: string
  username: string | null
  message: string
  type: 'message' | 'gift' | 'system'
  gift_amount: number | null
  created_at: string
}

function mapApiToMessage(row: ApiMessage): ChatMessage {
  return {
    id: row.id,
    userId: row.user_address,
    username: row.username || maskAddress(row.user_address),
    message: row.message,
    timestamp: new Date(row.created_at),
    type: row.type,
    giftAmount: row.gift_amount || undefined,
  }
}

function maskAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
