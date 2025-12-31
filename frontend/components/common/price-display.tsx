'use client'

import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  amount: number
  currency?: 'KRW' | 'VERY'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceDisplay({
  amount,
  currency = 'KRW',
  size = 'md',
  className,
}: PriceDisplayProps) {
  const formattedAmount = amount.toLocaleString()

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  const prefix = currency === 'KRW' ? '₩' : ''
  const suffix = currency === 'VERY' ? ' VERY' : ''

  return (
    <span className={cn('font-semibold text-coral', sizeClasses[size], className)}>
      {prefix}{formattedAmount}{suffix}
    </span>
  )
}
