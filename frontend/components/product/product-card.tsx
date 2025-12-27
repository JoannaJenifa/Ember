'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductWithSeller } from '@/lib/types/product'
import { useTranslation } from '@/lib/i18n'

interface ProductCardProps {
  product: ProductWithSeller
  onBuy?: () => void
  showSeller?: boolean
  className?: string
}

export function ProductCard({ product, onBuy, showSeller = true, className }: ProductCardProps) {
  const { t } = useTranslation()

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('ko-KR').format(numPrice)
  }

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'h-3 w-3',
              star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'
            )}
          />
        ))}
        {(product.reviewCount ?? 0) > 0 && (
          <span className="text-xs text-muted-foreground ml-1">({product.reviewCount})</span>
        )}
      </div>
    )
  }

  return (
    <Card className={cn('bg-card border-border overflow-hidden group', className)}>
      {/* Image */}
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square relative overflow-hidden">
          {product.images?.[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">{t('product.images')}</span>
            </div>
          )}
          {product.inventory === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              {t('order.soldOut')}
            </Badge>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-medium text-foreground line-clamp-2 hover:text-coral transition-colors">
            {product.titleKo || product.title}
          </h3>
        </Link>

        {/* Rating */}
        {renderStars(product.rating ?? 0)}

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-coral">{formatPrice(product.priceVery)}</span>
          <span className="text-sm text-muted-foreground">VERY</span>
        </div>

        {/* Seller */}
        {showSeller && product.seller && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Store className="h-3 w-3" />
            <span className="truncate">{product.seller.shopNameKo || product.seller.shopName}</span>
            {product.seller.kycVerified && (
              <Badge variant="secondary" className="text-xs py-0 px-1">
                {t('common.verified')}
              </Badge>
            )}
          </div>
        )}

        {/* Buy Button */}
        <Button
          className="w-full bg-coral hover:bg-coral/90 text-white"
          size="sm"
          disabled={product.inventory === 0}
          onClick={(e) => {
            e.preventDefault()
            onBuy?.()
          }}
        >
          {product.inventory === 0 ? t('order.soldOut') : t('order.buyNow')}
        </Button>
      </div>
    </Card>
  )
}

interface ProductGridProps {
  products: ProductWithSeller[]
  loading?: boolean
  emptyMessage?: string
  onBuy?: (product: ProductWithSeller) => void
}

export function ProductGrid({ products, loading, emptyMessage, onBuy }: ProductGridProps) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage || t('categories.noProducts')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onBuy={() => onBuy?.(product)} />
      ))}
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 bg-muted rounded animate-pulse" />
      </div>
    </Card>
  )
}
