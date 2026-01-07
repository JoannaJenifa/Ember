'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { getProductReviews, getProductRating, Review } from '@/lib/ember/review-queries';
import { hasDeliveredOrder } from '@/lib/ember/order-queries';
import { ReviewForm } from './review-form';

interface ReviewSectionProps {
  productId: number;
  sellerAddress: string;
}

export function ReviewSection({ productId, sellerAddress }: ReviewSectionProps) {
  const { t } = useTranslation();
  const { account, connected } = useWallet();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState({ avgRating: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const [reviewsData, ratingData] = await Promise.all([
          getProductReviews(productId),
          getProductRating(productId),
        ]);
        setReviews(reviewsData);
        setRating(ratingData);
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    async function checkCanReview() {
      if (!account?.address || !connected) {
        setCanReview(false);
        return;
      }
      try {
        const hasOrder = await hasDeliveredOrder(account.address, productId);
        setCanReview(hasOrder);
      } catch {
        setCanReview(false);
      }
    }
    checkCanReview();
  }, [account?.address, connected, productId]);

  const formatAddress = (address: string) => {
    if (!address) return 'Anonymous';
    return address.slice(0, 6) + '...' + address.slice(-4);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const iconClass = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              iconClass,
              star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'
            )}
          />
        ))}
      </div>
    );
  };

  const handleReviewSubmitted = async () => {
    const [reviewsData, ratingData] = await Promise.all([
      getProductReviews(productId),
      getProductRating(productId),
    ]);
    setReviews(reviewsData);
    setRating(ratingData);
    setCanReview(false);
  };

  if (loading) {
    return (
      <section className="mt-12">
        <Skeleton className="h-8 w-32 mb-6" />
        <Skeleton className="h-24 w-full mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-foreground mb-6">{t('review.reviews')}</h2>

      {/* Summary */}
      <Card className="bg-card border-border p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{rating.avgRating.toFixed(1)}</p>
            {renderStars(rating.avgRating, 'lg')}
          </div>
          <div className="flex-1">
            <p className="text-muted-foreground">{t('review.totalReviews', { count: rating.count })}</p>
          </div>
        </div>
      </Card>

      {canReview && (
        <ReviewForm
          productId={productId}
          sellerAddress={sellerAddress}
          onSuccess={handleReviewSubmitted}
        />
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">{t('review.noReviews')}</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-card border-border p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-ember/10 text-ember">
                    {review.reviewer?.slice(2, 4).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">{formatAddress(review.reviewer)}</span>
                    {review.isVerified && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {t('review.verified')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.content && <p className="mt-2 text-foreground">{review.content}</p>}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
