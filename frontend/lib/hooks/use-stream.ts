'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase, type LabangStream, type LabangSeller } from '@/lib/db/supabase'
import type { ProductWithSeller } from '@/lib/types/product'

export interface StreamWithDetails extends LabangStream {
  seller?: LabangSeller | null
  products?: ProductWithSeller[]
}

const PRODUCT_POLL_INTERVAL = 60000 // Poll products every 60 seconds (only when live)

export function useStream(streamId: string) {
  const [stream, setStream] = useState<StreamWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch products from API (subgraph + IPFS)
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/sell/streams/${streamId}/products`)
      if (!res.ok) return []

      const data = await res.json()
      const streamProducts = data.data || []

      return streamProducts
        .filter((sp: { product: ProductWithSeller | null }) => sp.product)
        .map((sp: { product: ProductWithSeller }) => sp.product)
    } catch (err) {
      console.error('Error fetching products:', err)
      return []
    }
  }, [streamId])

  // Initial fetch - parallel fetching for better performance
  useEffect(() => {
    const fetchStream = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch stream and products in PARALLEL (not waterfall)
        const [streamResult, products] = await Promise.all([
          supabase
            .from('labang_streams')
            .select('*, seller:labang_sellers(*)')
            .eq('id', streamId)
            .single(),
          fetchProducts(),
        ])

        if (streamResult.error || !streamResult.data) {
          setError('Stream not found')
          return
        }

        setStream({
          ...streamResult.data,
          seller: streamResult.data.seller,
          products,
        })
      } catch (err) {
        setError('Error loading stream')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (streamId) {
      fetchStream()
    }
  }, [streamId, fetchProducts])

  // Poll for product updates - only when stream is live
  useEffect(() => {
    // Only poll when stream is live to reduce unnecessary requests
    if (!streamId || !stream || stream.status !== 'live') return

    const interval = setInterval(async () => {
      const products = await fetchProducts()
      setStream((prev) => (prev ? { ...prev, products } : null))
    }, PRODUCT_POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [streamId, stream?.status, fetchProducts]) // Only depend on status, not entire stream object

  // Subscribe to viewer count updates
  useEffect(() => {
    if (!streamId) return

    const channel = supabase
      .channel(`viewer-count:${streamId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'labang_streams',
          filter: `id=eq.${streamId}`,
        },
        (payload) => {
          setStream((prev) =>
            prev ? { ...prev, viewer_count: payload.new.viewer_count } : null
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [streamId])

  return { stream, loading, error }
}
