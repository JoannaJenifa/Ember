'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import type { ProductWithSeller } from '@/lib/types/product'
import { useTranslation } from '@/lib/i18n'
import { formatVeryPrice } from '@/lib/utils/format'

interface ProductQuickViewProps {
  product: ProductWithSeller | null
  open: boolean
  onClose: () => void
  onPurchase?: (product: ProductWithSeller, quantity: number) => void
}

export function ProductQuickView({ product, open, onClose, onPurchase }: ProductQuickViewProps) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const displayTitle = product.descriptionKo || product.title
  const displayDescription = product.description
  const inventory = product.inventory ? Number(product.inventory) : 0
  const maxQuantity = Math.min(inventory, 10)
  const priceInVery = product.priceVery ? Number(product.priceVery) / 1e18 : 0
  const totalPrice = priceInVery * quantity

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(maxQuantity, prev + delta)))
  }

  const handlePurchase = () => {
    // Parent will handle closing the sheet and opening purchase modal
    onPurchase?.(product, quantity)
    setQuantity(1)
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left">{displayTitle}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {/* Image Gallery */}
          {product.images && product.images.length > 0 && (
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={product.images[0]}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {displayDescription && (
            <p className="text-sm text-muted-foreground line-clamp-3">{displayDescription}</p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-coral">{formatVeryPrice(product.priceVery)}</span>
            <span className="text-sm text-muted-foreground">VERY</span>
          </div>

          {/* Stock */}
          {inventory <= 5 && inventory > 0 && (
            <Badge variant="secondary">{t('product.stockCount', { count: inventory })}</Badge>
          )}
          {inventory === 0 && (
            <Badge variant="destructive">{t('order.soldOut')}</Badge>
          )}

          {/* Quantity Selector */}
          {inventory > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">{t('order.quantity')}</span>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= maxQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Total */}
          {inventory > 0 && (
            <div className="flex items-center justify-between py-2 border-t">
              <span className="text-sm text-muted-foreground">{t('order.total')}</span>
              <span className="text-lg font-bold text-coral">
                {totalPrice.toFixed(4)} <span className="text-sm font-normal">VERY</span>
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-coral hover:bg-coral/90 text-white"
              onClick={handlePurchase}
              disabled={inventory === 0}
            >
              {t('product.buyNow')}
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/product/${product.id}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
