'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import { ProductWithSeller } from '@/lib/types/product'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n'
import { formatVeryPrice } from '@/lib/utils/format'

interface PurchaseStepQuantityProps {
  product: ProductWithSeller
  quantity: number
  onNext: (quantity: number) => void
  onCancel: () => void
}

export function PurchaseStepQuantity({
  product,
  quantity: initialQuantity,
  onNext,
  onCancel,
}: PurchaseStepQuantityProps) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(initialQuantity)
  const maxQuantity = parseInt(String(product.inventory)) || 10
  // Convert from wei to VERY (18 decimals)
  const priceInVery = parseFloat(product.priceVery) / 1e18
  const totalPrice = priceInVery * quantity

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const handleIncrease = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1)
  }

  return (
    <div className="space-y-6">
      {/* Product Info */}
      <div className="flex gap-3">
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
          <h3 className="text-sm font-medium text-foreground">{product.title}</h3>
          {product.descriptionKo && (
            <p className="text-xs text-muted-foreground line-clamp-2">{product.descriptionKo}</p>
          )}
          <p className="text-base font-bold text-coral mt-1">
            {formatVeryPrice(product.priceVery)} VERY
          </p>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">{t('order.quantity')}</label>
          <span className="text-xs text-muted-foreground">
            {t('product.stockCount', { count: maxQuantity })}
          </span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={handleDecrease}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={handleIncrease}
            disabled={quantity >= maxQuantity}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center py-4 border-t border-border">
        <span className="text-muted-foreground">{t('order.totalAmount')}</span>
        <span className="text-xl font-bold text-coral">
          {totalPrice.toFixed(4)} VERY
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          {t('common.cancel')}
        </Button>
        <Button
          onClick={() => onNext(quantity)}
          className="flex-1 bg-coral hover:bg-coral/90"
        >
          {t('common.next')}
        </Button>
      </div>
    </div>
  )
}
