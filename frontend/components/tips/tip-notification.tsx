'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n'

interface TipNotificationProps {
  amount: string
  message?: string
  senderName?: string
  senderAddress?: string
  onClose?: () => void
  duration?: number
}

function formatAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function TipNotification({
  amount,
  message,
  senderName,
  senderAddress,
  onClose,
  duration = 5000,
}: TipNotificationProps) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(true)

  const displayName = senderName || (senderAddress ? formatAddress(senderAddress) : 'Someone')

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={cn(
            'fixed top-20 left-1/2 -translate-x-1/2 z-50',
            'p-4 rounded-xl shadow-2xl',
            'bg-gradient-to-r from-coral/90 to-coral/70',
            'border border-white/20 backdrop-blur-lg',
            'min-w-[280px] max-w-[400px]'
          )}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-coral to-coral/70 opacity-50 blur-xl -z-10" />

          <div className="flex flex-col items-center text-center gap-2">
            {/* Tip Icon */}
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: [0, -5, 5, 0], scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl"
            >
              💰
            </motion.div>

            {/* Amount */}
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-2xl font-bold text-white"
            >
              {amount} VERY
            </motion.div>

            {/* Sender */}
            <p className="text-sm text-white/90">
              {t('tips.receivedFrom', { sender: displayName, amount })}
            </p>

            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-2 px-4 py-2 rounded-lg bg-white/10 text-white/95"
              >
                &ldquo;{message}&rdquo;
              </motion.div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsVisible(false)
              onClose?.()
            }}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook to manage tip notifications queue
export function useTipNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    amount: string
    message?: string
    senderName?: string
    senderAddress?: string
  }>>([])

  const addNotification = (tip: {
    amount: string
    message?: string
    senderName?: string
    senderAddress?: string
  }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    setNotifications((prev) => [...prev, { ...tip, id }])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const currentNotification = notifications[0]

  return {
    currentNotification,
    addNotification,
    removeNotification: () => currentNotification && removeNotification(currentNotification.id),
  }
}
