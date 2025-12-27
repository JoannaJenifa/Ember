'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, CheckCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LabangReview } from '@/lib/db/supabase'
import { useTranslation } from '@/lib/i18n'

interface ProductReviewsProps {
  reviews: LabangReview[]
  averageRating: number
  totalCount: number
}

export function ProductReviews({ reviews, averageRating, totalCount }: ProductReviewsProps) {
  const { t } = useTranslation()

  const formatAddress = (address: string) => {
    if (!address) return 'Anonymous'
    return address.slice(0, 6) + '...' + address.slice(-4)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const renderStars = (rating: number = 0, size: 'sm' | 'lg' = 'sm') => {
    const iconClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              iconClass,
              star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{averageRating.toFixed(1)}</p>
            {renderStars(averageRating, 'lg')}
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground">
              {t('review.totalReviews', { count: totalCount })}
            </p>
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t('review.noReviews')}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-card border-border p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-coral/10 text-coral">
                    {review.buyer_address?.slice(2, 4).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">
                      {formatAddress(review.buyer_address)}
                    </span>
                    {review.is_verified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {t('review.verified')}
                      </Badge>
                    )}
                  </div>

                  {/* Rating & Date */}
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating ?? 0)}
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </span>
                  </div>

                  {/* Content */}
                  {review.content && (
                    <p className="mt-2 text-foreground">{review.content}</p>
                  )}

                  {/* Photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.photos.map((photo, index) => (
                        <div
                          key={index}
                          className="w-16 h-16 rounded-lg overflow-hidden"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt={'Review photo ' + (index + 1)}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
