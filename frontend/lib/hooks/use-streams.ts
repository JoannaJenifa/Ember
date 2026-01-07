'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface LabangStream {
  id: string;
  seller_id: string;
  title: string;
  title_ko?: string;
  description?: string;
  status: 'scheduled' | 'live' | 'ended';
  scheduled_at?: string;
  thumbnail?: string;
  youtube_url?: string;
  viewer_count: number;
  created_at: string;
  updated_at: string;
}

interface UseStreamsOptions {
  walletAddress?: string;
  status?: 'scheduled' | 'live' | 'ended';
  limit?: number;
  offset?: number;
}

export function useStreams(options: UseStreamsOptions = {}) {
  const [streams, setStreams] = useState<LabangStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fetchStreams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with on-chain/API query
      // For now, return empty streams
      setStreams([]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStreams();
  }, [options.walletAddress, options.status, fetchStreams]);

  const refetch = useCallback(() => {
    fetchStreams();
  }, [fetchStreams]);

  const deleteStream = useCallback(async (streamId: string) => {
    // TODO: Implement stream deletion
    return false;
  }, []);

  return { streams, loading, error, refetch, deleteStream };
}

export function useStream(streamId: string | null) {
  const [stream, setStream] = useState<LabangStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStream = useCallback(async () => {
    if (!streamId) {
      setStream(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with on-chain/API query
      setStream(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  return { stream, loading, error, refetch: fetchStream };
}
