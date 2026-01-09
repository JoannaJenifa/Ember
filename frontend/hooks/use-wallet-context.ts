'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useMemo, useCallback } from 'react';
import { usePrivyAvailable, useMockPrivy } from '@/app/providers';

export type SignRawHashFunction = (hash: string, options?: { address?: string }) => Promise<string>;

export interface WalletContext {
  walletAddress: string | null;
  isPrivy: boolean;
  isConnected: boolean;
  isReady: boolean;
  publicKeyHex: string | null;
  signAndSubmitTransaction: ((payload: unknown) => Promise<{ hash: string }>) | null;
  login: () => void;
  logout: () => Promise<void>;
}

export function useWalletContext(): WalletContext {
  const isPrivyAvailable = usePrivyAvailable();
  const mockPrivy = useMockPrivy();

  const privyHook = isPrivyAvailable ? usePrivy() : null;
  const { account, connected, signAndSubmitTransaction: nativeSignAndSubmit, disconnect, wallets, connect } = useWallet();

  // Native wallet login - connect to first available wallet
  const nativeLogin = useCallback(() => {
    if (wallets && wallets.length > 0) {
      connect(wallets[0].name);
    } else {
      console.warn('No wallets available. Please install a wallet extension.');
    }
  }, [wallets, connect]);

  return useMemo(() => {
    const ready = isPrivyAvailable ? privyHook?.ready ?? true : mockPrivy.ready;
    const authenticated = isPrivyAvailable ? privyHook?.authenticated ?? false : false;
    const user = isPrivyAvailable ? privyHook?.user : null;
    const login = isPrivyAvailable ? privyHook?.login ?? (() => {}) : nativeLogin;
    const privyLogout = isPrivyAvailable ? privyHook?.logout ?? (async () => {}) : mockPrivy.logout;

    const privyWallet = user?.linkedAccounts?.find(
      (acc: unknown) => (acc as { chainType?: string }).chainType === 'aptos'
    ) as { address?: string; publicKey?: string } | undefined;

    const isPrivyConnected = authenticated && !!privyWallet;
    const isNativeConnected = connected && !!account?.address;
    const isPrivy = isPrivyConnected;

    const walletAddress = isPrivyConnected
      ? privyWallet?.address ?? null
      : isNativeConnected
      ? account?.address.toString() ?? null
      : null;

    let publicKeyHex: string | null = null;
    if (isPrivy && privyWallet?.publicKey) {
      const keyHex = privyWallet.publicKey;
      publicKeyHex = keyHex.startsWith('0x') ? keyHex : `0x${keyHex}`;
    }

    const handleLogout = async () => {
      if (isPrivy) {
        await privyLogout();
      } else if (isNativeConnected) {
        await disconnect();
      }
    };

    return {
      walletAddress,
      isPrivy,
      isConnected: isPrivyConnected || isNativeConnected,
      isReady: ready,
      publicKeyHex,
      signAndSubmitTransaction: !isPrivy && isNativeConnected
        ? (nativeSignAndSubmit as (payload: unknown) => Promise<{ hash: string }>)
        : null,
      login,
      logout: handleLogout,
    };
  }, [isPrivyAvailable, privyHook, mockPrivy, nativeLogin, connected, account, nativeSignAndSubmit, disconnect]);
}
