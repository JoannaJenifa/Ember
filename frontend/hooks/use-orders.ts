'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Order,
  getOrder,
  getBuyerOrdersFull,
  getSellerOrdersFull,
} from '@/lib/ember/order-queries';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for buyer orders with polling
 */
export function useBuyerOrders(
  buyerAddress: string | null,
  pollInterval: number = 10000
): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!buyerAddress) {
      setOrders([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getBuyerOrdersFull(buyerAddress);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
    } finally {
      setLoading(false);
    }
  }, [buyerAddress]);

  useEffect(() => {
    fetchOrders();

    // Set up polling
    if (buyerAddress && pollInterval > 0) {
      intervalRef.current = setInterval(fetchOrders, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchOrders, buyerAddress, pollInterval]);

  return { orders, loading, error, refetch: fetchOrders };
}

/**
 * Hook for seller orders with polling
 */
export function useSellerOrders(
  sellerAddress: string | null,
  pollInterval: number = 10000
): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!sellerAddress) {
      setOrders([]);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getSellerOrdersFull(sellerAddress);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
    } finally {
      setLoading(false);
    }
  }, [sellerAddress]);

  useEffect(() => {
    fetchOrders();

    if (sellerAddress && pollInterval > 0) {
      intervalRef.current = setInterval(fetchOrders, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchOrders, sellerAddress, pollInterval]);

  return { orders, loading, error, refetch: fetchOrders };
}

interface UseOrderReturn {
  order: Order | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for single order with polling
 */
export function useOrder(
  orderId: number | null,
  pollInterval: number = 5000
): UseOrderReturn {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOrder = useCallback(async () => {
    if (orderId === null) {
      setOrder(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch order'));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();

    if (orderId !== null && pollInterval > 0) {
      intervalRef.current = setInterval(fetchOrder, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchOrder, orderId, pollInterval]);

  return { order, loading, error, refetch: fetchOrder };
}
