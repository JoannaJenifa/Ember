/**
 * Types for Reown/Wagmi Provider
 * Matches the interface used by WEPIN provider for easy switching
 */

import type { Chain, PublicClient, WalletClient } from 'viem'

export interface Web3Account {
  address: `0x${string}` | undefined
  isConnected: boolean
  isConnecting: boolean
  isDisconnected: boolean
  chain: Chain | undefined
  chainId: number | undefined
  isSmartAccount: boolean
  walletId: string | undefined
}

export interface UsePublicClientReturn {
  publicClient: PublicClient | null
  isLoading: boolean
}

export interface UseWalletClientReturn {
  walletClient: WalletClient | null
  isLoading: boolean
}

export interface UseSwitchChainReturn {
  switchChain: (chainId: number) => Promise<void>
  isPending: boolean
  error: Error | null
}

export interface UseChainsReturn {
  chains: Chain[]
}

export interface UseBalanceParams {
  address?: `0x${string}`
  token?: `0x${string}`
  chainId?: number
}

export interface UseBalanceReturn {
  balance: bigint | undefined
  formatted: string | undefined
  symbol: string | undefined
  decimals: number | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export interface Token {
  address: `0x${string}`
  symbol: string
  decimals: number
  name?: string
}

export interface UseTokenParams {
  address: `0x${string}`
  chainId?: number
}

export interface UseTokenReturn {
  token: Token | null
  isLoading: boolean
  error: Error | null
}

export interface TransactionRequest {
  to: `0x${string}`
  value?: bigint
  data?: `0x${string}`
  gas?: bigint
  gasPrice?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

export interface UseSendTransactionReturn {
  sendTransaction: (request: TransactionRequest) => Promise<`0x${string}`>
  isPending: boolean
  error: Error | null
  reset: () => void
}

export interface UseWaitForTransactionParams {
  hash: `0x${string}` | undefined
}

export interface UseWaitForTransactionReturn {
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  error: Error | null
}

export interface UseReadContractParams {
  address: `0x${string}`
  abi: readonly unknown[]
  functionName: string
  args?: readonly unknown[]
  chainId?: number
}

export interface UseReadContractReturn<T = unknown> {
  data: T | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export interface UseWriteContractReturn {
  writeContract: (params: {
    address: `0x${string}`
    abi: readonly unknown[]
    functionName: string
    args?: readonly unknown[]
    value?: bigint
  }) => Promise<`0x${string}`>
  isPending: boolean
  error: Error | null
  reset: () => void
}

export interface UseConnectReturn {
  connect: () => void
  isPending: boolean
  error: Error | null
}

export interface UseDisconnectReturn {
  disconnect: () => void
  isPending: boolean
}

export interface UseEnsNameParams {
  address?: `0x${string}`
}

export interface UseEnsNameReturn {
  ensName: string | null
  isLoading: boolean
}

export interface UseEnsAvatarParams {
  name?: string
}

export interface UseEnsAvatarReturn {
  avatar: string | null
  isLoading: boolean
}

export interface UseSignMessageReturn {
  signMessage: (message: string) => Promise<`0x${string}`>
  isPending: boolean
  error: Error | null
}

export interface UseSignTypedDataReturn {
  signTypedData: (params: {
    domain: Record<string, unknown>
    types: Record<string, unknown>
    primaryType: string
    message: Record<string, unknown>
  }) => Promise<`0x${string}`>
  isPending: boolean
  error: Error | null
}
