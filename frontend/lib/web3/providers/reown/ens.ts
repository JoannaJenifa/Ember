/**
 * ENS Hooks - Reown/Wagmi Implementation
 */

'use client'

import { useEnsName as useWagmiEnsName, useEnsAvatar as useWagmiEnsAvatar } from 'wagmi'
import type { UseEnsNameParams, UseEnsNameReturn, UseEnsAvatarParams, UseEnsAvatarReturn } from './types'

export function useEnsName(params?: UseEnsNameParams): UseEnsNameReturn {
  const { data, isLoading } = useWagmiEnsName({
    address: params?.address,
    chainId: 1, // ENS is on mainnet
  })

  return {
    ensName: data || null,
    isLoading,
  }
}

export function useEnsAvatar(params?: UseEnsAvatarParams): UseEnsAvatarReturn {
  const { data, isLoading } = useWagmiEnsAvatar({
    name: params?.name,
    chainId: 1, // ENS is on mainnet
  })

  return {
    avatar: data || null,
    isLoading,
  }
}
