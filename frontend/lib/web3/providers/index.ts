/**
 * Auth Provider Switcher
 *
 * This file exports the active auth provider.
 * All protocol pages import from '@/lib/web3' which re-exports from here.
 *
 * Current provider: REOWN
 * - Supports Movement blockchain via custom chain config
 * - WalletConnect and social login options
 */

// Active provider indicator
export const AUTH_PROVIDER = 'reown' as const;

// =============================================================================
// ACTIVE PROVIDER: REOWN
// =============================================================================

// Core Hooks
export { useAccount, useIsSmartAccount } from './reown/account';
export { usePublicClient, useWalletClient } from './reown/clients';
export { useChainId, useSwitchChain, useChains } from './reown/chain';
export { useBalance } from './reown/balance';
export { useSendTransaction, useWaitForTransaction, useGasPrice } from './reown/transaction';
export { useReadContract, useWriteContract } from './reown/contract';
export { useConnect, useDisconnect } from './reown/connection';
export { useEnsName, useEnsAvatar } from './reown/ens';
export { useSignMessage, useSignTypedData } from './reown/signature';

// Components
export { ConnectButton } from './reown/connect-button';

// Provider
export { Web3Provider } from './reown/web3-provider';

// Types
export type {
  Web3Account,
  UsePublicClientReturn,
  UseWalletClientReturn,
  UseSwitchChainReturn,
  UseChainsReturn,
  UseBalanceParams,
  UseBalanceReturn,
  Token,
  UseTokenParams,
  UseTokenReturn,
  TransactionRequest,
  UseSendTransactionReturn,
  UseWaitForTransactionParams,
  UseWaitForTransactionReturn,
  UseReadContractParams,
  UseReadContractReturn,
  UseWriteContractReturn,
  UseConnectReturn,
  UseDisconnectReturn,
  UseEnsNameParams,
  UseEnsNameReturn,
  UseEnsAvatarParams,
  UseEnsAvatarReturn,
  UseSignMessageReturn,
  UseSignTypedDataReturn,
} from './reown/types';
