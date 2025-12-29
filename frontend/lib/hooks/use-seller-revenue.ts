'use client'

import { useState, useEffect, useCallback } from 'react'

const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL || 'http://localhost:8000'
const SUBGRAPH_URL = `${INDEXER_URL}/subgraphs/name/labang`

export interface SellerRevenue {
  totalRevenue: string // in wei
  totalRevenueFormatted: number // in VERY
  orderCount: number
  confirmedOrderCount: number
  pendingOrderCount: number
}

export interface UseSellerRevenueReturn {
  revenue: SellerRevenue | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useSellerRevenue(walletAddress: string | null | undefined): UseSellerRevenueReturn {
  const [revenue, setRevenue] = useState<SellerRevenue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRevenue = useCallback(async () => {
    if (!walletAddress) {
      setRevenue(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const query = `
        query GetSellerOrders($seller: Bytes!) {
          orders(where: { seller: $seller }, first: 1000) {
            id
            amount
            status
          }
        }
      `

      const response = await fetch(SUBGRAPH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { seller: walletAddress.toLowerCase() }
        }),
      })

      if (!response.ok) {
        throw new Error(`Subgraph error: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'Subgraph query failed')
      }

      const orders = result.data?.orders || []

      // Calculate totals from orders
      let totalRevenue = 0n
      let confirmedCount = 0
      let pendingCount = 0

      for (const order of orders) {
        totalRevenue += BigInt(order.amount)
        if (order.status === 'CONFIRMED' || order.status === 'AUTO_RELEASED') {
          confirmedCount++
        } else if (order.status === 'ACTIVE') {
          pendingCount++
        }
      }

      // Convert to VERY (18 decimals)
      const totalRevenueFormatted = Number(totalRevenue) / 1e18

      setRevenue({
        totalRevenue: totalRevenue.toString(),
        totalRevenueFormatted,
        orderCount: orders.length,
        confirmedOrderCount: confirmedCount,
        pendingOrderCount: pendingCount,
      })
    } catch (err) {
      console.error('Failed to fetch seller revenue:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch seller revenue')
      setRevenue(null)
    } finally {
      setIsLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    fetchRevenue()
  }, [fetchRevenue])

  return {
    revenue,
    isLoading,
    error,
    refetch: fetchRevenue,
  }
}
