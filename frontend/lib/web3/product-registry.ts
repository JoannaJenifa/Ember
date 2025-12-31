import { useState, useCallback } from 'react'
import { getContractAddress } from './addresses'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import { writeContract, simulateContractCall } from '@/lib/web3/contracts'
import { getContractByName } from '@/constants/contracts'
import ProductRegistryABI from '@/constants/contracts/4613/abis/ProductRegistry.json'
import type { Address } from 'viem'
import { parseEther } from 'viem'

const CHAIN_ID = 4613 // VeryChain

export const PRODUCT_REGISTRY_ADDRESS = getContractAddress(4613, 'other', 'ProductRegistry') as Address

export const PRODUCT_REGISTRY_ABI = ProductRegistryABI

export interface CreateProductParams {
  title: string
  category: string
  priceVery: string | number // Will be converted to wei
  inventory: number
  metadataURI: string
}

export interface OnChainProduct {
  sellerId: bigint
  title: string
  category: string
  priceVery: bigint
  inventory: bigint
  metadataURI: string
  isActive: boolean
  createdAt: bigint
  totalSold: bigint
}

// Contract read functions
export const productRegistryReads = {
  getProduct: (productId: bigint) => ({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'getProduct',
    args: [productId],
  }),
  getProductsBySeller: (sellerId: bigint) => ({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'getProductsBySeller',
    args: [sellerId],
  }),
  totalProducts: () => ({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'totalProducts',
    args: [],
  }),
  sellerRegistry: () => ({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'sellerRegistry',
    args: [],
  }),
}

// Contract write functions
export const productRegistryWrites = {
  createProduct: (params: CreateProductParams) => ({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'createProduct',
    args: [
      params.title,
      params.category,
      parseEther(params.priceVery.toString()),
      BigInt(params.inventory),
      params.metadataURI,
    ],
  }),
  updateProduct: (productId: bigint, metadataURI: string) => ({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'updateProduct',
    args: [productId, metadataURI],
  }),
  updatePrice: (productId: bigint, newPrice: string | number) => ({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'updatePrice',
    args: [productId, parseEther(newPrice.toString())],
  }),
  updateInventory: (productId: bigint, newInventory: number) => ({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'updateInventory',
    args: [productId, BigInt(newInventory)],
  }),
  deactivateProduct: (productId: bigint) => ({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'deactivateProduct',
    args: [productId],
  }),
  reactivateProduct: (productId: bigint) => ({
    address: PRODUCT_REGISTRY_ADDRESS,
    abi: PRODUCT_REGISTRY_ABI,
    functionName: 'reactivateProduct',
    args: [productId],
  }),
}

// Hook to create a new product on-chain
export function useCreateProduct() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createProduct = useCallback(
    async (params: CreateProductParams) => {
      if (!address || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return null
      }

      setLoading(true)
      setConfirming(false)
      setError(null)

      try {
        const contract = await getContractByName(CHAIN_ID, 'ProductRegistry')
        if (!contract) throw new Error('ProductRegistry contract not found')

        const txParams = {
          address: contract.address,
          abi: contract.abi,
          functionName: 'createProduct' as const,
          args: [
            params.title,
            params.category,
            parseEther(params.priceVery.toString()),
            BigInt(params.inventory),
            params.metadataURI,
          ] as const,
        }

        const simulation = await simulateContractCall(publicClient, address, txParams)
        if (!simulation.success) {
          throw new Error(`Create product failed: ${simulation.error}`)
        }

        const result = await writeContract(
          publicClient,
          walletClient,
          address,
          txParams,
          undefined,
          simulation
        )

        // Wait for transaction confirmation
        setLoading(false)
        setConfirming(true)

        const receipt = await publicClient.waitForTransactionReceipt({
          hash: result.hash,
        })

        return {
          txHash: result.hash,
          confirmed: receipt.status === 'success',
          blockNumber: receipt.blockNumber
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Create product error:', err)
        return null
      } finally {
        setLoading(false)
        setConfirming(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { createProduct, loading, confirming, error }
}

// Hook to update product metadata on-chain
export function useUpdateProduct() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProduct = useCallback(
    async (productId: bigint, metadataURI: string) => {
      if (!address || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const contract = await getContractByName(CHAIN_ID, 'ProductRegistry')
        if (!contract) throw new Error('Contract not found')

        const txParams = {
          address: contract.address,
          abi: contract.abi,
          functionName: 'updateProduct' as const,
          args: [productId, metadataURI] as const,
        }

        const simulation = await simulateContractCall(publicClient, address, txParams)
        if (!simulation.success) {
          throw new Error(`Update product failed: ${simulation.error}`)
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
        console.error('Update product error:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { updateProduct, loading, error }
}

// Hook to update product price on-chain
export function useUpdateProductPrice() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updatePrice = useCallback(
    async (productId: bigint, newPrice: string | number) => {
      if (!address || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const contract = await getContractByName(CHAIN_ID, 'ProductRegistry')
        if (!contract) throw new Error('Contract not found')

        const txParams = {
          address: contract.address,
          abi: contract.abi,
          functionName: 'updatePrice' as const,
          args: [productId, parseEther(newPrice.toString())] as const,
        }

        const simulation = await simulateContractCall(publicClient, address, txParams)
        if (!simulation.success) {
          throw new Error(`Update price failed: ${simulation.error}`)
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
        console.error('Update price error:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { updatePrice, loading, error }
}

// Hook to update product inventory on-chain
export function useUpdateProductInventory() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateInventory = useCallback(
    async (productId: bigint, newInventory: number) => {
      if (!address || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const contract = await getContractByName(CHAIN_ID, 'ProductRegistry')
        if (!contract) throw new Error('Contract not found')

        const txParams = {
          address: contract.address,
          abi: contract.abi,
          functionName: 'updateInventory' as const,
          args: [productId, BigInt(newInventory)] as const,
        }

        const simulation = await simulateContractCall(publicClient, address, txParams)
        if (!simulation.success) {
          throw new Error(`Update inventory failed: ${simulation.error}`)
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
        console.error('Update inventory error:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { updateInventory, loading, error }
}
