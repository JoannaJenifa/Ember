import { useState, useCallback, useEffect } from 'react'

// On-chain order from subgraph
export interface OnchainOrderData {
  id: string
  buyer: string
  seller: string
  productId: string
  amount: string
  amountFormatted: string
  status: string
  createdAt: string
  createdAtDate: string
  confirmedAt: string | null
  confirmedAtDate: string | null
  releasedAmount: string | null
  releasedAmountFormatted: string | null
  txHash: string
  blockNumber: string
}

interface UseOnchainOrdersOptions {
  buyerAddress?: string
  sellerAddress?: string
  status?: string
  first?: number
}

export function useOnchainOrders({
  buyerAddress,
  sellerAddress,
  status,
  first = 50,
}: UseOnchainOrdersOptions = {}) {
  const [orders, setOrders] = useState<OnchainOrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (buyerAddress) params.set('buyer', buyerAddress)
      if (sellerAddress) params.set('seller', sellerAddress)
      if (status) params.set('status', status)
      params.set('first', first.toString())

      const response = await fetch(`/api/subgraph/orders?${params.toString()}`)
      const result = await response.json()

      if (result.success) {
        setOrders(result.data || [])
      } else {
        throw new Error(result.error || 'Failed to fetch on-chain orders')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Fetch on-chain orders error:', err)
    } finally {
      setLoading(false)
    }
  }, [buyerAddress, sellerAddress, status, first])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return { orders, loading, error, refetch: fetchOrders }
}
