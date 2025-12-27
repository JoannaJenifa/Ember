'use client'

import { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, MessageCircle, Gift, Info, Loader2 } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface ChatMessage {
  id: string
  user_address: string
  username: string | null
  message: string
  type: 'message' | 'gift' | 'system'
  gift_amount: number | null
  created_at: string
}

interface LiveChatProps {
  streamId: string
  sellerAddress?: string
}

const POLL_INTERVAL = 5000 // Poll every 5 seconds (reduced from 1s for performance)

function maskAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function LiveChat({ streamId, sellerAddress }: LiveChatProps) {
  const { t } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const lastMessageIdRef = useRef<string | undefined>(undefined)

  const fetchMessages = useCallback(async (since?: string) => {
    try {
      const url = since
        ? `/api/chat/${streamId}?since=${since}`
        : `/api/chat/${streamId}?limit=50`

      const res = await fetch(url)
      if (!res.ok) return

      const data = await res.json()
      const newMessages = data.messages || []

      if (since && newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages])
        lastMessageIdRef.current = newMessages[newMessages.length - 1].id
      } else if (!since) {
        setMessages(newMessages)
        if (newMessages.length > 0) {
          lastMessageIdRef.current = newMessages[newMessages.length - 1].id
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
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

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return

    setIsSending(true)
    try {
      const res = await fetch(`/api/chat/${streamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input.trim(),
          userAddress: sellerAddress || 'seller',
          username: t('common.seller'),
          type: 'message',
        }),
      })

      if (res.ok) {
        setInput('')
        // Immediately fetch to show the new message
        await fetchMessages(lastMessageIdRef.current)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="flex flex-col h-full bg-card border-border">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          {t('stream.chat')}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            {t('chat.noMessages')}
          </p>
        ) : (
          messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              sellerAddress={sellerAddress}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-3 border-t border-border">
        <div className="flex gap-2 w-full">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            className="flex-1 min-w-0 h-8 text-sm"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            className="h-8 w-8 shrink-0"
            disabled={!input.trim() || isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

const ChatMessageItem = memo(function ChatMessageItem({
  message,
  sellerAddress,
}: {
  message: ChatMessage
  sellerAddress?: string
}) {
  const { t } = useTranslation()
  // Only mark as seller if address matches or fallback 'seller' was used
  const isSeller =
    (sellerAddress && message.user_address.toLowerCase() === sellerAddress.toLowerCase()) ||
    message.user_address === 'seller'

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
        <div className="flex items-center gap-2 text-amber-500 text-xs">
          <Gift className="h-4 w-4" />
          <span className="font-medium">
            {message.username || maskAddress(message.user_address)}
          </span>
          <span>{t('tips.tip')} {message.gift_amount} VERY</span>
        </div>
      </div>
    )
  }

  return (
    <div className="text-xs">
      <span className={`font-medium ${isSeller ? 'text-coral' : 'text-primary'}`}>
        {isSeller
          ? t('common.seller')
          : message.username || maskAddress(message.user_address)}
      </span>
      <span className="text-muted-foreground">: </span>
      <span className="text-foreground">{message.message}</span>
    </div>
  )
})
