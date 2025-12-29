'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRegisterSeller, useUpdateSeller, useIsRegisteredSeller } from '@/lib/web3/seller-registry'
import { GET_SELLER_BY_WALLET, SubgraphSeller } from '@/lib/graphql/seller-queries'
import type { Address } from 'viem'

// NEXT_PUBLIC_INDEXER_URL is required - validated by env-config.ts
const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL!
const SUBGRAPH_URL = `${INDEXER_URL}/subgraphs/name/labang`

export interface UseSellerReturn {
  seller: SubgraphSeller | null
  isLoading: boolean
  loading: boolean // Alias for isLoading
  isSeller: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSeller(walletAddress: string | null | undefined): UseSellerReturn {
  const [seller, setSeller] = useState<SubgraphSeller | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Start true to prevent premature redirects
  const [error, setError] = useState<string | null>(null)

  // On-chain check as fallback (in case subgraph is not synced)
  const { isRegistered: isOnChainSeller, loading: onChainLoading } = useIsRegisteredSeller(
    walletAddress as Address | undefined
  )

  const fetchSeller = useCallback(async () => {
    if (!walletAddress) {
      setSeller(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_SELLER_BY_WALLET,
          variables: { wallet: walletAddress.toLowerCase() }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch seller from subgraph')
      }

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Subgraph query failed')
      }

      const sellers = result.data?.sellers || []
      setSeller(sellers.length > 0 ? sellers[0] : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setSeller(null)
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchSeller()
  }, [fetchSeller])

  const loadingState = isLoading || onChainLoading
  return {
    seller,
    isLoading: loadingState,
    loading: loadingState, // Alias for backwards compatibility
    // Use on-chain check as fallback if subgraph doesn't have data
    isSeller: !!seller || isOnChainSeller,
    error,
    refetch: fetchSeller,
  }
}

export interface RegisterSellerInput {
  shopName: string
  shopNameKo?: string
  description?: string
  category: string
  profileImage?: string
  bannerImage?: string
  verychatHandle?: string
}

export interface UseSellerRegistrationReturn {
  register: (data: RegisterSellerInput) => Promise<boolean>
  update: (data: Partial<RegisterSellerInput>) => Promise<boolean>
  isLoading: boolean
  isOnchainLoading: boolean
  error: string | null
}

export function useSellerRegistration(
  walletAddress: string | null | undefined
): UseSellerRegistrationReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // On-chain hooks
  const { registerSeller, loading: registerOnchainLoading, error: registerOnchainError } = useRegisterSeller()
  const { updateSeller, loading: updateOnchainLoading, error: updateOnchainError } = useUpdateSeller()

  const register = useCallback(
    async (data: RegisterSellerInput): Promise<boolean> => {
      if (!walletAddress) {
        setError('Wallet not connected')
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        // Create metadata URI from seller data (stored on IPFS or as JSON)
        const metadataURI = JSON.stringify({
          shopNameKo: data.shopNameKo,
          description: data.description,
          profileImage: data.profileImage,
          bannerImage: data.bannerImage,
          verychatHandle: data.verychatHandle,
        })

        // Register on-chain - subgraph will index the event
        const onchainResult = await registerSeller({
          shopName: data.shopName,
          category: data.category,
          metadataURI,
        })

        if ('error' in onchainResult) {
          throw new Error(onchainResult.error)
        }

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [walletAddress, registerSeller]
  )

  const update = useCallback(
    async (data: Partial<RegisterSellerInput>): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        // Create updated metadata URI
        const metadataURI = JSON.stringify({
          shopNameKo: data.shopNameKo,
          description: data.description,
          profileImage: data.profileImage,
          bannerImage: data.bannerImage,
          verychatHandle: data.verychatHandle,
        })

        // Update on-chain - subgraph will index the event
        const onchainResult = await updateSeller(metadataURI)

        if (!onchainResult) {
          throw new Error(updateOnchainError || 'On-chain update failed')
        }

        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Update failed')
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [updateSeller, updateOnchainError]
  )

  return {
    register,
    update,
    isLoading,
    isOnchainLoading: registerOnchainLoading || updateOnchainLoading,
    error,
  }
}
