import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

export const MOVEMENT_CONFIGS = {
  mainnet: {
    chainId: 126,
    fullnode: 'https://full.mainnet.movementinfra.xyz/v1',
    explorer: 'mainnet',
  },
  testnet: {
    chainId: 250,
    fullnode: 'https://testnet.movementnetwork.xyz/v1',
    explorer: 'testnet',
  },
};

export const CURRENT_NETWORK = 'testnet' as keyof typeof MOVEMENT_CONFIGS;

const fullnodeUrl = MOVEMENT_CONFIGS[CURRENT_NETWORK].fullnode;

export const aptos = new Aptos(
  new AptosConfig({
    network: Network.CUSTOM,
    fullnode: fullnodeUrl,
  })
);

// Ember contract address on Movement testnet
export const EMBER_ADDRESS = '0xb0179ef93bc9d50fdf656fe60846202e074cb181dc13a2d61554161ffc4988bb';

export const getExplorerUrl = (txHash: string): string => {
  const network = MOVEMENT_CONFIGS[CURRENT_NETWORK].explorer;
  const formatted = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
  return `https://explorer.movementnetwork.xyz/txn/${formatted}?network=${network}`;
};

export const getAccountExplorerUrl = (address: string): string => {
  const network = MOVEMENT_CONFIGS[CURRENT_NETWORK].explorer;
  const formatted = address.startsWith('0x') ? address : `0x${address}`;
  return `https://explorer.movementnetwork.xyz/account/${formatted}?network=${network}`;
};

export const formatMoveAmount = (amount: bigint | number, decimals = 8): string => {
  const value = typeof amount === 'bigint' ? Number(amount) : amount;
  return (value / Math.pow(10, decimals)).toFixed(4);
};

export const toHex = (buffer: Uint8Array): string => {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};
