'use client';

import type { ProductWithSeller } from '@/lib/types/product';

export interface StreamWithDetails {
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
  seller?: {
    id: string;
    wallet_address: string;
    display_name: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  products?: ProductWithSeller[];
}

// TODO: Implement real data fetching from on-chain/indexer
export function useStream(_streamId: string) {
  // Return empty data until real integration
  return {
    stream: null as StreamWithDetails | null,
    loading: false,
    error: 'Stream not found',
  };
}
