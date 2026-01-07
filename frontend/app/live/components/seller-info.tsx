'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Store, BadgeCheck, Star, ExternalLink, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSeller, useIsVerifiedSeller } from '@/hooks/use-seller';
import { useStreamerTips } from '@/hooks/use-tips';
import { useStreamerGifts } from '@/hooks/use-gifts';
import type { Seller } from '@/lib/ember/queries';

interface SellerInfoProps {
  sellerAddress: string;
  className?: string;
}

export function SellerInfo({ sellerAddress, className }: SellerInfoProps) {
  const { seller, loading: sellerLoading } = useSeller(sellerAddress);
  const { isVerified, loading: verifyLoading } = useIsVerifiedSeller(sellerAddress);
  const { total: tipsTotal, loading: tipsLoading } = useStreamerTips(sellerAddress, 1, 0);
  const { earnings: giftsTotal, loading: giftsLoading } = useStreamerGifts(sellerAddress, 1, 0);

  const loading = sellerLoading || verifyLoading;
  const earningsLoading = tipsLoading || giftsLoading;

  const formatEarnings = (amount: number) => (amount / 1e8).toFixed(2);
  const totalEarnings = tipsTotal + giftsTotal;

  const getRating = (seller: Seller): string => {
    if (seller.ratingCount === 0) return 'N/A';
    return (seller.ratingSum / seller.ratingCount).toFixed(1);
  };

  if (loading) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-8 w-full" />
      </Card>
    );
  }

  if (!seller) {
    return (
      <Card className={cn('p-4', className)}>
        <div className="text-center text-muted-foreground">
          <Store className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Seller not found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start gap-3 mb-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-ember to-orange-500 flex items-center justify-center">
          <Store className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{seller.shopName}</h3>
            {isVerified && (
              <BadgeCheck className="h-4 w-4 text-blue-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {seller.description || 'Live commerce seller'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-ember">
            {seller.totalOrders}
          </p>
          <p className="text-xs text-muted-foreground">Orders</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="h-3 w-3 text-yellow-500" />
            <span className="text-lg font-bold">{getRating(seller)}</span>
          </div>
          <p className="text-xs text-muted-foreground">Rating</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2 text-center">
          {earningsLoading ? (
            <Skeleton className="h-6 w-12 mx-auto mb-1" />
          ) : (
            <p className="text-lg font-bold text-green-500">
              {formatEarnings(totalEarnings)}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Earned</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1 mb-4">
        {isVerified && (
          <Badge variant="outline" className="text-xs">
            <BadgeCheck className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}
        {seller.totalOrders >= 100 && (
          <Badge variant="outline" className="text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Top Seller
          </Badge>
        )}
      </div>

      {/* Actions */}
      <Button variant="outline" className="w-full" asChild>
        <Link href={`/seller/${sellerAddress}`}>
          <Store className="h-4 w-4 mr-2" />
          Visit Shop
          <ExternalLink className="h-3 w-3 ml-2" />
        </Link>
      </Button>
    </Card>
  );
}
