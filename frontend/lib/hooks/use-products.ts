import { useState, useEffect, useCallback, useRef } from 'react'
import type { ProductWithSeller, ProductFilters } from '@/lib/types/product'

interface UseProductsOptions extends ProductFilters {}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<ProductWithSeller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use ref to avoid re-creating callback on every render
  const optionsRef = useRef(options)
  optionsRef.current = options

  const fetchProducts = useCallback(async () => {
    const opts = optionsRef.current

    // Don't fetch if sellerId is expected but not yet available
    if (opts.sellerId === undefined) {
      setLoading(false)
      setProducts([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (opts.sellerId) params.set('sellerId', opts.sellerId)
      if (opts.category) params.set('category', opts.category)
      if (opts.search) params.set('search', opts.search)
      if (opts.limit) params.set('limit', opts.limit.toString())
      if (opts.offset) params.set('offset', opts.offset.toString())
      if (opts.activeOnly !== undefined) params.set('activeOnly', opts.activeOnly.toString())

      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      const fetchedProducts: ProductWithSeller[] = data.data || []

      // Merge with optimistic products from sessionStorage (defer to avoid blocking)
      let pendingOptimistic: ProductWithSeller[] = []
      try {
        const stored = sessionStorage.getItem('optimisticProducts')
        if (stored) {
          const optimisticProducts: ProductWithSeller[] = JSON.parse(stored)
          const relevantOptimistic = optimisticProducts.filter(
            (p: ProductWithSeller) => !opts.sellerId || p.seller?.id === opts.sellerId
          )
          const fetchedTitles = new Set(fetchedProducts.map(p => p.title))
          pendingOptimistic = relevantOptimistic.filter(
            (p: ProductWithSeller) => !fetchedTitles.has(p.title)
          )
          if (pendingOptimistic.length !== optimisticProducts.length) {
            sessionStorage.setItem('optimisticProducts', JSON.stringify(pendingOptimistic))
          }
        }
      } catch {
        // Ignore sessionStorage errors
      }

      setProducts([...pendingOptimistic, ...fetchedProducts])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, []) // Stable callback

  // Only refetch when key filter values change
  useEffect(() => {
    fetchProducts()
  }, [options.sellerId, options.search, options.category, fetchProducts])

  const refetch = useCallback(() => {
    fetchProducts()
  }, [fetchProducts])

  const deleteProduct = useCallback(
    async (productId: string) => {
      try {
        const params = new URLSearchParams()
        if (options.sellerId) params.set('sellerId', options.sellerId)

        const response = await fetch(`/api/products/${productId}?${params.toString()}`, {
          method: 'DELETE',
        })

        if (!response.ok) throw new Error('Failed to delete product')

        setProducts((prev) => prev.filter((p) => p.id !== productId))
        return true
      } catch (err) {
        console.error('Delete error:', err)
        return false
      }
    },
    [options.sellerId]
  )

  return { products, loading, error, refetch, deleteProduct }
}

export function useProduct(productId: string | null) {
  const [product, setProduct] = useState<ProductWithSeller | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!productId) {
      setProduct(null)
      return
    }

    const fetchProduct = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/products/${productId}`)
        if (!response.ok) throw new Error('Failed to fetch product')

        const data = await response.json()
        setProduct(data.data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  return { product, loading, error }
}
