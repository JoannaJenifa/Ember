'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ProductWithSeller } from '@/lib/types/product';
import type { LabangStream, LabangSeller } from '@/lib/types/stream';

export interface StreamWithDetails extends LabangStream {
  seller?: LabangSeller | null;
  products?: ProductWithSeller[];
}

// Check if URL contains products parameter (indicates active stream)
function getProductsFromUrl(): string[] {
  if (typeof window === 'undefined') return [];
  const params = new URLSearchParams(window.location.search);
  const products = params.get('products');
  return products ? products.split(',') : [];
}

export function useStream(streamId: string | null) {
  const [stream, setStream] = useState<StreamWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
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
      // If streamId is a wallet address (0x...), create a live stream view
      if (streamId.startsWith('0x') && streamId.length === 66) {
        const productIds = getProductsFromUrl();
        // Mock stream data for live streams
        const mockStream: StreamWithDetails = {
          id: streamId,
          seller_id: streamId,
          title: 'Live Stream',
          title_ko: null,
          status: 'live',
          youtube_url: 'https://youtube.com/watch?v=jfKfPfyJRdk',
          viewer_count: 1,
          created_at: new Date().toISOString(),
          started_at: new Date().toISOString(),
          ended_at: null,
          seller: {
            id: streamId,
            wallet_address: streamId,
            shop_name: 'Live Seller',
            shop_name_ko: null,
            description: '',
            category: 0,
            kyc_verified: true,
            avatar: null,
            youtube_channel: '',
          },
          products: productIds.map((id, idx) => ({
            id,
            seller: { id: streamId, wallet: streamId, shopName: 'Live Seller' },
            title: `Product ${id}`,
            category: 'electronics',
            priceVery: '500000000',
            inventory: '100',
            metadataURI: '',
            isActive: true,
            createdAt: Date.now().toString(),
            totalSold: '0',
          })),
        };
        setStream(mockStream);
      } else {
        setStream(null);
        setError('Stream not found');
      }
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
