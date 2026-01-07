'use client';

import { useState, useEffect, useCallback } from 'react';
import { Seller, getSeller, isVerifiedSeller, isRegisteredSeller } from '@/lib/ember/queries';
import { Product, getSellerProductsFull } from '@/lib/ember/product-queries';

interface UseSellerReturn {
  seller: Seller | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSeller(sellerAddress: string | null): UseSellerReturn {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSeller = useCallback(async () => {
    if (!sellerAddress) {
      setSeller(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getSeller(sellerAddress);
      setSeller(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch seller'));
    } finally {
      setLoading(false);
    }
  }, [sellerAddress]);

  useEffect(() => {
    fetchSeller();
  }, [fetchSeller]);

  return { seller, loading, error, refetch: fetchSeller };
}

interface UseSellerProductsReturn {
  products: Product[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSellerProducts(sellerAddress: string | null): UseSellerProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!sellerAddress) {
      setProducts([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getSellerProductsFull(sellerAddress);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch products'));
    } finally {
      setLoading(false);
    }
  }, [sellerAddress]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

interface UseIsVerifiedSellerReturn {
  isVerified: boolean;
  isRegistered: boolean;
  loading: boolean;
}

export function useIsVerifiedSeller(address: string | null): UseIsVerifiedSellerReturn {
  const [isVerified, setIsVerified] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) {
      setIsVerified(false);
      setIsRegistered(false);
      return;
    }

    const check = async () => {
      setLoading(true);
      try {
        const [verified, registered] = await Promise.all([
          isVerifiedSeller(address),
          isRegisteredSeller(address),
        ]);
        setIsVerified(verified);
        setIsRegistered(registered);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [address]);

  return { isVerified, isRegistered, loading };
}
