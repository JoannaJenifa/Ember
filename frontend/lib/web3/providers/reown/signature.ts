/**
 * Signature Hooks - Reown/Wagmi Implementation
 */

'use client'

import { useSignMessage as useWagmiSignMessage, useSignTypedData as useWagmiSignTypedData } from 'wagmi'
import type { UseSignMessageReturn, UseSignTypedDataReturn } from './types'

export function useSignMessage(): UseSignMessageReturn {
  const { signMessageAsync, isPending, error } = useWagmiSignMessage()

  return {
    signMessage: async (message: string) => {
      return signMessageAsync({ message })
    },
    isPending,
    error: error || null,
  }
}

export function useSignTypedData(): UseSignTypedDataReturn {
  const { signTypedDataAsync, isPending, error } = useWagmiSignTypedData()

  return {
    signTypedData: async (params) => {
      return signTypedDataAsync({
        domain: params.domain as any,
        types: params.types as any,
        primaryType: params.primaryType,
        message: params.message as any,
      })
    },
    isPending,
    error: error || null,
  }
}
