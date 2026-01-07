'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Review,
  getProductReviews,
  hasReviewedOrder,
  getProductRating,
} from '@/lib/ember/review-queries';
import { hasDeliveredOrder } from '@/lib/ember/order-queries';

interface UseProductReviewsReturn {
  reviews: Review[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useProductReviews(productId: number | null): UseProductReviewsReturn {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = useCallback(async () => {
    if (productId === null) {
      setReviews([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getProductReviews(productId);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}

interface UseCanReviewReturn {
  canReview: boolean;
  hasReviewed: boolean;
  loading: boolean;
}

/**
 * Check if a user can review an order
 * Must have delivered order and not already reviewed
 */
export function useCanReview(
  orderId: number | null,
  buyerAddress: string | null,
  productId: number | null
): UseCanReviewReturn {
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId === null || !buyerAddress || productId === null) {
      setCanReview(false);
      setHasReviewed(false);
      return;
    }

    const check = async () => {
      setLoading(true);
      try {
        const [reviewed, hasDelivered] = await Promise.all([
          hasReviewedOrder(orderId),
          hasDeliveredOrder(buyerAddress, productId),
        ]);
        setHasReviewed(reviewed);
        setCanReview(hasDelivered && !reviewed);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [orderId, buyerAddress, productId]);

  return { canReview, hasReviewed, loading };
}

interface UseProductRatingReturn {
  avgRating: number;
  reviewCount: number;
  loading: boolean;
}

export function useProductRating(productId: number | null): UseProductRatingReturn {
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId === null) {
      setAvgRating(0);
      setReviewCount(0);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      try {
        const { avgRating: avg, count } = await getProductRating(productId);
        setAvgRating(avg);
        setReviewCount(count);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [productId]);

  return { avgRating, reviewCount, loading };
}
