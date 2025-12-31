/**
 * GiftShop Contract Hooks
 * Provides React hooks for interacting with the GiftShop contract
 * Uses native currency (VERY on VeryChain)
 */

import { useState, useCallback, useEffect } from 'react'
import { type Address, formatUnits } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import { writeContract, readContract, simulateContractCall } from '@/lib/web3/contracts'
import { getContractByName } from '@/constants/contracts'

const CHAIN_ID = 4613 // VeryChain

export interface Gift {
  id: bigint
  name: string
  price: bigint
  animationURI: string
  active: boolean
}

export interface GiftWithDisplay extends Gift {
  priceFormatted: string
  emoji: string
}

// Default gift emojis by ID
const GIFT_EMOJIS: Record<string, string> = {
  '1': '💕',
  '2': '⭐',
  '3': '🚀',
  '4': '👑',
}

// Hook to fetch all available gifts
export function useGifts() {
  const { publicClient } = usePublicClient()
  const [gifts, setGifts] = useState<GiftWithDisplay[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchGifts = useCallback(async () => {
    if (!publicClient) return

    setLoading(true)
    setError(null)

    try {
      const giftShop = await getContractByName(CHAIN_ID, 'GiftShop')
      if (!giftShop) throw new Error('GiftShop contract not found')

      const result = await readContract<Gift[]>(publicClient, {
        address: giftShop.address,
        abi: giftShop.abi,
        functionName: 'getAllGifts',
      })

      const giftsWithDisplay: GiftWithDisplay[] = result
        .filter((g) => g.active)
        .map((gift) => ({
          ...gift,
          priceFormatted: formatUnits(gift.price, 18),
          emoji: GIFT_EMOJIS[gift.id.toString()] || '🎁',
        }))

      setGifts(giftsWithDisplay)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Fetch gifts error:', err)
    } finally {
      setLoading(false)
    }
  }, [publicClient])

  useEffect(() => {
    fetchGifts()
  }, [fetchGifts])

  return { gifts, loading, error, refetch: fetchGifts }
}

// Hook to send a gift using native currency
export function useSendGift() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendGift = useCallback(
    async (params: {
      streamerId: Address
      giftId: bigint
      quantity: number
      pricePerGift: bigint
    }) => {
      if (!address || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const giftShop = await getContractByName(CHAIN_ID, 'GiftShop')
        if (!giftShop) {
          throw new Error('GiftShop contract not found')
        }

        const totalCost = params.pricePerGift * BigInt(params.quantity)

        // Send gift with native currency value
        const sendGiftParams = {
          address: giftShop.address,
          abi: giftShop.abi,
          functionName: 'sendGift' as const,
          args: [params.streamerId, params.giftId, BigInt(params.quantity)] as const,
          value: totalCost,
        }

        const sendSim = await simulateContractCall(publicClient, address, sendGiftParams)
        if (!sendSim.success) {
          throw new Error(`Send gift failed: ${sendSim.error}`)
        }

        const result = await writeContract(
          publicClient,
          walletClient,
          address,
          sendGiftParams,
          undefined,
          sendSim
        )

        return { txHash: result.hash }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Send gift error:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { sendGift, loading, error }
}

// Hook to get streamer's gift revenue
export function useStreamerGiftRevenue(streamerId?: Address) {
  const { publicClient } = usePublicClient()
  const [revenue, setRevenue] = useState<bigint>(0n)
  const [totalReceived, setTotalReceived] = useState<bigint>(0n)
  const [loading, setLoading] = useState(false)

  const fetchRevenue = useCallback(async () => {
    if (!streamerId || !publicClient) return

    setLoading(true)
    try {
      const giftShop = await getContractByName(CHAIN_ID, 'GiftShop')
      if (!giftShop) return

      const [pending, total] = await Promise.all([
        readContract<bigint>(publicClient, {
          address: giftShop.address,
          abi: giftShop.abi,
          functionName: 'getStreamerRevenue',
          args: [streamerId],
        }),
        readContract<bigint>(publicClient, {
          address: giftShop.address,
          abi: giftShop.abi,
          functionName: 'getTotalGiftsReceived',
          args: [streamerId],
        }),
      ])

      setRevenue(pending)
      setTotalReceived(total)
    } catch (err) {
      console.error('Fetch gift revenue error:', err)
    } finally {
      setLoading(false)
    }
  }, [streamerId, publicClient])

  useEffect(() => {
    fetchRevenue()
  }, [fetchRevenue])

  return {
    revenue,
    revenueFormatted: formatUnits(revenue, 18),
    totalReceived,
    totalReceivedFormatted: formatUnits(totalReceived, 18),
    loading,
    refetch: fetchRevenue,
  }
}

// Hook to withdraw gift revenue
export function useWithdrawGiftRevenue() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withdraw = useCallback(async () => {
    if (!address || !publicClient || !walletClient) {
      setError('Wallet not connected')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const giftShop = await getContractByName(CHAIN_ID, 'GiftShop')
      if (!giftShop) throw new Error('Contract not found')

      const params = {
        address: giftShop.address,
        abi: giftShop.abi,
        functionName: 'withdrawRevenue' as const,
        args: [] as const,
      }

      const simulation = await simulateContractCall(publicClient, address, params)
      if (!simulation.success) {
        throw new Error(`Withdraw failed: ${simulation.error}`)
      }

      const result = await writeContract(
        publicClient,
        walletClient,
        address,
        params,
        undefined,
        simulation
      )

      return result.hash
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Withdraw gift revenue error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [address, publicClient, walletClient])

  return { withdraw, loading, error }
}
