/**
 * Connection Hooks - Reown/Wagmi Implementation
 */

'use client'

import { useConnect as useWagmiConnect, useDisconnect as useWagmiDisconnect } from 'wagmi'
import type { UseConnectReturn, UseDisconnectReturn } from './types'

export function useConnect(): UseConnectReturn {
  const { connect, connectors, isPending, error } = useWagmiConnect()

  return {
    connect: () => {
      // Use injected connector (MetaMask, etc.) by default
      const injectedConnector = connectors.find((c) => c.id === 'injected')
      if (injectedConnector) {
        connect({ connector: injectedConnector })
      } else if (connectors.length > 0) {
        connect({ connector: connectors[0] })
      }
    },
    isPending,
    error: error || null,
  }
}

export function useDisconnect(): UseDisconnectReturn {
  const { disconnect, isPending } = useWagmiDisconnect()

  return {
    disconnect: () => disconnect(),
    isPending,
  }
}
