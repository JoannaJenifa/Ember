/**
 * Contract Hooks - Reown/Wagmi Implementation
 */

'use client'

import { useReadContract as useWagmiReadContract, useWriteContract as useWagmiWriteContract } from 'wagmi'
import type { UseReadContractParams, UseReadContractReturn, UseWriteContractReturn } from './types'

export function useReadContract<T = unknown>(params: UseReadContractParams): UseReadContractReturn<T> {
  const { data, isLoading, error, refetch } = useWagmiReadContract({
    address: params.address,
    abi: params.abi as any,
    functionName: params.functionName,
    args: params.args as any,
    chainId: params.chainId,
  })

  return {
    data: data as T | undefined,
    isLoading,
    error: error || null,
    refetch,
  }
}

export function useWriteContract(): UseWriteContractReturn {
  const { writeContractAsync, isPending, error, reset } = useWagmiWriteContract()

  return {
    writeContract: async (params) => {
      const hash = await writeContractAsync({
        address: params.address,
        abi: params.abi as any,
        functionName: params.functionName,
        args: params.args as any,
        value: params.value,
      })
      return hash
    },
    isPending,
    error: error || null,
    reset,
  }
}
