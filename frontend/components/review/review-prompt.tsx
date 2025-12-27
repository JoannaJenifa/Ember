'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Gift } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'
import type { LabangProduct } from '@/lib/db/supabase'

interface ReviewPromptProps {
  product: LabangProduct
  onWriteReview: () => void
}

export function ReviewPrompt({ product, onWriteReview }: ReviewPromptProps) {
  const { t } = useTranslation()

  return (
    <Card className="bg-gradient-to-r from-coral/10 to-gold/10 border-coral/20 p-6">
      <div className="flex items-center gap-4">
        {/* Product image */}
        {product.images && product.images[0] && (
          <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-5 w-5 text-gold fill-gold" />
            <span className="font-semibold text-foreground">{t('review.writeReview')}</span>
          </div>

          <p className="text-sm text-muted-foreground truncate mb-2">{product.title}</p>

          <Badge variant="secondary" className="gap-1 bg-gold/10 text-gold border-gold/20">
            <Gift className="h-3 w-3" />5 VERY
          </Badge>
        </div>

        <Button onClick={onWriteReview} className="shrink-0 bg-coral hover:bg-coral/90">
          {t('order.writeReview')}
        </Button>
      </div>
    </Card>
  )
}
