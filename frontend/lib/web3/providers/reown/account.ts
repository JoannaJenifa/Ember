/**
 * Account Hook - Reown/Wagmi Implementation
 */

'use client'

import { useAccount as useWagmiAccount } from 'wagmi'
import type { Web3Account } from './types'

export function useAccount(): Web3Account {
  const { address, isConnected, isConnecting, isDisconnected, chain } = useWagmiAccount()

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected,
    chain,
    chainId: chain?.id,
    isSmartAccount: false,
    walletId: isConnected ? 'wagmi' : undefined,
  }
}

export function useIsSmartAccount() {
  const { isConnected } = useWagmiAccount()
  return {
    isSmartAccount: false,
    walletId: isConnected ? 'wagmi' : undefined,
    isLoading: false,
  }
}
