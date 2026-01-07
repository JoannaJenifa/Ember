'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Tip,
  getStreamerTips,
  getStreamerTotal,
  getRecentTips,
} from '@/lib/ember/tip-queries';

interface UseStreamerTipsReturn {
  tips: Tip[];
  total: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for streamer tips with polling (default 5s for live streams)
 */
export function useStreamerTips(
  streamerAddress: string | null,
  limit: number = 10,
  pollInterval: number = 5000
): UseStreamerTipsReturn {
  const [tips, setTips] = useState<Tip[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTips = useCallback(async () => {
    if (!streamerAddress) {
      setTips([]);
      setTotal(0);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [tipsData, totalData] = await Promise.all([
        getStreamerTips(streamerAddress, limit),
        getStreamerTotal(streamerAddress),
      ]);
      setTips(tipsData);
      setTotal(totalData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tips'));
    } finally {
      setLoading(false);
    }
  }, [streamerAddress, limit]);

  useEffect(() => {
    fetchTips();

    // Set up polling for real-time updates during streams
    if (streamerAddress && pollInterval > 0) {
      intervalRef.current = setInterval(fetchTips, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchTips, streamerAddress, pollInterval]);

  return { tips, total, loading, error, refetch: fetchTips };
}

interface UseRecentTipsReturn {
  tips: Tip[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for recent platform-wide tips
 */
export function useRecentTips(
  limit: number = 10,
  pollInterval: number = 10000
): UseRecentTipsReturn {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTips = useCallback(async () => {
    try {
      setError(null);
      const data = await getRecentTips(limit);
      setTips(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tips'));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTips();

    if (pollInterval > 0) {
      intervalRef.current = setInterval(fetchTips, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchTips, pollInterval]);

  return { tips, loading, error, refetch: fetchTips };
}
