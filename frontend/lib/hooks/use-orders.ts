import { useState, useCallback, useEffect } from 'react'
import { OrderWithDetails, OrderStatus } from '@/lib/types/order'

interface UseOrdersOptions {
  buyerAddress?: string
  sellerId?: string
  status?: OrderStatus
}

export function useOrders({ buyerAddress, sellerId, status }: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (buyerAddress) params.set('buyerAddress', buyerAddress)
      if (sellerId) params.set('sellerId', sellerId)
      if (status) params.set('status', status)

      const response = await fetch(`/api/orders?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data.data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Fetch orders error:', err)
    } finally {
      setLoading(false)
    }
  }, [buyerAddress, sellerId, status])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return { orders, loading, error, refetch: fetchOrders }
}

export function useOrder(orderId: string) {
  const [order, setOrder] = useState<OrderWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!orderId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch order')
      }

      const data = await response.json()
      setOrder(data.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Fetch order error:', err)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const updateStatus = async (newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order')
      }

      await fetchOrder()
      return true
    } catch (err) {
      console.error('Update order error:', err)
      return false
    }
  }

  const shipOrder = async (trackingNumber: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber }),
      })

      if (!response.ok) {
        throw new Error('Failed to ship order')
      }

      await fetchOrder()
      return true
    } catch (err) {
      console.error('Ship order error:', err)
      return false
    }
  }

  return { order, loading, error, refetch: fetchOrder, updateStatus, shipOrder }
}
