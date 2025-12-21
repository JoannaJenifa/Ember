'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSeller, Seller } from '@/lib/ember/queries';

export function useSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSellers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get seller addresses from API (sourced from streams)
      const res = await fetch('/api/sellers');
      const data = await res.json();

      if (!data.sellers || data.sellers.length === 0) {
        setSellers([]);
        return;
      }

      // Enrich with on-chain seller data
      const enrichedSellers: Seller[] = [];
      for (const address of data.sellers) {
        const seller = await getSeller(address);
        if (seller) {
          enrichedSellers.push(seller);
        }
      }

      // Sort by total sales descending
      enrichedSellers.sort((a, b) => b.totalSales - a.totalSales);

      setSellers(enrichedSellers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sellers'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  return {
    sellers,
    isLoading,
    error,
    refetch: fetchSellers,
  };
}
