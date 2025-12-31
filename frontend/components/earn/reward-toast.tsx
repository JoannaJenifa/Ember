'use client'

import { useEffect, useState } from 'react'
import { Coins } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RewardToastProps {
  amount: number
  reason: string
  visible: boolean
  onHide: () => void
}

export function RewardToast({
  amount,
  reason,
  visible,
  onHide,
}: RewardToastProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (visible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsAnimating(false)
        setTimeout(onHide, 300) // Wait for exit animation
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible, onHide])

  if (!visible && !isAnimating) return null

  return (
    <div
      className={cn(
        'fixed bottom-24 left-1/2 -translate-x-1/2 z-50',
        'bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg',
        'flex items-center gap-3 transition-all duration-300',
        isAnimating
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4'
      )}
    >
      <div className="relative">
        <Coins className="h-6 w-6 text-yellow-300" />
        <CoinSparkles />
      </div>
      <div>
        <p className="font-bold">+{amount} VERY</p>
        <p className="text-xs opacity-80">({reason})</p>
      </div>
    </div>
  )
}

function CoinSparkles() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(4)].map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s',
          }}
        />
      ))}
    </div>
  )
}

// Hook to manage multiple reward toasts
interface Reward {
  id: string
  amount: number
  reason: string
}

export function useRewardToasts() {
  const [toasts, setToasts] = useState<Reward[]>([])
  const [currentToast, setCurrentToast] = useState<Reward | null>(null)

  useEffect(() => {
    if (!currentToast && toasts.length > 0) {
      setCurrentToast(toasts[0])
      setToasts(prev => prev.slice(1))
    }
  }, [currentToast, toasts])

  const showReward = (amount: number, reason: string) => {
    setToasts(prev => [...prev, { id: Date.now().toString(), amount, reason }])
  }

  const hideCurrentToast = () => {
    setCurrentToast(null)
  }

  return {
    currentToast,
    hideCurrentToast,
    showReward,
  }
}
