/**
 * Client Hooks - Reown/Wagmi Implementation
 */

'use client'

import { usePublicClient as useWagmiPublicClient, useWalletClient as useWagmiWalletClient } from 'wagmi'
import type { UsePublicClientReturn, UseWalletClientReturn } from './types'

export function usePublicClient(): UsePublicClientReturn {
  const publicClient = useWagmiPublicClient()
  return {
    publicClient: publicClient || null,
    isLoading: false,
  }
}

export function useWalletClient(): UseWalletClientReturn {
  const { data: walletClient, isLoading } = useWagmiWalletClient()
  return {
    walletClient: walletClient || null,
    isLoading,
  }
}
