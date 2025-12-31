/**
 * Review Registry Contract Hooks
 * Provides React hooks for interacting with the ReviewRegistry contract
 */

import { useState, useCallback } from 'react'
import { keccak256, toHex, encodePacked, type Address } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import { writeContract, readContract, simulateContractCall } from '@/lib/web3/contracts'
import { getContractByName } from '@/constants/contracts'
import type { OnchainReview } from '@/lib/types/review'

const CHAIN_ID = 4613 // VeryChain

// Generate content hash from review content
export function generateContentHash(content: string): `0x${string}` {
  const packed = encodePacked(['string'], [content])
  return keccak256(packed)
}

// Hook to submit a review
export function useSubmitReview() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitReview = useCallback(
    async (params: { orderId: `0x${string}`; rating: number; contentHash: `0x${string}` }) => {
      if (!address || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return null
      }

      if (params.rating < 1 || params.rating > 5) {
        setError('Rating must be between 1 and 5')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const reviewContract = await getContractByName(CHAIN_ID, 'ReviewRegistry')
        if (!reviewContract) throw new Error('ReviewRegistry contract not found')

        const writeParams = {
          address: reviewContract.address,
          abi: reviewContract.abi,
          functionName: 'submitReview' as const,
          args: [params.orderId, params.rating, params.contentHash] as const,
        }

        const simulation = await simulateContractCall(publicClient, address, writeParams)
        if (!simulation.success) {
          throw new Error(`Submit review failed: ${simulation.error}`)
        }

        const result = await writeContract(
          publicClient,
          walletClient,
          address,
          writeParams,
          undefined,
          simulation
        )

        // Return transaction hash - reviewId can be parsed from receipt logs if needed
        return { txHash: result.hash }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Submit review error:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { submitReview, loading, error }
}

// Hook to check if order can be reviewed
export function useCanReview(orderId?: `0x${string}`) {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const [canReview, setCanReview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkCanReview = useCallback(async () => {
    if (!orderId || !publicClient) return

    setLoading(true)
    setError(null)

    try {
      const reviewContract = await getContractByName(CHAIN_ID, 'ReviewRegistry')
      if (!reviewContract) throw new Error('Contract not found')

      // Check if already reviewed
      const hasReviewed = await readContract<boolean>(publicClient, {
        address: reviewContract.address,
        abi: reviewContract.abi,
        functionName: 'hasReviewed',
        args: [orderId],
      })

      setCanReview(!hasReviewed)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Check review eligibility error:', err)
    } finally {
      setLoading(false)
    }
  }, [orderId, publicClient])

  return { canReview, loading, error, refetch: checkCanReview }
}

// Hook to get product rating from contract
export function useProductRating(productId?: string) {
  const { publicClient } = usePublicClient()
  const [rating, setRating] = useState<{ average: number; count: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRating = useCallback(async () => {
    if (!productId || !publicClient) return

    setLoading(true)
    setError(null)

    try {
      const reviewContract = await getContractByName(CHAIN_ID, 'ReviewRegistry')
      if (!reviewContract) throw new Error('Contract not found')

      const result = await readContract<[bigint, bigint]>(publicClient, {
        address: reviewContract.address,
        abi: reviewContract.abi,
        functionName: 'getProductRating',
        args: [BigInt(productId)],
      })

      // Contract returns average * 100 for 2 decimal precision
      setRating({
        average: Number(result[0]) / 100,
        count: Number(result[1]),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Fetch product rating error:', err)
    } finally {
      setLoading(false)
    }
  }, [productId, publicClient])

  return { rating, loading, error, refetch: fetchRating }
}

// Hook to get a single review by ID
export function useReview(reviewId?: string) {
  const { publicClient } = usePublicClient()
  const [review, setReview] = useState<OnchainReview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReview = useCallback(async () => {
    if (!reviewId || !publicClient) return

    setLoading(true)
    setError(null)

    try {
      const reviewContract = await getContractByName(CHAIN_ID, 'ReviewRegistry')
      if (!reviewContract) throw new Error('Contract not found')

      const result = await readContract<
        [Address, bigint, Address, number, `0x${string}`, bigint]
      >(publicClient, {
        address: reviewContract.address,
        abi: reviewContract.abi,
        functionName: 'getReview',
        args: [BigInt(reviewId)],
      })

      setReview({
        orderId: result[0] as `0x${string}`,
        productId: result[1],
        reviewer: result[2],
        rating: result[3],
        contentHash: result[4],
        createdAt: result[5],
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Fetch review error:', err)
    } finally {
      setLoading(false)
    }
  }, [reviewId, publicClient])

  return { review, loading, error, refetch: fetchReview }
}
