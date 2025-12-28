'use client'

import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  amount: number
  currency?: 'KRW' | 'USDC'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceDisplay({
  amount,
  currency = 'USDC',
  size = 'md',
  className,
}: PriceDisplayProps) {
  // Format amount based on currency
  const formattedAmount = currency === 'USDC'
    ? amount.toFixed(2)
    : amount.toLocaleString()

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  const prefix = currency === 'USDC' ? '$' : '₩'

  return (
    <span className={cn('font-semibold text-ember', sizeClasses[size], className)}>
      {prefix}{formattedAmount}
    </span>
  )
}
