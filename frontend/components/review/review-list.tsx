'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/loader'
import { ReviewCard } from './review-card'
import { RatingDisplay } from './rating-display'
import { useTranslation } from '@/lib/i18n'
import type { LabangReview } from '@/lib/db/supabase'
import type { RatingDistribution } from '@/lib/types/review'

interface ReviewListProps {
  reviews: LabangReview[]
  averageRating: number
  totalCount: number
  distribution?: RatingDistribution
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onSortChange?: (sort: 'latest' | 'rating') => void
}

export function ReviewList({
  reviews,
  averageRating,
  totalCount,
  distribution,
  loading = false,
  hasMore = false,
  onLoadMore,
  onSortChange,
}: ReviewListProps) {
  const { t } = useTranslation()
  const [sortBy, setSortBy] = useState<'latest' | 'rating'>('latest')

  const handleSortChange = (value: 'latest' | 'rating') => {
    setSortBy(value)
    onSortChange?.(value)
  }

  return (
    <div className="space-y-6">
      {/* Rating summary */}
      <Card className="bg-card border-border p-6">
        <RatingDisplay
          averageRating={averageRating}
          totalCount={totalCount}
          distribution={distribution}
          variant="full"
        />
      </Card>

      {/* Sort controls */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {t('review.reviews')} <span className="text-foreground font-medium">{totalCount}</span>
        </p>
        <Select value={sortBy} onValueChange={handleSortChange as (value: string) => void}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">{t('sort.latest')}</SelectItem>
            <SelectItem value="rating">{t('review.rating')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('review.noReviews')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('review.beFirstReview')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onLoadMore} disabled={loading}>
            {loading ? <Spinner size="sm" /> : t('common.seeMore')}
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && reviews.length === 0 && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}
    </div>
  )
}
