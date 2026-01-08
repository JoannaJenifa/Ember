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

// Use Shinami Node Service if configured (optional - just for reliable RPC)
// Note: Node key is safe to expose client-side as it's just for read operations
const SHINAMI_NODE_KEY = process.env.NEXT_PUBLIC_SHINAMI_NODE_KEY;
const fullnodeUrl = SHINAMI_NODE_KEY
  ? `https://api.shinami.com/node/v1/${SHINAMI_NODE_KEY}`
  : MOVEMENT_CONFIGS[CURRENT_NETWORK].fullnode;

export const aptos = new Aptos(
  new AptosConfig({
    network: Network.CUSTOM,
    fullnode: fullnodeUrl,
  })
);

export const EMBER_ADDRESS = process.env.NEXT_PUBLIC_EMBER_ADDRESS || '0x1';

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
