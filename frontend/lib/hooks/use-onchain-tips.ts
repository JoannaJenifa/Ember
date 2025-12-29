import { useState, useCallback, useEffect } from 'react'

export interface OnchainTipData {
  id: string
  from: string
  streamer: string
  amount: string
  amountFormatted: string
  amountVery: number
  message: string
  createdAt: string
  createdAtDate: string
  txHash: string
  blockNumber: string
}

interface UseOnchainTipsOptions {
  streamerAddress?: string
  fromAddress?: string
  first?: number
}

export function useOnchainTips({
  streamerAddress,
  fromAddress,
  first = 50,
}: UseOnchainTipsOptions = {}) {
  const [tips, setTips] = useState<OnchainTipData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTips = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (streamerAddress) params.set('streamer', streamerAddress)
      if (fromAddress) params.set('from', fromAddress)
      params.set('first', first.toString())

      const response = await fetch(`/api/subgraph/tips?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setTips(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch tips')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Fetch on-chain tips error:', err)
    } finally {
      setLoading(false)
    }
  }, [streamerAddress, fromAddress, first])

  useEffect(() => {
    fetchTips()
  }, [fetchTips])

  return { tips, loading, error, refetch: fetchTips }
}
