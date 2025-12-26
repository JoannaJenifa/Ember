/**
 * Chain Hooks - Reown/Wagmi Implementation
 */

'use client'

import { useChainId as useWagmiChainId, useSwitchChain as useWagmiSwitchChain, useChains as useWagmiChains } from 'wagmi'
import type { UseSwitchChainReturn, UseChainsReturn } from './types'

export function useChainId(): number | undefined {
  return useWagmiChainId()
}

export function useSwitchChain(): UseSwitchChainReturn {
  const { switchChainAsync, isPending, error } = useWagmiSwitchChain()

  return {
    switchChain: async (chainId: number) => {
      await switchChainAsync({ chainId })
    },
    isPending,
    error: error || null,
  }
}

export function useChains(): UseChainsReturn {
  const chains = useWagmiChains()
  return { chains: [...chains] }
}
