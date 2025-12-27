'use client'

import { memo } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatVeryPrice } from '@/lib/utils/format'
import type { ProductWithSeller } from '@/lib/types/product'
import { useTranslation } from '@/lib/i18n'

interface ProductSidebarProps {
  products: ProductWithSeller[]
  onProductClick?: (product: ProductWithSeller) => void
  onQuickBuy?: (product: ProductWithSeller) => void
  className?: string
}

export function ProductSidebar({
  products,
  onProductClick,
  onQuickBuy,
  className,
}: ProductSidebarProps) {
  const { t } = useTranslation()

  if (products.length === 0) {
    return (
      <Card className={cn('bg-card border-border p-4', className)}>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingBag className="h-5 w-5 text-coral" />
          <h2 className="font-semibold">{t('stream.products')}</h2>
        </div>
        <div className="text-center py-8 text-muted-foreground text-sm">
          {t('stream.noProductsToFeature')}
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('bg-card border-border p-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="h-5 w-5 text-coral" />
        <h2 className="font-semibold">{t('stream.products')}</h2>
        <Badge variant="secondary" className="ml-auto">{products.length}</Badge>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {products.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            onClick={() => onProductClick?.(product)}
            onQuickBuy={() => onQuickBuy?.(product)}
          />
        ))}
      </div>
    </Card>
  )
}

interface ProductItemProps {
  product: ProductWithSeller
  onClick?: () => void
  onQuickBuy?: () => void
}

const ProductItem = memo(function ProductItem({ product, onClick, onQuickBuy }: ProductItemProps) {
  const { t } = useTranslation()

  const displayTitle = product.descriptionKo || product.title
  const inventoryNum = product.inventory ? Number(product.inventory) : 0
  const isFlashSale = false // TODO: add flash sale logic

  return (
    <div
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-5 w-5" />
          </div>
        )}
        {isFlashSale && (
          <div className="absolute top-0 left-0 bg-coral text-white text-[10px] px-1 rounded-br">
            <Zap className="h-2.5 w-2.5 inline" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-1">{displayTitle}</p>
        <p className="text-sm font-bold text-coral">
          {formatVeryPrice(product.priceVery)} <span className="text-xs font-normal">VERY</span>
        </p>
      </div>

      {/* Quick Buy */}
      <Button
        size="sm"
        variant="outline"
        className="shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          onQuickBuy?.()
        }}
        disabled={inventoryNum === 0}
      >
        {t('product.buyNow')}
      </Button>
    </div>
  )
})
