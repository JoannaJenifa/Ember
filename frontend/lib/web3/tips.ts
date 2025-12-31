/**
 * TipJar Contract Hooks
 * Provides React hooks for interacting with the TipJar contract
 * Uses native currency (VERY on VeryChain)
 */

import { useState, useCallback, useEffect } from 'react'
import { type Address, parseUnits, formatUnits } from 'viem'
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
import { writeContract, readContract, simulateContractCall } from '@/lib/web3/contracts'
import { getContractByName } from '@/constants/contracts'

const CHAIN_ID = 4613 // VeryChain
const PLATFORM_FEE_BPS = 200 // 2%
const FEE_DENOMINATOR = 10000

// Hook to send a tip using native currency
export function useSendTip() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendTip = useCallback(
    async (params: { streamerId: Address; amount: string; message?: string }) => {
      if (!address || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return null
      }

      setLoading(true)
      setError(null)

      try {
        const tipJar = await getContractByName(CHAIN_ID, 'TipJar')
        if (!tipJar) {
          throw new Error('TipJar contract not found')
        }

        const amountWei = parseUnits(params.amount, 18)

        // Send tip with native currency (msg.value)
        const tipParams = {
          address: tipJar.address,
          abi: tipJar.abi,
          functionName: 'tip' as const,
          args: [params.streamerId, params.message || ''] as const,
          value: amountWei,
        }

        const tipSim = await simulateContractCall(publicClient, address, tipParams)
        if (!tipSim.success) {
          throw new Error(`Tip failed: ${tipSim.error}`)
        }

        const result = await writeContract(
          publicClient,
          walletClient,
          address,
          tipParams,
          undefined,
          tipSim
        )

        return { txHash: result.hash }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Send tip error:', err)
        return null
      } finally {
        setLoading(false)
      }
    },
    [address, publicClient, walletClient]
  )

  return { sendTip, loading, error }
}

// Hook to withdraw tips (for streamers)
export function useWithdrawTips() {
  const { address } = useAccount()
  const { publicClient } = usePublicClient()
  const { walletClient } = useWalletClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const withdrawTips = useCallback(async () => {
    if (!address || !publicClient || !walletClient) {
      setError('Wallet not connected')
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const tipJar = await getContractByName(CHAIN_ID, 'TipJar')
      if (!tipJar) throw new Error('Contract not found')

      const params = {
        address: tipJar.address,
        abi: tipJar.abi,
        functionName: 'withdrawTips' as const,
        args: [] as const,
      }

      const simulation = await simulateContractCall(publicClient, address, params)
      if (!simulation.success) {
        throw new Error(`Withdraw failed: ${simulation.error}`)
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
      console.error('Withdraw tips error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [address, publicClient, walletClient])

  return { withdrawTips, loading, error }
}

// Hook to get tip balance for a streamer
export function useTipBalance(streamerId?: Address) {
  const { publicClient } = usePublicClient()
  const [balance, setBalance] = useState<bigint>(0n)
  const [totalReceived, setTotalReceived] = useState<bigint>(0n)
  const [loading, setLoading] = useState(false)

  const fetchBalance = useCallback(async () => {
    if (!streamerId || !publicClient) return

    setLoading(true)
    try {
      const tipJar = await getContractByName(CHAIN_ID, 'TipJar')
      if (!tipJar) return

      const [pending, total] = await Promise.all([
        readContract<bigint>(publicClient, {
          address: tipJar.address,
          abi: tipJar.abi,
          functionName: 'getStreamerBalance',
          args: [streamerId],
        }),
        readContract<bigint>(publicClient, {
          address: tipJar.address,
          abi: tipJar.abi,
          functionName: 'getTotalTipsReceived',
          args: [streamerId],
        }),
      ])

      setBalance(pending)
      setTotalReceived(total)
    } catch (err) {
      console.error('Fetch tip balance error:', err)
    } finally {
      setLoading(false)
    }
  }, [streamerId, publicClient])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  return {
    balance,
    balanceFormatted: formatUnits(balance, 18),
    totalReceived,
    totalReceivedFormatted: formatUnits(totalReceived, 18),
    loading,
    refetch: fetchBalance,
  }
}

// Calculate fee for a given tip amount
export function calculateTipFee(amount: string): { fee: string; total: string; netAmount: string } {
  try {
    const amountWei = parseUnits(amount, 18)
    const feeWei = (amountWei * BigInt(PLATFORM_FEE_BPS)) / BigInt(FEE_DENOMINATOR)
    const netWei = amountWei - feeWei

    return {
      fee: formatUnits(feeWei, 18),
      total: amount,
      netAmount: formatUnits(netWei, 18),
    }
  } catch {
    return { fee: '0', total: '0', netAmount: '0' }
  }
}

// Get platform fee percentage
export function getPlatformFeePercent(): number {
  return (PLATFORM_FEE_BPS / FEE_DENOMINATOR) * 100
}
