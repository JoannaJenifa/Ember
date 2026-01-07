'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Review, RatingDistribution } from '@/lib/types/review';

interface UseProductReviewsOptions {
  productId: string;
  limit?: number;
  initialSort?: 'latest' | 'rating';
}

interface ProductReviewsState {
  reviews: Review[];
  total: number;
  averageRating: number;
  distribution: RatingDistribution;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

export function useProductReviews({
  productId,
  limit = 20,
  initialSort = 'latest',
}: UseProductReviewsOptions) {
  const [state, setState] = useState<ProductReviewsState>({
    reviews: [],
    total: 0,
    averageRating: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    loading: true,
    error: null,
    hasMore: false,
  });
  const [sortBy, setSortBy] = useState(initialSort);

  const fetchReviews = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // TODO: Replace with on-chain query to ReviewRegistry
      // For now, return empty reviews
      setState({
        reviews: [],
        total: 0,
        averageRating: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        loading: false,
        error: null,
        hasMore: false,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch reviews',
      }));
    }
  }, [productId, limit]);

  const loadMore = useCallback(() => {
    // No-op for now
  }, []);

  const changeSort = useCallback((newSort: 'latest' | 'rating') => {
    setSortBy(newSort);
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    fetchReviews();
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, sortBy, loadMore, changeSort, refetch: fetchReviews };
}

export function useReviewSubmission() {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (): Promise<{ success: boolean; txHash?: string }> => {
    // TODO: Implement on-chain review submission
    setError('Review submission not yet implemented for Movement');
    return { success: false };
  }, []);

  return {
    submit,
    loading: uploading || saving,
    uploading,
    onchainLoading: false,
    saving,
    error,
  };
}

export function useOrderReviewStatus(orderId?: string) {
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Check on-chain if order can be reviewed
    setCanReview(false);
    setLoading(false);
  }, [orderId]);

  return { canReview, loading, error: null, refetch: () => {} };
}
