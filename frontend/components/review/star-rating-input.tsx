'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingInputProps {
  rating: number
  onChange: (rating: number) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export function StarRatingInput({
  rating,
  onChange,
  size = 'lg',
  disabled = false,
}: StarRatingInputProps) {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-7 w-7',
    lg: 'h-9 w-9',
  }

  const handleClick = (value: number) => {
    if (disabled) return
    // Toggle off if clicking the same star
    onChange(rating === value ? 0 : value)
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(value => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          disabled={disabled}
          className={cn(
            'transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral rounded',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'transition-colors',
              value <= rating ? 'text-gold fill-gold' : 'text-muted-foreground hover:text-gold/50'
            )}
          />
        </button>
      ))}
    </div>
  )
}
