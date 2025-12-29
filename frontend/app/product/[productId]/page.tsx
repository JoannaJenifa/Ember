'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, Store, ArrowLeft, ShieldCheck } from 'lucide-react'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductReviews } from '@/components/product/product-reviews'
import { cn } from '@/lib/utils'
import type { ProductDetail } from '@/lib/types/product'
import { useTranslation } from '@/lib/i18n'

interface PageProps {
  params: Promise<{ productId: string }>
}

export default function ProductDetailPage({ params }: PageProps) {
  const { t } = useTranslation()
  const { productId } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch('/api/products/' + productId)
        if (!response.ok) throw new Error('Product not found')
        const data = await response.json()
        setProduct(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

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
              'h-4 w-4',
              star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'
            )}
          />
        ))}
      </div>
    )
  }

  if (loading) return <ProductDetailSkeleton />

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <p className="text-destructive mb-4">{error || t('errors.notFound')}</p>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.goBack')}
            </Button>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.goBack')}
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Gallery */}
          <ProductGallery images={product.images || []} title={product.title} />

          {/* Right: Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {product.titleKo || product.title}
              </h1>
              {product.titleKo && product.title !== product.titleKo && (
                <p className="text-muted-foreground">{product.title}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {renderStars(product.rating ?? 0)}
                <span className="text-muted-foreground">({product.reviewCount ?? 0})</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-coral">
                {formatPrice(product.priceVery)}
              </span>
              <span className="text-lg text-muted-foreground">VERY</span>
            </div>

            {/* Seller Info */}
            {product.seller && (
              <Card className="bg-card border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-coral/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-coral" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">
                        {product.seller.shopNameKo || product.seller.shopName}
                      </p>
                      {product.seller.kycVerified && (
                        <Badge variant="secondary" className="gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          {t('seller.verified')}
                        </Badge>
                      )}
                    </div>
                    {product.seller.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {product.seller.description}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Description */}
            {(product.descriptionKo || product.description) && (
              <div>
                <h2 className="font-semibold text-foreground mb-2">{t('product.description')}</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.descriptionKo || product.description}
                </p>
              </div>
            )}

            {/* Stock & Desktop Buy Button */}
            <div className="hidden md:block space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{t('product.stock')}:</span>
                <span className={product.inventory === 0 ? 'text-destructive' : 'text-foreground'}>
                  {product.inventory === 0 ? t('order.soldOut') : t('product.stockCount', { count: product.inventory })}
                </span>
              </div>
              <Button
                className="w-full bg-coral hover:bg-coral/90 h-12 text-lg"
                disabled={product.inventory === 0}
              >
                {product.inventory === 0 ? t('order.soldOut') : t('order.buyNow')}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12">
          <h2 className="text-xl font-bold text-foreground mb-6">{t('review.reviews')}</h2>
          <ProductReviews
            reviews={product.reviews || []}
            averageRating={product.rating ?? 0}
            totalCount={product.reviewCount ?? 0}
          />
        </section>
      </div>

      {/* Mobile Sticky Buy Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border md:hidden">
        <Button
          className="w-full bg-coral hover:bg-coral/90 h-12 text-lg"
          disabled={product.inventory === 0}
        >
          {product.inventory === 0 ? t('order.soldOut') : t('order.buyNow')}
        </Button>
      </div>
    </main>
  )
}

function ProductDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-24 mb-4" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    </main>
  )
}
