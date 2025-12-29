import { useState, useCallback, useEffect } from 'react'

export interface OnchainGiftData {
  id: string
  from: string
  streamer: string
  gift: {
    id: string
    name: string
    price: string
    animationURI: string
  }
  quantity: string
  totalValue: string
  totalValueFormatted: string
  totalValueVery: number
  createdAt: string
  createdAtDate: string
  txHash: string
  blockNumber: string
}

interface UseOnchainGiftsOptions {
  streamerAddress?: string
  fromAddress?: string
  first?: number
}

export function useOnchainGifts({
  streamerAddress,
  fromAddress,
  first = 50,
}: UseOnchainGiftsOptions = {}) {
  const [gifts, setGifts] = useState<OnchainGiftData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGifts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (streamerAddress) params.set('streamer', streamerAddress)
      if (fromAddress) params.set('from', fromAddress)
      params.set('first', first.toString())

      const response = await fetch(`/api/subgraph/gifts?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setGifts(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch gifts')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Fetch on-chain gifts error:', err)
    } finally {
      setLoading(false)
    }
  }, [streamerAddress, fromAddress, first])

  useEffect(() => {
    fetchGifts()
  }, [fetchGifts])

  return { gifts, loading, error, refetch: fetchGifts }
}
