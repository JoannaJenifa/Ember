'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Store, ArrowLeft, ShieldCheck, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { getProduct, Product } from '@/lib/ember/product-queries';
import { getSeller, Seller, isVerifiedSeller } from '@/lib/ember/queries';
import { ProductGallery } from '@/components/product/product-gallery';
import { PurchaseForm } from '../components/purchase-form';
import { ReviewSection } from '../components/review-section';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { t } = useTranslation();
  const { productId } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const productData = await getProduct(parseInt(productId));
        if (!productData) {
          setError(t('errors.notFound'));
          return;
        }
        setProduct(productData);

        // Fetch seller info
        const [sellerData, verified] = await Promise.all([
          getSeller(productData.seller),
          isVerifiedSeller(productData.seller),
        ]);
        setSeller(sellerData);
        setIsVerified(verified);
      } catch (err) {
        setError(t('errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [productId, t]);

  const formatPrice = (price: number) => (price / 1e8).toFixed(4);

  const avgRating = product && product.ratingCount > 0
    ? product.ratingSum / product.ratingCount
    : 0;

  const renderStars = (rating: number = 0) => (
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
  );

  if (loading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-destructive mb-4">{error || t('errors.notFound')}</p>
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.goBack')}
            </Button>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.goBack')}
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <ProductGallery images={product.imageUrl ? [product.imageUrl] : []} title={product.title} />

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">{product.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                {renderStars(avgRating)}
                <span className="text-muted-foreground">({product.ratingCount})</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-coral">{formatPrice(product.price)}</span>
              <span className="text-lg text-muted-foreground">MOVE</span>
            </div>

            {seller && (
              <Link href={`/seller/${product.seller}`}>
                <Card className="bg-card border-border p-4 hover:border-coral/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-coral/10 flex items-center justify-center">
                      <Store className="h-6 w-6 text-coral" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{seller.shopName}</p>
                        {isVerified && (
                          <Badge variant="secondary" className="gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            {t('seller.verified')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{seller.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            )}

            {product.description && (
              <div>
                <h2 className="font-semibold text-foreground mb-2">{t('product.description')}</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <PurchaseForm product={product} />
          </div>
        </div>

        <ReviewSection productId={product.id} sellerAddress={product.seller} />
      </div>
    </main>
  );
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
  );
}
