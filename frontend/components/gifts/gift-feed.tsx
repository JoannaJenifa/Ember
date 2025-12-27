'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface GiftFeedItem {
  id: string
  senderName: string
  senderAddress: string
  giftName: string
  giftEmoji: string
  quantity: number
  timestamp: Date
}

interface GiftFeedProps {
  items: GiftFeedItem[]
  className?: string
  maxItems?: number
}

// Format address for display
function formatAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Individual gift message
function GiftMessage({ item }: { item: GiftFeedItem }) {
  const displayName = item.senderName || formatAddress(item.senderAddress)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex items-center gap-2 py-1.5 px-3 rounded-full',
        'bg-gradient-to-r from-coral/20 to-coral/10',
        'border border-coral/30 backdrop-blur-sm'
      )}
    >
      <span className="text-lg">{item.giftEmoji}</span>
      <span className="text-sm">
        <span className="font-medium text-coral">{displayName}</span>
        <span className="text-muted-foreground"> sent </span>
        <span className="font-medium text-foreground">
          {item.quantity > 1 ? `${item.quantity}x ` : ''}
          {item.giftName}
        </span>
      </span>
    </motion.div>
  )
}

export function GiftFeed({ items, className, maxItems = 5 }: GiftFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Only show most recent items
  const visibleItems = items.slice(-maxItems)

  // Auto-scroll to bottom when new items arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [items])

  if (visibleItems.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={cn(
        'flex flex-col gap-2 overflow-hidden',
        className
      )}
    >
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item) => (
          <GiftMessage key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Hook to manage gift feed state
export function useGiftFeed(maxItems = 50) {
  const [items, setItems] = useState<GiftFeedItem[]>([])

  const addGift = (gift: Omit<GiftFeedItem, 'id' | 'timestamp'>) => {
    const newItem: GiftFeedItem = {
      ...gift,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
    }

    setItems((prev) => {
      const updated = [...prev, newItem]
      // Keep only the last maxItems
      return updated.slice(-maxItems)
    })
  }

  const clearFeed = () => setItems([])

  return { items, addGift, clearFeed }
}

// Stacked gift indicator (shows when same user sends multiple gifts)
interface StackedGiftProps {
  giftEmoji: string
  count: number
  senderName: string
}

export function StackedGiftIndicator({ giftEmoji, count, senderName }: StackedGiftProps) {
  return (
    <motion.div
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'bg-coral/20 border border-coral/40'
      )}
    >
      <span className="text-xl">{giftEmoji}</span>
      <span className="text-coral font-bold">x{count}</span>
      <span className="text-xs text-muted-foreground">from {senderName}</span>
    </motion.div>
  )
}
