'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, Radio, ShieldCheck, Package, Store } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { getSeller, isVerifiedSeller, Seller } from '@/lib/ember/queries';
import { getSellerProductsFull, Product } from '@/lib/ember/product-queries';
import { ProductCard } from '@/app/products/components/product-card';

interface SellerPageProps {
  params: Promise<{ sellerId: string }>;
}

const CATEGORY_LABELS: Record<number, string> = {
  0: 'Fashion',
  1: 'Beauty',
  2: 'Food',
  3: 'Electronics',
  4: 'Home',
  5: 'Sports',
};

export default function SellerPage({ params }: SellerPageProps) {
  const { t } = useTranslation();
  const { sellerId } = use(params);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeller() {
      try {
        const [sellerData, verified] = await Promise.all([
          getSeller(sellerId),
          isVerifiedSeller(sellerId),
        ]);

        if (!sellerData) {
          setError(t('errors.notFound'));
          return;
        }

        setSeller(sellerData);
        setIsVerified(verified);

        const productsData = await getSellerProductsFull(sellerId);
        setProducts(productsData.filter((p) => p.isActive));
      } catch (err) {
        setError(t('errors.loadFailed'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchSeller();
  }, [sellerId, t]);

  const avgRating = seller && seller.ratingCount > 0
    ? (seller.ratingSum / seller.ratingCount).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background">
        <Skeleton className="h-32 w-full" />
        <div className="max-w-4xl mx-auto px-6 -mt-12">
          <div className="flex items-end gap-4 mb-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">{error || t('errors.notFound')}</p>
          <p className="text-muted-foreground">Seller not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      {/* Banner */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-coral/30 to-coral/10" />

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 mb-8">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-coral/10 border-4 border-background flex items-center justify-center">
              <Store className="h-12 w-12 text-coral" />
            </div>
          </div>

          <div className="flex-1 pt-16 md:pt-20">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold">{seller.shopName}</h1>
              {isVerified && (
                <Badge className="bg-green-500 text-white gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  {t('seller.verified')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="text-coral">{CATEGORY_LABELS[seller.category] || 'General'}</span>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{avgRating ?? t('product.new')}</span>
                {seller.ratingCount > 0 && <span>({seller.ratingCount})</span>}
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                <span>{seller.totalOrders} {t('seller.orders')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        {seller.description && (
          <Card className="p-6 bg-card border-border mb-8">
            <h2 className="font-semibold mb-2">{t('seller.description')}</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{seller.description}</p>
          </Card>
        )}

        {/* Products Grid */}
        <section className="pb-12">
          <h2 className="text-xl font-bold mb-4">{t('seller.products')}</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-card border-border">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t('product.noProducts')}</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
