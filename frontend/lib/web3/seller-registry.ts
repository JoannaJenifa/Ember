import { useState, useCallback, useEffect } from 'react'
import { getContractAddress } from './addresses'
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from '@/lib/web3'
import { writeContract, readContract, simulateContractCall } from '@/lib/web3/contracts'
import { getContractByName } from '@/constants/contracts'
import SellerRegistryABI from '@/constants/contracts/4613/abis/SellerRegistry.json'
import type { Address } from 'viem'

export const CHAIN_ID = 4613 // VeryChain

export const SELLER_REGISTRY_ADDRESS = getContractAddress(4613, 'other', 'SellerRegistry') as Address

export const SELLER_REGISTRY_ABI = SellerRegistryABI

export interface RegisterSellerParams {
  shopName: string
  category: string
  metadataURI: string
}

export interface OnChainSeller {
  wallet: Address
  shopName: string
  category: string
  metadataURI: string
  isActive: boolean
  createdAt: bigint
  totalSales: bigint
  totalOrders: bigint
}

// Contract read functions
export const sellerRegistryReads = {
  getSeller: (sellerId: bigint) => ({
    address: SELLER_REGISTRY_ADDRESS,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'getSeller',
    args: [sellerId],
  }),
  getSellerByWallet: (wallet: Address) => ({
    address: SELLER_REGISTRY_ADDRESS,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'getSellerByWallet',
    args: [wallet],
  }),
  getSellerIdByWallet: (wallet: Address) => ({
    address: SELLER_REGISTRY_ADDRESS,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'getSellerIdByWallet',
    args: [wallet],
  }),
  isRegisteredSeller: (wallet: Address) => ({
    address: SELLER_REGISTRY_ADDRESS,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'isRegisteredSeller',
    args: [wallet],
  }),
  totalSellers: () => ({
    address: SELLER_REGISTRY_ADDRESS,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'totalSellers',
    args: [],
  }),
}

// Contract write functions
export const sellerRegistryWrites = {
  registerSeller: (params: RegisterSellerParams) => ({
    address: SELLER_REGISTRY_ADDRESS,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'registerSeller',
    args: [params.shopName, params.category, params.metadataURI],
  }),
  updateSeller: (metadataURI: string) => ({
    address: SELLER_REGISTRY_ADDRESS,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'updateSeller',
    args: [metadataURI],
  }),
  deactivateSeller: () => ({
    address: SELLER_REGISTRY_ADDRESS,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'deactivateSeller',
    args: [],
  }),
  reactivateSeller: () => ({
    address: SELLER_REGISTRY_ADDRESS,
    abi: SELLER_REGISTRY_ABI,
    functionName: 'reactivateSeller',
    args: [],
  }),
}

// Hook to register a new seller on-chain
export function useRegisterSeller() {
  const { address, chainId } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient, isLoading: walletClientLoading } = useWalletClient()
  const { switchChain } = useSwitchChain()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const registerSeller = useCallback(
    async (params: RegisterSellerParams): Promise<{ txHash: string } | { error: string }> => {
      if (!address) {
        const msg = 'Wallet not connected'
        setError(msg)
        return { error: msg }
      }

      setLoading(true)
      setError(null)

      try {
        // Auto-switch to VeryChain if on wrong chain
        if (chainId !== CHAIN_ID) {
          try {
            await switchChain(CHAIN_ID)
            // Wait a moment for the chain switch to complete
            await new Promise(resolve => setTimeout(resolve, 1000))
          } catch (switchError) {
            const msg = 'Failed to switch to VeryChain. Please switch manually and try again.'
            setError(msg)
            setLoading(false)
            return { error: msg }
          }
        }

        if (!publicClient) {
          const msg = 'Network client not available'
          setError(msg)
          setLoading(false)
          return { error: msg }
        }

        if (!walletClient) {
          const msg = 'Wallet not ready. Please try again.'
          setError(msg)
          setLoading(false)
          return { error: msg }
        }

        const contract = await getContractByName(CHAIN_ID, 'SellerRegistry')
        if (!contract) throw new Error('SellerRegistry contract not found')

        const txParams = {
          address: contract.address,
          abi: contract.abi,
          functionName: 'registerSeller' as const,
          args: [params.shopName, params.category, params.metadataURI] as const,
        }

        const simulation = await simulateContractCall(publicClient, address, txParams)
        if (!simulation.success) {
          throw new Error(`Register seller failed: ${simulation.error}`)
        }

        const result = await writeContract(
          publicClient,
          walletClient,
          address,
          txParams,
          undefined,
          simulation
        )

        return { txHash: result.hash }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Register seller error:', err)
        return { error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [address, chainId, publicClient, walletClient, switchChain]
  )

  return { registerSeller, loading: loading || walletClientLoading, error }
}

// Hook to update seller metadata on-chain
export function useUpdateSeller() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateSeller = useCallback(
    async (metadataURI: string) => {
      if (!address || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const contract = await getContractByName(CHAIN_ID, 'SellerRegistry')
        if (!contract) throw new Error('Contract not found')

        const txParams = {
          address: contract.address,
          abi: contract.abi,
          functionName: 'updateSeller' as const,
          args: [metadataURI] as const,
        }

        const simulation = await simulateContractCall(publicClient, address, txParams)
        if (!simulation.success) {
          throw new Error(`Update seller failed: ${simulation.error}`)
        }

        const result = await writeContract(
          publicClient,
          walletClient,
          address,
          txParams,
          undefined,
          simulation
        )

        return { txHash: result.hash }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Update seller error:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { updateSeller, loading, error }
}

// Hook to check if wallet is registered as seller
export function useIsRegisteredSeller(walletAddress?: Address) {
  const { publicClient } = usePublicClient()
  const [isRegistered, setIsRegistered] = useState(false)
  const [sellerId, setSellerId] = useState<bigint | null>(null)
  const [loading, setLoading] = useState(false)

  const checkRegistration = useCallback(async () => {
    if (!walletAddress || !publicClient) return

    setLoading(true)
    try {
      const contract = await getContractByName(CHAIN_ID, 'SellerRegistry')
      if (!contract) return

      const registered = await readContract<boolean>(publicClient, {
        address: contract.address,
        abi: contract.abi,
        functionName: 'isRegisteredSeller',
        args: [walletAddress],
      })

      setIsRegistered(registered)

      if (registered) {
        const id = await readContract<bigint>(publicClient, {
          address: contract.address,
          abi: contract.abi,
          functionName: 'getSellerIdByWallet',
          args: [walletAddress],
        })
        setSellerId(id)
      }
    } catch (err) {
      console.error('Check registration error:', err)
    } finally {
      setLoading(false)
    }
  }, [walletAddress, publicClient])

  useEffect(() => {
    checkRegistration()
  }, [checkRegistration])

  return { isRegistered, sellerId, loading, refetch: checkRegistration }
}
