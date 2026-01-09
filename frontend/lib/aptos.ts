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
export const EMBER_ADDRESS = '0x1addd32869cedb5edef94f3ab1e1db481c16fb82baea80130c5683b53d4aee98';

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

// USDC uses 6 decimals
export const formatUsdcAmount = (amount: bigint | number): string => {
  const value = typeof amount === 'bigint' ? Number(amount) : amount;
  return (value / Math.pow(10, 6)).toFixed(2);
};

export const toHex = (buffer: Uint8Array): string => {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};
