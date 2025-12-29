'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/db/supabase'

export interface SellerStats {
  liveStreamsCount: number
  scheduledStreamsCount: number
  endedStreamsCount: number
  totalStreams: number
  avgRating: number | null
  totalReviews: number
}

export interface UseSellerStatsReturn {
  stats: SellerStats | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// Use wallet address to find seller and their stats
export function useSellerStats(walletAddress: string | null | undefined): UseSellerStatsReturn {
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    if (!walletAddress) {
      setStats(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // First, get seller_id from wallet address
      const { data: seller } = await supabase
        .from('labang_sellers')
        .select('id')
        .eq('wallet_address', walletAddress.toLowerCase())
        .single()

      if (!seller) {
        // Seller not found in Supabase, return zeros
        setStats({
          liveStreamsCount: 0,
          scheduledStreamsCount: 0,
          endedStreamsCount: 0,
          totalStreams: 0,
          avgRating: null,
          totalReviews: 0,
        })
        setIsLoading(false)
        return
      }

      const sellerId = seller.id

      // Fetch stream counts by status
      const [liveResult, scheduledResult, endedResult, reviewsResult] = await Promise.all([
        supabase
          .from('labang_streams')
          .select('id', { count: 'exact', head: true })
          .eq('seller_id', sellerId)
          .eq('status', 'live'),
        supabase
          .from('labang_streams')
          .select('id', { count: 'exact', head: true })
          .eq('seller_id', sellerId)
          .eq('status', 'scheduled'),
        supabase
          .from('labang_streams')
          .select('id', { count: 'exact', head: true })
          .eq('seller_id', sellerId)
          .eq('status', 'ended'),
        supabase
          .from('labang_reviews')
          .select('rating')
          .eq('seller_id', sellerId),
      ])

      if (liveResult.error) throw liveResult.error
      if (scheduledResult.error) throw scheduledResult.error
      if (endedResult.error) throw endedResult.error

      const liveCount = liveResult.count ?? 0
      const scheduledCount = scheduledResult.count ?? 0
      const endedCount = endedResult.count ?? 0

      // Calculate average rating
      let avgRating: number | null = null
      let totalReviews = 0
      if (!reviewsResult.error && reviewsResult.data) {
        totalReviews = reviewsResult.data.length
        if (totalReviews > 0) {
          const sum = reviewsResult.data.reduce((acc, r) => acc + (r.rating ?? 0), 0)
          avgRating = sum / totalReviews
        }
      }

      setStats({
        liveStreamsCount: liveCount,
        scheduledStreamsCount: scheduledCount,
        endedStreamsCount: endedCount,
        totalStreams: liveCount + scheduledCount + endedCount,
        avgRating,
        totalReviews,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch seller stats')
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  }
}
