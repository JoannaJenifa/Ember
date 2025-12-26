/**
 * Balance Hook - Reown/Wagmi Implementation
 */

'use client'

import { useBalance as useWagmiBalance } from 'wagmi'
import { useAccount } from './account'
import type { UseBalanceParams, UseBalanceReturn } from './types'

export function useBalance(params?: UseBalanceParams): UseBalanceReturn {
  const { address: accountAddress } = useAccount()
  const address = params?.address || accountAddress

  const { data, isLoading, error, refetch } = useWagmiBalance({
    address,
    token: params?.token,
    chainId: params?.chainId,
  })

  return {
    balance: data?.value,
    formatted: data?.formatted,
    symbol: data?.symbol,
    decimals: data?.decimals,
    isLoading,
    error: error || null,
    refetch,
  }
}
