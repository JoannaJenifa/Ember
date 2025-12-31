/**
 * Order Escrow Contract Hooks
 * Provides React hooks for interacting with the OrderEscrow contract
 * Uses native currency (VERY on VeryChain)
 */

import { useState, useCallback } from 'react'
import { type Address, parseUnits, encodePacked, keccak256 } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import { writeContract, readContract, simulateContractCall } from '@/lib/web3/contracts'
import { getContractByName } from '@/constants/contracts'
import { OnchainOrder, OnchainOrderStatus } from '@/lib/types/order'

const CHAIN_ID = 4613 // VeryChain

// Generate order ID from parameters
export function generateOrderId(
  buyer: Address,
  seller: Address,
  productId: string,
  timestamp: number
): `0x${string}` {
  const packed = encodePacked(
    ['address', 'address', 'uint256', 'uint256'],
    [buyer, seller, BigInt(productId), BigInt(timestamp)]
  )
  return keccak256(packed)
}

// Hook to create a new order using native currency
export function useCreateOrder() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrder = useCallback(
    async (params: {
      seller: Address
      productId: string
      amount: number
      decimals?: number
    }) => {
      if (!address || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const escrowContract = await getContractByName(CHAIN_ID, 'OrderEscrow')
        if (!escrowContract) {
          throw new Error('OrderEscrow contract not found')
        }

        const decimals = params.decimals ?? 18
        const amountWei = parseUnits(params.amount.toString(), decimals)
        const orderId = generateOrderId(
          address,
          params.seller,
          params.productId,
          Math.floor(Date.now() / 1000)
        )

        // Create order with native currency payment
        // Args: orderId, seller, amount, productId
        // Must send msg.value equal to amount
        const createOrderParams = {
          address: escrowContract.address,
          abi: escrowContract.abi,
          functionName: 'createOrder' as const,
          args: [orderId, params.seller, amountWei, BigInt(params.productId)] as const,
          value: amountWei,
        }

        const createSim = await simulateContractCall(
          publicClient,
          address,
          createOrderParams
        )

        if (!createSim.success) {
          throw new Error(`Create order failed: ${createSim.error}`)
        }

        const result = await writeContract(
          publicClient,
          walletClient,
          address,
          createOrderParams,
          undefined,
          createSim
        )

        return { orderId, txHash: result.hash }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Create order error:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { createOrder, loading, error }
}

// Hook to confirm delivery (releases funds to seller)
export function useConfirmDelivery() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmDelivery = useCallback(
    async (orderId: `0x${string}`) => {
      if (!address || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const escrowContract = await getContractByName(CHAIN_ID, 'OrderEscrow')
        if (!escrowContract) throw new Error('Contract not found')

        const params = {
          address: escrowContract.address,
          abi: escrowContract.abi,
          functionName: 'confirmDelivery' as const,
          args: [orderId] as const,
        }

        const simulation = await simulateContractCall(publicClient, address, params)
        if (!simulation.success) {
          throw new Error(`Confirm delivery failed: ${simulation.error}`)
        }

        const result = await writeContract(
          publicClient,
          walletClient,
          address,
          params,
          undefined,
          simulation
        )

        return result.hash
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Confirm delivery error:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { confirmDelivery, loading, error }
}

// Hook to dispute an order
export function useDisputeOrder() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disputeOrder = useCallback(
    async (orderId: `0x${string}`, reason: string) => {
      if (!address || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const escrowContract = await getContractByName(CHAIN_ID, 'OrderEscrow')
        if (!escrowContract) throw new Error('Contract not found')

        const params = {
          address: escrowContract.address,
          abi: escrowContract.abi,
          functionName: 'disputeOrder' as const,
          args: [orderId, reason] as const,
        }

        const simulation = await simulateContractCall(publicClient, address, params)
        if (!simulation.success) {
          throw new Error(`Dispute order failed: ${simulation.error}`)
        }

        const result = await writeContract(
          publicClient,
          walletClient,
          address,
          params,
          undefined,
          simulation
        )

        return result.hash
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Dispute order error:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { disputeOrder, loading, error }
}

// Hook to read order status from contract
export function useOrderStatus(orderId?: `0x${string}`) {
  const { publicClient } = usePublicClient()
  const [order, setOrder] = useState<OnchainOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    if (!orderId || !publicClient) return

    setLoading(true)
    setError(null)

    try {
      const escrowContract = await getContractByName(CHAIN_ID, 'OrderEscrow')
      if (!escrowContract) throw new Error('Contract not found')

      const result = await readContract<[Address, Address, bigint, bigint, bigint, number]>(
        publicClient,
        {
          address: escrowContract.address,
          abi: escrowContract.abi,
          functionName: 'getOrder',
          args: [orderId],
        }
      )

      setOrder({
        buyer: result[0],
        seller: result[1],
        amount: result[2],
        productId: result[3],
        createdAt: result[4],
        status: result[5] as OnchainOrderStatus,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      console.error('Fetch order error:', err)
    } finally {
      setLoading(false)
    }
  }, [orderId, publicClient])

  return { order, loading, error, refetch: fetchOrder }
}

// Hook to check native currency balance
export function useNativeBalance() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const [balance, setBalance] = useState<bigint>(0n)
  const [loading, setLoading] = useState(false)

  const fetchBalance = useCallback(async () => {
    if (!address || !publicClient) return

    setLoading(true)
    try {
      const result = await publicClient.getBalance({ address })
      setBalance(result)
    } catch (err) {
      console.error('Fetch balance error:', err)
    } finally {
      setLoading(false)
    }
  }, [address, publicClient])

  return { balance, loading, refetch: fetchBalance }
}

// Alias for backwards compatibility
export const useVeryBalance = useNativeBalance
