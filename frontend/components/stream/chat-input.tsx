'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface ChatInputProps {
  streamId: string
  userAddress?: string
  username?: string
  isConnected?: boolean
  onSend?: (message: string) => Promise<void>
  className?: string
}

export function ChatInput({
  streamId,
  userAddress,
  username,
  isConnected = false,
  onSend,
  className,
}: ChatInputProps) {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedMessage = message.trim()
    if (!trimmedMessage || !isConnected || isSending) return

    setIsSending(true)
    try {
      if (onSend) {
        await onSend(trimmedMessage)
      } else {
        // Default: POST to API
        await fetch(`/api/chat/${streamId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmedMessage,
            userAddress,
            username,
          }),
        })
      }
      setMessage('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  if (!isConnected) {
    return (
      <div className={cn('p-4 bg-muted/50 rounded-lg', className)}>
        <p className="text-sm text-muted-foreground text-center">
          {t('chat.connectToChat')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('chat.placeholder')}
        maxLength={200}
        disabled={isSending}
        className="flex-1"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isSending}
        className="shrink-0"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  )
}
