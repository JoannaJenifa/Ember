'use client'

import { useState, useEffect, useCallback } from 'react'
import { StreamWithSeller } from '@/lib/types/stream'
import { getSeller } from '@/lib/ember/queries'
import { PRODUCT_CATEGORIES } from '@/lib/types/product'

interface SupabaseStream {
  id: string
  seller_address: string
  youtube_url: string
  featured_product_ids: number[]
  is_live: boolean
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export function useLiveStreams(category?: string) {
  const [streams, setStreams] = useState<StreamWithSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStreams = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/streams')
      const data = await res.json()

      if (!data.streams || data.streams.length === 0) {
        setStreams([])
        return
      }

      // Enrich streams with seller data from on-chain
      const enrichedStreams: StreamWithSeller[] = await Promise.all(
        data.streams.map(async (stream: SupabaseStream) => {
          const seller = await getSeller(stream.seller_address)
          return {
            id: stream.id,
            seller_id: stream.seller_address,
            title: seller?.shopName ? `${seller.shopName}'s Live` : 'Live Stream',
            status: 'live' as const,
            started_at: stream.started_at,
            youtube_url: stream.youtube_url,
            viewer_count: Math.floor(Math.random() * 500) + 50, // Simulated for now
            created_at: stream.created_at,
            updated_at: stream.created_at,
            seller: seller ? {
              id: stream.seller_address,
              wallet_address: stream.seller_address,
              shop_name: seller.shopName,
              profile_image: seller.profileImage,
              is_verified: seller.isVerified,
              total_sales: Number(seller.totalSales),
              total_orders: Number(seller.totalOrders),
              created_at: stream.created_at,
            } : null,
            category: seller?.category !== undefined ? PRODUCT_CATEGORIES[seller.category] : undefined,
          }
        })
      )

      setStreams(enrichedStreams)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch streams'))
    } finally {
      setIsLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchStreams()
  }, [fetchStreams])

  return {
    streams,
    isLoading,
    error,
    mutate: fetchStreams,
  }
}

export function useUpcomingStreams(hours = 24) {
  const [streams, setStreams] = useState<StreamWithSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStreams = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: Fetch from API when stream backend is implemented
      setStreams([])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch streams'))
    } finally {
      setIsLoading(false)
    }
  }, [hours])

  useEffect(() => {
    fetchStreams()
  }, [fetchStreams])

  return {
    streams,
    isLoading,
    error,
    mutate: fetchStreams,
  }
}

export function useReplays(options?: { category?: string; sort?: 'popular' | 'latest'; limit?: number }) {
  const [streams, setStreams] = useState<StreamWithSeller[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStreams = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: Fetch from API when stream backend is implemented
      setStreams([])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch streams'))
    } finally {
      setIsLoading(false)
    }
  }, [options?.category, options?.sort, options?.limit])

  useEffect(() => {
    fetchStreams()
  }, [fetchStreams])

  return {
    streams,
    isLoading,
    error,
    mutate: fetchStreams,
  }
}
