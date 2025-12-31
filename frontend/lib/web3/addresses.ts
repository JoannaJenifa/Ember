import type { Address } from 'viem'

// Contract addresses organized by chain ID and categorized by type
// VeryChain only - all other testnets have been removed
export const ADDRESSES: Record<number, {
  erc20: Record<string, Address>
  erc721: Record<string, Address>
  other: Record<string, Address>
}> = {
  // VeryChain Mainnet - Labang Contracts (uses native currency - VERY)
  4613: {
    erc20: {},
    erc721: {},
    other: {
      SellerRegistry: '0xa7e5175e571D6B7391658F1E35120290C38E26a4',
      ProductRegistry: '0xb7f3d139128D54E6F994Bcf0DE88d5Da8D1c71d2',
      OrderEscrow: '0xE54FB90AFad32c87B45b5E8e20Cc0E02080bf7F5',
      ReviewRegistry: '0x57887E6362c69635de9FEb88627A91c0207061C5',
      TipJar: '0x2927b1f7C76AA9302621fC3dee30B024ab11d677',
      GiftShop: '0xA846E4D57cDB3077ED67E5d792949F7A6ef2a75d',
    },
  },
} as const

// Helper function to get contract address by type and name
export function getContractAddress(chainId: number, type: 'erc20' | 'erc721' | 'other', contractName: string): Address | undefined {
  return ADDRESSES[chainId]?.[type]?.[contractName]
}

// Helper function to get all ERC20 tokens for a chain
export function getERC20Tokens(chainId: number): Record<string, Address> {
  return ADDRESSES[chainId]?.erc20 || {}
}

// Helper function to get all ERC721 collections for a chain
export function getERC721Collections(chainId: number): Record<string, Address> {
  return ADDRESSES[chainId]?.erc721 || {}
}

// Helper function to get all other contracts for a chain
export function getOtherContracts(chainId: number): Record<string, Address> {
  return ADDRESSES[chainId]?.other || {}
}

// Helper function to get all addresses for a chain (legacy support)
export function getChainAddresses(chainId: number): { erc20: Record<string, Address>, erc721: Record<string, Address>, other: Record<string, Address> } | undefined {
  return ADDRESSES[chainId]
}

// Helper function to check if contract is deployed on chain
export function isContractDeployed(chainId: number, type: 'erc20' | 'erc721' | 'other', contractName: string): boolean {
  const address = getContractAddress(chainId, type, contractName)
  return address !== undefined && address !== '0x0000000000000000000000000000000000000000'
}
