'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package, Star } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { getActiveProducts, Product } from '@/lib/ember/product-queries';

export function FeaturedProducts() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getActiveProducts(8);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const formatPrice = (price: number) => (price / 1e8).toFixed(4);

  const getAvgRating = (product: Product) => {
    return product.ratingCount > 0
      ? (product.ratingSum / product.ratingCount).toFixed(1)
      : null;
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{t('home.featuredProducts')}</h2>
        <Link href="/products">
          <Button variant="ghost" className="text-ember hover:text-ember/80">
            {t('common.viewAll')}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-5 w-1/2 bg-muted rounded" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <Card className="overflow-hidden hover:border-ember/50 transition-colors cursor-pointer h-full bg-card border-border">
                <div className="aspect-square relative bg-muted">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  {product.inventory === 0 && (
                    <Badge className="absolute top-2 right-2 bg-destructive">
                      {t('order.soldOut')}
                    </Badge>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-foreground line-clamp-2 mb-1">{product.title}</h3>
                  <p className="text-lg font-bold text-ember">{formatPrice(product.price)} MOVE</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{getAvgRating(product) ?? t('product.new')}</span>
                    {product.ratingCount > 0 && <span>({product.ratingCount})</span>}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border p-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{t('categories.noProducts')}</h3>
          <p className="text-muted-foreground">{t('categories.noProductsDesc')}</p>
        </Card>
      )}
    </section>
  );
}
