'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Package } from 'lucide-react';
import { Product } from '@/lib/ember/product-queries';
import { useTranslation } from '@/lib/i18n';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { t } = useTranslation();

  const avgRating = product.ratingCount > 0
    ? (product.ratingSum / product.ratingCount).toFixed(1)
    : null;

  // USDC uses 6 decimals
  const formatPrice = (price: number) => {
    return (price / 1e6).toFixed(2);
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="overflow-hidden hover:shadow-lg hover:border-ember/50 transition-all cursor-pointer h-full bg-card border-border">
        <div className="aspect-square relative bg-muted">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.title}
              className="object-cover w-full h-full"
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
          {product.inventory > 0 && product.inventory < 10 && (
            <Badge className="absolute top-2 right-2 bg-orange-500">
              {t('product.lowStock')}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold truncate text-foreground mb-1">
            {product.title}
          </h3>
          <p className="text-lg font-bold text-ember">
            ${formatPrice(product.price)}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{avgRating ?? t('product.new')}</span>
            {product.ratingCount > 0 && (
              <span>({product.ratingCount})</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {product.totalSold} {t('seller.sold')}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
