'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProductWithSeller } from '@/lib/types/product';
import type { LabangStream, LabangSeller } from '@/lib/types/stream';

export interface StreamWithDetails extends LabangStream {
  seller?: LabangSeller | null;
  products?: ProductWithSeller[];
}

// TODO: Replace with real API/indexer integration when stream backend is available

export function useStream(streamId: string | null) {
  const [stream, setStream] = useState<StreamWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStream = useCallback(async () => {
    if (!streamId) {
      setStream(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Fetch from API when stream backend is implemented
      // const res = await fetch(`/api/streams/${streamId}`)
      // if (!res.ok) throw new Error('Stream not found')
      // const data = await res.json()
      // setStream(data)
      setStream(null);
      setError('Stream not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading stream');
    } finally {
      setLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    fetchStream();
  }, [fetchStream]);

  return { stream, loading, error, refetch: fetchStream };
}
