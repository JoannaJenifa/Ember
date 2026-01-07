'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProductWithSeller } from '@/lib/types/product';

export interface LabangStream {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  status: 'scheduled' | 'live' | 'ended';
  scheduled_start: string;
  actual_start: string | null;
  actual_end: string | null;
  viewer_count: number;
  thumbnail_url: string | null;
  stream_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LabangSeller {
  id: string;
  wallet_address: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface StreamWithDetails extends LabangStream {
  seller?: LabangSeller | null;
  products?: ProductWithSeller[];
}

const PRODUCT_POLL_INTERVAL = 60000;

export function useStream(streamId: string) {
  const [stream, setStream] = useState<StreamWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/sell/streams/${streamId}/products`);
      if (!res.ok) return [];

      const data = await res.json();
      const streamProducts = data.data || [];

      return streamProducts
        .filter((sp: { product: ProductWithSeller | null }) => sp.product)
        .map((sp: { product: ProductWithSeller }) => sp.product);
    } catch (err) {
      console.error('Error fetching products:', err);
      return [];
    }
  }, [streamId]);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stream data from API
        const res = await fetch(`/api/streams/${streamId}`);
        if (!res.ok) {
          setError('Stream not found');
          return;
        }

        const streamData = await res.json();
        const products = await fetchProducts();

        setStream({
          ...streamData,
          products,
        });
      } catch (err) {
        setError('Error loading stream');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (streamId) {
      fetchStream();
    }
  }, [streamId, fetchProducts]);

  useEffect(() => {
    if (!streamId || !stream || stream.status !== 'live') return;

    const interval = setInterval(async () => {
      const products = await fetchProducts();
      setStream((prev) => (prev ? { ...prev, products } : null));
    }, PRODUCT_POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [streamId, stream?.status, fetchProducts]);

  return { stream, loading, error };
}
