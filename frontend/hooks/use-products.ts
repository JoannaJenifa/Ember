'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Product,
  getProduct,
  getActiveProducts,
  getProductsByCategory,
  getProductCount,
} from '@/lib/ember/product-queries';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export function useProducts(limit: number = 20, offset: number = 0): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentOffset, setCurrentOffset] = useState(offset);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (off: number = 0, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActiveProducts(limit, off);
      if (append) {
        setProducts((prev) => [...prev, ...data]);
      } else {
        setProducts(data);
      }
      setHasMore(data.length === limit);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProducts(offset);
    setCurrentOffset(offset);
  }, [fetchProducts, offset]);

  const refetch = useCallback(async () => {
    setCurrentOffset(offset);
    await fetchProducts(offset);
  }, [fetchProducts, offset]);

  const loadMore = useCallback(async () => {
    const newOffset = currentOffset + limit;
    setCurrentOffset(newOffset);
    await fetchProducts(newOffset, true);
  }, [currentOffset, limit, fetchProducts]);

  return { products, loading, error, refetch, hasMore, loadMore };
}

interface UseProductReturn {
  product: Product | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useProduct(productId: number | null): UseProductReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProduct = useCallback(async () => {
    if (productId === null) {
      setProduct(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getProduct(productId);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch product'));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return { product, loading, error, refetch: fetchProduct };
}

interface UseProductsByCategoryReturn {
  products: Product[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useProductsByCategory(
  category: number,
  limit: number = 20
): UseProductsByCategoryReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductsByCategory(category, limit);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
    } finally {
      setLoading(false);
    }
  }, [category, limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useProductCount(): { count: number; loading: boolean } {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductCount()
      .then(setCount)
      .finally(() => setLoading(false));
  }, []);

  return { count, loading };
}
