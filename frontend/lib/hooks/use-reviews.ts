'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSubmitReview, generateContentHash, useCanReview } from '@/lib/web3/review-registry'
import { pinJSONToIPFS, pinFileToIPFS, getIPFSUrl } from '@/lib/web3/pinata'
import type { LabangReview, LabangOrder, LabangProduct } from '@/lib/db/supabase'
import type { RatingDistribution } from '@/lib/types/review'

interface UseProductReviewsOptions {
  productId: string
  limit?: number
  initialSort?: 'latest' | 'rating'
}

interface ProductReviewsState {
  reviews: LabangReview[]
  total: number
  averageRating: number
  distribution: RatingDistribution
  loading: boolean
  error: string | null
  hasMore: boolean
}

export function useProductReviews({ productId, limit = 20, initialSort = 'latest' }: UseProductReviewsOptions) {
  const [state, setState] = useState<ProductReviewsState>({
    reviews: [],
    total: 0,
    averageRating: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    loading: true,
    error: null,
    hasMore: false,
  })
  const [sortBy, setSortBy] = useState(initialSort)
  const [offset, setOffset] = useState(0)

  const fetchReviews = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams({
        productId,
        limit: limit.toString(),
        offset: currentOffset.toString(),
      })

      const response = await fetch(`/api/reviews?${params}`)
      const data = await response.json()

      if (!data.success) throw new Error(data.error)

      // Calculate distribution from reviews
      const dist: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      data.reviews.forEach((r: LabangReview) => {
        const rating = Math.round(r.rating ?? 0) as 1 | 2 | 3 | 4 | 5
        if (rating >= 1 && rating <= 5) dist[rating]++
      })

      setState(prev => ({
        ...prev,
        reviews: reset ? data.reviews : [...prev.reviews, ...data.reviews],
        total: data.total || data.reviews.length,
        averageRating: data.rating?.average ?? 0,
        distribution: dist,
        loading: false,
        hasMore: data.reviews.length === limit,
      }))

      if (reset) setOffset(limit)
      else setOffset(prev => prev + limit)
    } catch (err) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to fetch reviews',
      }))
    }
  }, [productId, limit, offset])

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchReviews(false)
    }
  }, [state.loading, state.hasMore, fetchReviews])

  const changeSort = useCallback((newSort: 'latest' | 'rating') => {
    setSortBy(newSort)
    setOffset(0)
    fetchReviews(true)
  }, [fetchReviews])

  useEffect(() => {
    fetchReviews(true)
  }, [productId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { ...state, sortBy, loadMore, changeSort, refetch: () => fetchReviews(true) }
}

interface SubmitReviewData {
  order: LabangOrder
  product: LabangProduct
  rating: number
  content: string
  photos: File[]
}

export function useReviewSubmission() {
  const { submitReview: submitOnchain, loading: onchainLoading, error: onchainError } = useSubmitReview()
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(async (data: SubmitReviewData): Promise<{ success: boolean; txHash?: string }> => {
    setError(null)

    try {
      // Step 1: Upload photos to IPFS
      setUploading(true)
      const photoUrls: string[] = []

      for (const photo of data.photos) {
        const result = await pinFileToIPFS(photo, photo.name, {
          pinataMetadata: { name: `review-photo-${Date.now()}` },
        })
        photoUrls.push(getIPFSUrl(result.IpfsHash))
      }
      setUploading(false)

      // Step 2: Create content hash (for on-chain storage)
      const contentHash = generateContentHash(data.content || 'review')

      // Step 3: Submit to blockchain
      const orderId = data.order.id as `0x${string}`
      if (!orderId) throw new Error('Order has no on-chain ID')

      const result = await submitOnchain({ orderId, rating: data.rating, contentHash })
      if (!result) throw new Error(onchainError || 'Failed to submit review on-chain')

      // Step 4: Save to database
      setSaving(true)
      const dbResponse = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.order.id,
          productId: data.product.id,
          buyerAddress: data.order.buyerAddress,
          rating: data.rating,
          content: data.content,
          photos: photoUrls.length > 0 ? photoUrls : null,
          txHash: result.txHash,
        }),
      })

      const dbData = await dbResponse.json()
      if (!dbData.success) throw new Error(dbData.error)
      setSaving(false)

      return { success: true, txHash: result.txHash }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit review'
      setError(msg)
      setUploading(false)
      setSaving(false)
      return { success: false }
    }
  }, [submitOnchain, onchainError])

  return {
    submit,
    loading: uploading || onchainLoading || saving,
    uploading,
    onchainLoading,
    saving,
    error,
  }
}

export function useOrderReviewStatus(orderId?: string) {
  const onchainOrderId = orderId as `0x${string}` | undefined
  const { canReview, loading, error, refetch } = useCanReview(onchainOrderId)

  return { canReview, loading, error, refetch }
}
