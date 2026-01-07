'use client';

import { useState, useEffect, useCallback } from 'react';
import { aptos, formatMoveAmount } from '@/lib/aptos';

interface MoveBalanceResult {
  balance: string;
  rawBalance: bigint;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMoveBalance(address: string | null): MoveBalanceResult {
  const [balance, setBalance] = useState<string>('0');
  const [rawBalance, setRawBalance] = useState<bigint>(BigInt(0));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance('0');
      setRawBalance(BigInt(0));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const resources = await aptos.getAccountResources({
        accountAddress: address,
      });

      const coinStore = resources.find(
        (r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );

      if (coinStore) {
        const data = coinStore.data as { coin: { value: string } };
        const value = BigInt(data.coin.value);
        setRawBalance(value);
        setBalance(formatMoveAmount(value));
      } else {
        setBalance('0');
        setRawBalance(BigInt(0));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
      setBalance('0');
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
