'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { useTranslation } from '@/lib/i18n'
import type { RatingDistribution } from '@/lib/types/review'

interface RatingDisplayProps {
  averageRating: number
  totalCount: number
  distribution?: RatingDistribution
  variant?: 'compact' | 'full'
  className?: string
}

export function RatingDisplay({
  averageRating,
  totalCount,
  distribution,
  variant = 'compact',
  className,
}: RatingDisplayProps) {
  const { t } = useTranslation()

  // Compact version for product cards
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <Star className="h-4 w-4 text-gold fill-gold" />
        <span className="font-medium text-foreground">{averageRating.toFixed(1)}</span>
        <span className="text-muted-foreground">({totalCount})</span>
      </div>
    )
  }

  // Full version for product page
  return (
    <div className={cn('space-y-4', className)}>
      {/* Average rating */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={cn(
                  'h-5 w-5',
                  star <= Math.round(averageRating)
                    ? 'text-gold fill-gold'
                    : 'text-muted-foreground'
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex-1">
          <p className="text-muted-foreground">
            {t('review.totalReviews', { count: totalCount })}
          </p>
        </div>
      </div>

      {/* Rating distribution bars */}
      {distribution && totalCount > 0 && (
        <div className="space-y-2">
          {([5, 4, 3, 2, 1] as const).map(rating => {
            const count = distribution[rating]
            const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0

            return (
              <div key={rating} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm text-muted-foreground">{rating}</span>
                  <Star className="h-3 w-3 text-gold fill-gold" />
                </div>
                <Progress value={percentage} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground w-10 text-right">
                  {Math.round(percentage)}%
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Stars display only (reusable)
interface StarsDisplayProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function StarsDisplay({
  rating,
  size = 'md',
  showValue = false,
  className,
}: StarsDisplayProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              star <= Math.round(rating) ? 'text-gold fill-gold' : 'text-muted-foreground'
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-muted-foreground">({rating.toFixed(1)})</span>
      )}
    </div>
  )
}
