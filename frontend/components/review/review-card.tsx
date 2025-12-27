'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, CheckCircle, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PhotoGallery } from './photo-gallery'
import { useTranslation } from '@/lib/i18n'
import type { LabangReview } from '@/lib/db/supabase'
import type { Review } from '@/lib/types/review'

interface ReviewCardProps {
  review: Review | LabangReview
  showProduct?: boolean
}

export function ReviewCard({ review, showProduct = false }: ReviewCardProps) {
  const { t } = useTranslation()
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  // Normalize review data
  const buyerAddress = 'buyerAddress' in review ? review.buyerAddress : review.buyer_address
  const isVerified = 'isVerified' in review ? review.isVerified : review.is_verified
  const createdAt = 'createdAt' in review ? review.createdAt : new Date(review.created_at ?? '')
  const photos = 'photos' in review && Array.isArray(review.photos) ? review.photos : []

  const formatAddress = (address: string | null) => {
    if (!address) return 'Anonymous'
    return address.slice(0, 6) + '...' + address.slice(-4)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index)
    setGalleryOpen(true)
  }

  return (
    <>
      <Card className="bg-card border-border p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-coral/10 text-coral">
              {buyerAddress?.slice(2, 4).toUpperCase() || '??'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground">{formatAddress(buyerAddress)}</span>
              {isVerified && (
                <>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <CheckCircle className="h-3 w-3" />
                    {t('review.verified')}
                  </Badge>
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <ShieldCheck className="h-3 w-3" />
                    {t('common.verified')}
                  </Badge>
                </>
              )}
            </div>

            {/* Rating & Date */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={cn(
                      'h-4 w-4',
                      star <= (review.rating ?? 0)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-muted-foreground'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(createdAt)}</span>
            </div>

            {/* Content */}
            {review.content && <p className="mt-2 text-foreground">{review.content}</p>}

            {/* Photos */}
            {photos.length > 0 && (
              <div className="flex gap-2 mt-3">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => handlePhotoClick(index)}
                    className="w-16 h-16 rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Photo gallery modal */}
      <PhotoGallery
        open={galleryOpen}
        onOpenChange={setGalleryOpen}
        photos={photos}
        initialIndex={selectedPhotoIndex}
      />
    </>
  )
}
