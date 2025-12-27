'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/loader'
import { StarRatingInput } from './star-rating-input'
import { PhotoUpload } from './photo-upload'
import type { LabangProduct, LabangOrder } from '@/lib/db/supabase'
import { useTranslation, type Locale } from '@/lib/i18n'
import { getDemoReview } from '@/lib/demo/templates'

interface ReviewFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: LabangProduct
  order: LabangOrder
  onSubmit: (data: { rating: number; content: string; photos: File[] }) => Promise<void>
}

export function ReviewForm({ open, onOpenChange, product, order, onSubmit }: ReviewFormProps) {
  const { t, locale } = useTranslation()
  // Get random demo review data for faster demos
  const demoReview = useMemo(() => getDemoReview(locale as Locale), [])
  const [rating, setRating] = useState(demoReview.rating)
  const [content, setContent] = useState(demoReview.content)
  const [photos, setPhotos] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (rating === 0) {
      setError(t('review.selectRating'))
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await onSubmit({ rating, content, photos })
      // Reset form
      setRating(0)
      setContent('')
      setPhotos([])
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('review.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('review.writeReview')}</DialogTitle>
          <DialogDescription>{t('review.reviewDesc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Product info */}
          <div className="flex items-center gap-3">
            {product.images && product.images[0] && (
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{product.title}</p>
              <p className="text-sm text-muted-foreground">{t('review.orderNumber')}: {order.id.slice(0, 8)}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('review.rating')}</p>
            <div className="flex justify-center py-2">
              <StarRatingInput rating={rating} onChange={setRating} disabled={submitting} />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {t('review.content')} <span className="text-muted-foreground font-normal">{t('review.contentOptional')}</span>
            </p>
            <Textarea
              value={content}
              onChange={e => setContent(e.target.value.slice(0, 500))}
              placeholder={t('review.contentPlaceholder')}
              rows={4}
              disabled={submitting}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{content.length}/500</p>
          </div>

          {/* Photos */}
          <PhotoUpload photos={photos} onChange={setPhotos} maxPhotos={3} disabled={submitting} />

          {/* Error */}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} disabled={submitting} className="flex-1">
            {t('review.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="flex-1 bg-coral hover:bg-coral/90"
          >
            {submitting ? <Spinner size="sm" /> : t('review.submit')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
