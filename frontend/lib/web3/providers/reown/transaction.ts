/**
 * Transaction Hooks - Reown/Wagmi Implementation
 */

'use client'

import { useSendTransaction as useWagmiSendTransaction, useWaitForTransactionReceipt, useGasPrice as useWagmiGasPrice } from 'wagmi'
import type { TransactionRequest, UseSendTransactionReturn, UseWaitForTransactionParams, UseWaitForTransactionReturn } from './types'

export function useSendTransaction(): UseSendTransactionReturn {
  const { sendTransactionAsync, isPending, error, reset } = useWagmiSendTransaction()

  return {
    sendTransaction: async (request: TransactionRequest) => {
      const hash = await sendTransactionAsync(request)
      return hash
    },
    isPending,
    error: error || null,
    reset,
  }
}

export function useWaitForTransaction(params: UseWaitForTransactionParams): UseWaitForTransactionReturn {
  const { isLoading, isSuccess, isError, error } = useWaitForTransactionReceipt({
    hash: params.hash,
  })

  return {
    isLoading,
    isSuccess,
    isError,
    error: error || null,
  }
}

export function useGasPrice() {
  const { data: gasPrice } = useWagmiGasPrice()
  return { gasPrice }
}
