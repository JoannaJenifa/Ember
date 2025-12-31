'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const halfFilled = !filled && i < rating

          return (
            <Star
              key={i}
              className={cn(
                sizeClasses[size],
                filled ? 'fill-gold text-gold' : halfFilled ? 'fill-gold/50 text-gold' : 'text-muted-foreground'
              )}
            />
          )
        })}
      </div>
      {showValue && (
        <span className={cn('text-muted-foreground', textSizeClasses[size])}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  )
}
