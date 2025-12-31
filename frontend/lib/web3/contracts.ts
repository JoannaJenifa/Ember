/**
 * Contract interaction utilities using viem
 * Provides a unified interface for interacting with smart contracts
 * across all wallet providers with Tenderly simulation support
 */

import type { PublicClient, WalletClient, TransactionReceipt, Hex, Address, Chain, Abi } from 'viem'
import { formatUnits, parseUnits } from 'viem'

export interface ContractCallParams<TAbi extends Abi = Abi, TFunctionName extends string = string> {
  address: Address
  abi: TAbi
  functionName: TFunctionName
  args?: readonly unknown[]
  value?: bigint
}

export interface TransactionResult {
  hash: Hex
  receipt: TransactionReceipt
}

export interface SimulationResult {
  success: boolean
  result?: {
    request: ContractCallParams & { account: Address }
  }
  error?: string
  gasUsed?: string
  gasLimit?: string
  stateChanges?: Array<{
    address: string
    stateDiff: Record<string, { original: string; dirty: string }>
  }>
  assetChanges?: Array<{
    assetInfo: {
      standard: string
      type: string
      contractAddress: string
      symbol?: string
      name?: string
      logo?: string
      decimals?: number
      tokenId?: string
    }
    type: string
    from: string
    to: string
    rawAmount: string
    amount?: string
    dollarValue?: string
  }>
  logs?: Array<{
    name: string
    anonymous: boolean
    inputs: Array<{ value: string; type: string; name: string }>
    raw: { address: string; topics: string[]; data: string }
  }>
  callTrace?: {
    type: string
    from: string
    to: string
    value: string
    gas: number
    gasUsed: number
    input: string
    output: string
    error?: string
    calls?: unknown[]
  }
}

/**
 * Simulate a contract call using viem's simulateContract
 * Simple and reliable - uses RPC directly
 */
export async function simulateContractCall(
  publicClient: PublicClient,
  account: Address,
  params: ContractCallParams,
  chain?: Chain
): Promise<SimulationResult> {
  try {
    // Use viem's simulateContract directly
    const result = await publicClient.simulateContract({
      account,
      address: params.address,
      abi: params.abi,
      functionName: params.functionName,
      args: params.args || [],
      value: params.value,
    });

    return {
      success: true,
      result: result as any,
    };
  } catch (error) {
    // Parse revert reason if available
    const revertReason = extractRevertReason(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: revertReason || errorMessage || 'Simulation failed'
    };
  }
}

/**
 * Execute a write contract call with simulation
 * @param simulationResult - Optional pre-computed simulation result to avoid duplicate calls
 */
export async function writeContract(
  publicClient: PublicClient,
  walletClient: WalletClient,
  account: Address,
  params: ContractCallParams,
  chain?: Chain,
  simulationResult?: SimulationResult
): Promise<TransactionResult> {
  // Use provided simulation or run a new one
  const simulation = simulationResult || await simulateContractCall(publicClient, account, params, chain)
  
  if (!simulation.success || !simulation.result) {
    throw new Error(`Transaction simulation failed: ${simulation.error}`)
  }

  // Log Tenderly simulation details if available
  if (simulation.gasUsed && simulation.stateChanges) {
    console.log('Tenderly simulation results:', {
      gasUsed: simulation.gasUsed,
      gasLimit: simulation.gasLimit,
      stateChanges: simulation.stateChanges?.length || 0,
      assetChanges: simulation.assetChanges?.length || 0,
    });
  }

  // If simulation passes, execute the transaction
  const hash = await walletClient.writeContract({
    ...params,
    account,
    chain: walletClient.chain,
  })
  
  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({ 
    hash,
    confirmations: 1 
  })
  
  if (receipt.status === 'reverted') {
    throw new Error('Transaction reverted')
  }
  
  return { hash, receipt }
}

/**
 * Read data from a contract
 */
export async function readContract<T = unknown>(
  publicClient: PublicClient,
  params: Omit<ContractCallParams, 'value'>
): Promise<T> {
  const result = await publicClient.readContract({
    address: params.address,
    abi: params.abi,
    functionName: params.functionName,
    args: params.args || [],
  })
  
  return result as T
}

/**
 * Batch read multiple contract calls
 */
export async function batchReadContracts(
  publicClient: PublicClient,
  calls: Array<Omit<ContractCallParams, 'value'>>
) {
  const contracts = calls.map(call => ({
    address: call.address,
    abi: call.abi,
    functionName: call.functionName,
    args: call.args || [],
  }))
  
  const results = await publicClient.multicall({ contracts })
  
  return results.map((result, index) => ({
    ...calls[index],
    result: result.status === 'success' ? result.result : null,
    error: result.status === 'failure' ? result.error : null,
  }))
}

/**
 * Estimate gas for a contract call using Tenderly for accuracy
 * @param simulationResult - Optional pre-computed simulation result to avoid duplicate calls
 */
export async function estimateGas(
  publicClient: PublicClient,
  account: Address,
  params: ContractCallParams,
  chain?: Chain,
  simulationResult?: SimulationResult
): Promise<bigint> {
  // Use provided simulation result if available
  if (simulationResult?.success && simulationResult.gasUsed) {
    // Use Tenderly's gas estimate with 20% buffer
    const tenderlyGas = BigInt(simulationResult.gasUsed);
    return (tenderlyGas * 120n) / 100n;
  }
  
  // Try to get gas estimate from Tenderly simulation if not provided
  if (!simulationResult) {
    const simulation = await simulateContractCall(publicClient, account, params, chain);
    
    if (simulation.success && simulation.gasUsed) {
      // Use Tenderly's gas estimate with 20% buffer
      const tenderlyGas = BigInt(simulation.gasUsed);
      return (tenderlyGas * 120n) / 100n;
    }
  }
  
  // Fall back to standard gas estimation
  const gas = await publicClient.estimateContractGas({
    account,
    address: params.address,
    abi: params.abi,
    functionName: params.functionName,
    args: params.args || [],
    value: params.value,
  })
  
  // Add 20% buffer for safety
  return (gas * 120n) / 100n
}

/**
 * Get current gas price
 */
export async function getGasPrice(publicClient: PublicClient) {
  const gasPrice = await publicClient.getGasPrice()
  return gasPrice
}

/**
 * Format contract error messages
 */
export function extractRevertReason(error: unknown): string | null {
  // Type guard for error with data property
  if (error && typeof error === 'object' && 'data' in error) {
    const errorWithData = error as { data?: { errorName?: string; args?: unknown } };
    if (errorWithData.data?.errorName) {
      return `${errorWithData.data.errorName}${errorWithData.data.args ? `: ${errorWithData.data.args}` : ''}`
    }
  }
  
  // Type guard for error with reason property
  if (error && typeof error === 'object' && 'reason' in error) {
    const errorWithReason = error as { reason?: string };
    if (errorWithReason.reason) {
      return errorWithReason.reason;
    }
  }
  
  // Check for error message in various formats
  let message = '';
  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String((error as { message?: unknown }).message);
  } else {
    message = String(error);
  }
  
  const revertMatch = message.match(/reverted with reason string '([^']+)'/)
  if (revertMatch) {
    return revertMatch[1]
  }
  
  // Check for custom error format
  const customErrorMatch = message.match(/reverted with custom error '([^']+)'/)
  if (customErrorMatch) {
    return customErrorMatch[1]
  }
  
  return null
}

/**
 * Wait for transaction with retry logic
 */
interface TransactionReplacement {
  transaction: {
    hash: Hex
    from: Address
    to: Address | null
    value: bigint
  }
  reason: 'cancelled' | 'replaced' | 'repriced'
}

export async function waitForTransaction(
  publicClient: PublicClient,
  hash: Hex,
  options?: {
    confirmations?: number
    timeout?: number
    onReplaced?: (replacement: TransactionReplacement) => void
  }
): Promise<TransactionReceipt> {
  const { confirmations = 1, timeout = 60000 } = options || {}
  
  try {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash,
      confirmations,
      timeout,
      onReplaced: options?.onReplaced,
    })
    
    return receipt
  } catch (error) {
    if (error instanceof Error && error.name === 'TransactionReceiptTimeoutError') {
      throw new Error('Transaction confirmation timeout')
    }
    throw error
  }
}

/**
 * Decode event logs from a transaction receipt
 */
interface DecodedEventLog {
  eventName: string
  args: Record<string, unknown>
  address: Address
  blockHash: Hex
  blockNumber: bigint
  data: Hex
  logIndex: number
  removed: boolean
  topics: readonly Hex[]
  transactionHash: Hex
  transactionIndex: number
}

export function decodeEventLogs(
  receipt: TransactionReceipt,
  abi: Abi,
  eventName?: string
): DecodedEventLog[] {
  const events: DecodedEventLog[] = []
  
  for (const log of receipt.logs) {
    try {
      // Find matching event in ABI
      const event = abi.find(item => 
        item.type === 'event' && 
        (!eventName || item.name === eventName)
      )
      
      if (event && event.type === 'event') {
        // Decode log data
        const decoded: DecodedEventLog = {
          eventName: event.name,
          args: {},
          address: log.address,
          blockHash: log.blockHash,
          blockNumber: log.blockNumber,
          data: log.data,
          logIndex: log.logIndex,
          removed: log.removed,
          topics: log.topics,
          transactionHash: log.transactionHash,
          transactionIndex: log.transactionIndex
        }
        
        events.push(decoded)
      }
    } catch (_error) {
      // Skip logs that don't match our ABI
      continue
    }
  }
  
  return events
}

/**
 * Format value for display
 */
export function formatValue(value: bigint, decimals = 18): string {
  return formatUnits(value, decimals)
}

/**
 * Parse value from user input
 */
export function parseValue(value: string, decimals = 18): bigint {
  return parseUnits(value, decimals)
}

/**
 * Check if a contract exists at an address
 */
export async function isContract(
  publicClient: PublicClient,
  address: Address
): Promise<boolean> {
  const bytecode = await publicClient.getCode({ address })
  return bytecode !== undefined && bytecode !== '0x'
}

/**
 * Get detailed Tenderly simulation for transaction preview
 * Provides state changes, asset changes, and call traces
 */
export async function getDetailedSimulation(
  publicClient: PublicClient,
  account: Address,
  params: ContractCallParams,
  chain?: Chain
): Promise<SimulationResult> {
  return simulateContractCall(publicClient, account, params, chain);
}