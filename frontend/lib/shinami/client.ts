/**
 * Shinami Gas Station client for sponsored transactions on Movement
 *
 * This module provides gasless transaction support using Shinami's Gas Station API.
 * Users don't pay gas fees - the platform sponsors all transactions.
 */

import { GasStationClient } from '@shinami/clients/aptos';

// Shinami API configuration (server-side keys should use SHINAMI_ prefix without NEXT_PUBLIC_)
const SHINAMI_GAS_KEY = process.env.NEXT_PUBLIC_SHINAMI_GAS_KEY || '';

// Validate configuration
export function isShinamiConfigured(): boolean {
  return !!SHINAMI_GAS_KEY;
}

// Gas Station client singleton
let gasStationClient: GasStationClient | null = null;

export function getGasStationClient(): GasStationClient {
  if (!gasStationClient) {
    if (!SHINAMI_GAS_KEY) {
      throw new Error('NEXT_PUBLIC_SHINAMI_GAS_KEY not configured');
    }
    gasStationClient = new GasStationClient(SHINAMI_GAS_KEY);
  }
  return gasStationClient;
}

// Get Shinami Node RPC endpoint for Movement
export function getShinamiNodeUrl(): string | null {
  const nodeKey = process.env.NEXT_PUBLIC_SHINAMI_NODE_KEY;
  if (!nodeKey) return null;
  return `https://api.shinami.com/node/v1/${nodeKey}`;
}

// Export for type checking
export { GasStationClient };
