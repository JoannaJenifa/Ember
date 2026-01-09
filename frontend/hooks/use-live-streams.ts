'use client'

export interface StreamWithSeller {
  id: string
  seller_address: string
  title: string
  description?: string
  thumbnail_url?: string
  stream_url?: string
  status: 'scheduled' | 'live' | 'ended'
  scheduled_start?: string
  started_at?: string
  ended_at?: string
  viewer_count: number
  category?: string
  seller?: {
    address: string
    shop_name: string
    is_verified: boolean
  } | null
}

// TODO: Implement real data fetching from on-chain/indexer
export function useLiveStreams(_category?: string) {
  // Return empty data until real integration
  return {
    streams: [] as StreamWithSeller[],
    isLoading: false,
    error: null,
    mutate: () => Promise.resolve(undefined),
  }
}

export function useUpcomingStreams(_hours = 24) {
  // Return empty data until real integration
  return {
    streams: [] as StreamWithSeller[],
    isLoading: false,
    error: null,
    mutate: () => Promise.resolve(undefined),
  }
}

export function useReplays(_options?: { category?: string; sort?: 'popular' | 'latest'; limit?: number }) {
  // Return empty data until real integration
  return {
    streams: [] as StreamWithSeller[],
    isLoading: false,
    error: null,
    mutate: () => Promise.resolve(undefined),
  }
}
