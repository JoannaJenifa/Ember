'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export type GiftAnimationType = 'heart' | 'star' | 'rocket' | 'crown' | 'default'

interface GiftAnimationProps {
  type: GiftAnimationType
  quantity: number
  onComplete?: () => void
  className?: string
}

const GIFT_CONFIGS: Record<GiftAnimationType, {
  emoji: string
  color: string
  particleCount: number
}> = {
  heart: { emoji: '💕', color: 'text-pink-500', particleCount: 12 },
  star: { emoji: '⭐', color: 'text-amber-500', particleCount: 15 },
  rocket: { emoji: '🚀', color: 'text-coral', particleCount: 8 },
  crown: { emoji: '👑', color: 'text-yellow-500', particleCount: 10 },
  default: { emoji: '🎁', color: 'text-coral', particleCount: 10 },
}

// Single particle animation
function GiftParticle({
  emoji,
  index,
  type,
}: {
  emoji: string
  index: number
  type: GiftAnimationType
}) {
  const angle = (index / GIFT_CONFIGS[type].particleCount) * 360
  const distance = 150 + Math.random() * 100
  const delay = Math.random() * 0.3
  const duration = 1.5 + Math.random() * 0.5

  const x = Math.cos((angle * Math.PI) / 180) * distance
  const y = Math.sin((angle * Math.PI) / 180) * distance

  if (type === 'rocket') {
    // Rocket flies across the screen
    return (
      <motion.div
        className="absolute text-4xl pointer-events-none"
        initial={{ x: -100, y: 200, rotate: -45, opacity: 0 }}
        animate={{
          x: window.innerWidth + 100,
          y: -200,
          rotate: -45,
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 1.2,
          delay: delay * index,
          ease: 'easeOut',
        }}
      >
        {emoji}
      </motion.div>
    )
  }

  if (type === 'crown') {
    // Crown drops from top with shimmer
    return (
      <motion.div
        className="absolute text-3xl pointer-events-none"
        style={{ left: `${20 + index * 15}%` }}
        initial={{ y: -100, opacity: 0, scale: 0.5 }}
        animate={{
          y: [null, 100, 80],
          opacity: [0, 1, 1, 0],
          scale: [0.5, 1.2, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 2,
          delay: delay + index * 0.1,
          ease: 'easeOut',
        }}
      >
        <span className="animate-pulse">{emoji}</span>
      </motion.div>
    )
  }

  // Default floating animation (hearts, stars)
  return (
    <motion.div
      className="absolute text-2xl pointer-events-none"
      style={{ left: '50%', top: '50%' }}
      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
      animate={{
        x: [0, x * 0.3, x],
        y: [0, y * 0.3 - 50, y - 100],
        scale: [0, 1.2, 0.8],
        opacity: [0, 1, 0],
        rotate: Math.random() * 360,
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: 'easeOut',
      }}
    >
      {emoji}
    </motion.div>
  )
}

// Main center burst animation
function CenterBurst({ emoji, quantity }: { emoji: string; quantity: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1.3, 1],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: 1.5,
        ease: 'easeOut',
      }}
    >
      <span className="text-6xl">{emoji}</span>
      {quantity > 1 && (
        <motion.span
          className="text-2xl font-bold text-white mt-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          x{quantity}
        </motion.span>
      )}
    </motion.div>
  )
}

export function GiftAnimation({
  type,
  quantity,
  onComplete,
  className,
}: GiftAnimationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const config = GIFT_CONFIGS[type] || GIFT_CONFIGS.default

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete?.()
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 pointer-events-none overflow-hidden',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-coral/20 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 2 }}
          />

          {/* Center burst */}
          <CenterBurst emoji={config.emoji} quantity={quantity} />

          {/* Particles */}
          {Array.from({ length: config.particleCount }).map((_, i) => (
            <GiftParticle
              key={i}
              emoji={config.emoji}
              index={i}
              type={type}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Map gift ID to animation type
export function getGiftAnimationType(giftId: string | bigint): GiftAnimationType {
  const id = giftId.toString()
  switch (id) {
    case '1':
      return 'heart'
    case '2':
      return 'star'
    case '3':
      return 'rocket'
    case '4':
      return 'crown'
    default:
      return 'default'
  }
}
