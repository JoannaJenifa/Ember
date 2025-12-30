'use client';

import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { submitReview } from '@/lib/ember/review-transactions';
import { getBuyerOrdersFull, Order, OrderStatus } from '@/lib/ember/order-queries';
import { hasReviewedOrder } from '@/lib/ember/review-queries';
import { toast } from 'sonner';
import { getDemoReview } from '@/lib/demo/templates';

interface ReviewFormProps {
  productId: number;
  sellerAddress: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, sellerAddress, onSuccess }: ReviewFormProps) {
  const { t } = useTranslation();
  const { account, signAndSubmitTransaction, connected } = useWallet();

  // Random demo data for variation during demos
  const demoReview = useMemo(() => getDemoReview(), []);

  const [rating, setRating] = useState(demoReview.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(demoReview.content);
  const [loading, setLoading] = useState(false);
  const [eligibleOrderId, setEligibleOrderId] = useState<number | null>(null);

  useEffect(() => {
    async function findEligibleOrder() {
      if (!account?.address || !connected) return;

      try {
        const orders = await getBuyerOrdersFull(account.address);
        for (const order of orders) {
          if (
            order.productId === productId &&
            order.status === OrderStatus.Delivered
          ) {
            const alreadyReviewed = await hasReviewedOrder(order.id);
            if (!alreadyReviewed) {
              setEligibleOrderId(order.id);
              return;
            }
          }
        }
      } catch (err) {
        console.error('Failed to find eligible order:', err);
      }
    }
    findEligibleOrder();
  }, [account?.address, connected, productId]);

  const handleSubmit = async () => {
    if (!account?.address || !connected || eligibleOrderId === null) return;

    setLoading(true);
    try {
      await submitReview(
        account.address,
        eligibleOrderId,
        rating,
        content,
        {
          isPrivy: false,
          signAndSubmitTransaction,
        }
      );
      toast.success(t('review.submitSuccess'));
      setContent('');
      setRating(5);
      onSuccess?.();
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      toast.error(err.message || t('review.submitFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (eligibleOrderId === null) {
    return null;
  }

  return (
    <Card className="bg-card border-border p-6 mb-6">
      <h3 className="font-semibold text-foreground mb-4">{t('review.writeReview')}</h3>

      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">{t('review.rating')}</Label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    star <= (hoverRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-muted-foreground'
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="review-content">{t('review.content')}</Label>
          <Textarea
            id="review-content"
            placeholder={t('review.contentPlaceholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="mt-2"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !connected}
          className="w-full bg-ember hover:bg-ember/90"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t('common.processing')}
            </>
          ) : (
            t('review.submit')
          )}
        </Button>
      </div>
    </Card>
  );
}
