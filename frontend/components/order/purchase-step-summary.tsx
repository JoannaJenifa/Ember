'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ProductWithSeller } from '@/lib/types/product'
import { ShippingInfo } from '@/lib/types/order'
import { MapPin, User, Phone, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { formatVeryPrice } from '@/lib/utils/format'

interface PurchaseStepSummaryProps {
  product: ProductWithSeller
  quantity: number
  shipping: ShippingInfo
  onConfirm: () => void
  onBack: () => void
}

export function PurchaseStepSummary({
  product,
  quantity,
  shipping,
  onConfirm,
  onBack,
}: PurchaseStepSummaryProps) {
  const { t } = useTranslation()
  // Convert from wei to VERY (18 decimals)
  const priceInVery = parseFloat(product.priceVery) / 1e18
  const totalPrice = priceInVery * quantity

  return (
    <div className="space-y-6">
      {/* Product Summary */}
      <Card className="p-4 bg-card/50">
        <div className="flex gap-4">
          {product.images?.[0] && (
            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{product.title}</h3>
            <p className="text-sm text-muted-foreground">
              {formatVeryPrice(product.priceVery)} VERY × {quantity}
            </p>
          </div>
        </div>
      </Card>

      {/* Shipping Info */}
      <Card className="p-4 bg-card/50">
        <h4 className="font-medium text-foreground mb-3">{t('order.shippingInfo')}</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{shipping.name}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{shipping.phone}</span>
          </div>
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5" />
            <span>{shipping.address}</span>
          </div>
          {shipping.memo && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4 mt-0.5" />
              <span>{shipping.memo}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Total */}
      <div className="flex justify-between items-center py-4 border-t border-b border-border">
        <span className="font-medium text-foreground">{t('order.totalAmount')}</span>
        <span className="text-xl font-bold text-coral">
          {totalPrice.toFixed(4)} VERY
        </span>
      </div>

      {/* Notice */}
      <p className="text-xs text-muted-foreground">
        {t('order.confirmOrder')}
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t('common.back')}
        </Button>
        <Button
          onClick={onConfirm}
          className="flex-1 bg-coral hover:bg-coral/90"
        >
          {t('order.buyNow')}
        </Button>
      </div>
    </div>
  )
}
