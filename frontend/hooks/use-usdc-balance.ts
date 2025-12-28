'use client';

import { useState, useEffect, useCallback } from 'react';
import { aptos, EMBER_ADDRESS } from '@/lib/aptos';

interface UsdcBalanceResult {
  balance: string;
  rawBalance: bigint;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// tUSDC uses 6 decimals (like real USDC)
const USDC_DECIMALS = 6;

export function formatUsdcAmount(amount: bigint | number): string {
  const value = typeof amount === 'bigint' ? Number(amount) : amount;
  return (value / Math.pow(10, USDC_DECIMALS)).toFixed(2);
}

export function useUsdcBalance(address: string | null): UsdcBalanceResult {
  const [balance, setBalance] = useState<string>('0.00');
  const [rawBalance, setRawBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance('0.00');
      setRawBalance(BigInt(0));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the view function to get tUSDC balance
      const result = await aptos.view({
        payload: {
          function: `${EMBER_ADDRESS}::test_tokens::get_balance`,
          typeArguments: [],
          functionArguments: [EMBER_ADDRESS, address],
        },
      });

      if (result && result.length > 0) {
        const value = BigInt(result[0] as string);
        setRawBalance(value);
        setBalance(formatUsdcAmount(value));
      } else {
        setBalance('0.00');
        setRawBalance(BigInt(0));
      }
    } catch (err) {
      // If the view function fails (e.g., user has no balance), default to 0
      console.error('Failed to fetch USDC balance:', err);
      setError(null); // Don't show error for missing balance
      setBalance('0.00');
      setRawBalance(BigInt(0));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    rawBalance,
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
