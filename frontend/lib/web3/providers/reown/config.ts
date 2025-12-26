/**
 * Reown/Wagmi Configuration
 * VeryChain only
 */

import { http, createConfig } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { verychain } from '@/constants/chains/verychain'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const wagmiConfig = createConfig({
  chains: [verychain],
  connectors: [
    injected(),
    walletConnect({ projectId }),
  ],
  transports: {
    [verychain.id]: http('/api/rpc/verychain'),
  },
  ssr: true,
})

export const supportedChains = [verychain] as const

export function getSupportedChainIds(): number[] {
  return supportedChains.map((c) => c.id)
}
