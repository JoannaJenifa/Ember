'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Gift,
  getAllGiftPrices,
  getStreamerGifts,
  getStreamerEarnings,
  GIFT_NAMES,
  GIFT_EMOJIS,
} from '@/lib/ember/gift-queries';

interface GiftPrice {
  type: number;
  name: string;
  emoji: string;
  price: number;
}

interface UseGiftPricesReturn {
  prices: GiftPrice[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for gift prices - cached since prices rarely change
 */
export function useGiftPrices(): UseGiftPricesReturn {
  const [prices, setPrices] = useState<GiftPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);
      const rawPrices = await getAllGiftPrices();
      const formatted = rawPrices.map((price, i) => ({
        type: i,
        name: GIFT_NAMES[i] || `Gift ${i}`,
        emoji: GIFT_EMOJIS[i] || '🎁',
        price,
      }));
      setPrices(formatted);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gift prices'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return { prices, loading, error, refetch: fetchPrices };
}

interface UseStreamerGiftsReturn {
  gifts: Gift[];
  earnings: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for streamer gifts with polling (default 5s for live streams)
 */
export function useStreamerGifts(
  streamerAddress: string | null,
  limit: number = 10,
  pollInterval: number = 5000
): UseStreamerGiftsReturn {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchGifts = useCallback(async () => {
    if (!streamerAddress) {
      setGifts([]);
      setEarnings(0);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [giftsData, earningsData] = await Promise.all([
        getStreamerGifts(streamerAddress, limit),
        getStreamerEarnings(streamerAddress),
      ]);
      setGifts(giftsData);
      setEarnings(earningsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch gifts'));
    } finally {
      setLoading(false);
    }
  }, [streamerAddress, limit]);

  useEffect(() => {
    fetchGifts();

    // Set up polling for real-time updates during streams
    if (streamerAddress && pollInterval > 0) {
      intervalRef.current = setInterval(fetchGifts, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchGifts, streamerAddress, pollInterval]);

  return { gifts, earnings, loading, error, refetch: fetchGifts };
}

// Re-export constants for convenience
export { GIFT_NAMES, GIFT_EMOJIS };
