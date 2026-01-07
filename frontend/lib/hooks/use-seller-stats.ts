'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SellerStats {
  liveStreamsCount: number;
  scheduledStreamsCount: number;
  endedStreamsCount: number;
  totalStreams: number;
  avgRating: number | null;
  totalReviews: number;
}

export interface UseSellerStatsReturn {
  stats: SellerStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Stub implementation - will be replaced with on-chain queries
export function useSellerStats(walletAddress: string | null | undefined): UseSellerStatsReturn {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!walletAddress) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with on-chain query to SellerRegistry
      // For now, return empty stats
      setStats({
        liveStreamsCount: 0,
        scheduledStreamsCount: 0,
        endedStreamsCount: 0,
        totalStreams: 0,
        avgRating: null,
        totalReviews: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch seller stats');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
