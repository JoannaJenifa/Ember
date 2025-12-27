'use client';

import { useState, useEffect, useCallback } from 'react';
import { getStreamById, Stream } from '@/lib/supabase';
import { getSeller, Seller } from '@/lib/ember/queries';
import { getProduct, Product } from '@/lib/ember/product-queries';

export interface StreamWithDetails {
  id: string;
  seller_address: string;
  youtube_url: string;
  featured_product_ids: number[];
  is_live: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  // Enriched data from on-chain
  seller?: Seller | null;
  products?: Product[];
  // Compatibility fields
  status: 'live' | 'ended';
  title: string;
  viewer_count: number;
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
      // Fetch stream from Supabase
      const supabaseStream = await getStreamById(streamId);

      if (!supabaseStream) {
        setStream(null);
        setError('Stream not found');
        setLoading(false);
        return;
      }

      // Fetch seller data from on-chain
      const seller = await getSeller(supabaseStream.seller_address);

      // Fetch featured products from on-chain
      const products: Product[] = [];
      for (const productId of supabaseStream.featured_product_ids) {
        const product = await getProduct(productId);
        if (product) {
          products.push(product);
        }
      }

      const enrichedStream: StreamWithDetails = {
        ...supabaseStream,
        seller,
        products,
        status: supabaseStream.is_live ? 'live' : 'ended',
        title: seller?.shopName ? `${seller.shopName}'s Live` : 'Live Stream',
        viewer_count: 0, // TODO: Could track in Supabase if needed
      };

      setStream(enrichedStream);
    } catch (err) {
      console.error('Error loading stream:', err);
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
