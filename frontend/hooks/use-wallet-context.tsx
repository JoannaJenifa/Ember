'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

export type SignRawHashFunction = (hash: string, options?: { address?: string }) => Promise<string>;

export interface WalletContextType {
  walletAddress: string | null;
  isPrivy: boolean;
  isConnected: boolean;
  isReady: boolean;
  publicKeyHex: string | null;
  signRawHash: SignRawHashFunction | null;
  signAndSubmitTransaction: ((payload: unknown) => Promise<{ hash: string }>) | null;
  login: () => void;
  logout: () => Promise<void>;
}

const defaultContext: WalletContextType = {
  walletAddress: null,
  isPrivy: false,
  isConnected: false,
  isReady: false,
  publicKeyHex: null,
  signRawHash: null,
  signAndSubmitTransaction: null,
  login: () => {},
  logout: async () => {},
};

const WalletContextContext = createContext<WalletContextType>(defaultContext);

export function useWalletContext(): WalletContextType {
  return useContext(WalletContextContext);
}

// Provider for when Privy is available - calls Privy hooks
export function PrivyWalletContextProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout: privyLogout } = usePrivy();
  const { signRawHash: privySignRawHash } = useSignRawHash();
  const { account, connected, signAndSubmitTransaction: nativeSignAndSubmit, disconnect } = useWallet();

  const wrappedSignRawHash = useCallback(
    async (hash: string, options?: { address?: string }): Promise<string> => {
      if (!privySignRawHash) throw new Error('Privy signRawHash not available');
      const address = options?.address || '';
      const hashWithPrefix = hash.startsWith('0x') ? hash : `0x${hash}`;
      const result = await privySignRawHash({
        address,
        chainType: 'aptos',
        hash: hashWithPrefix as `0x${string}`,
      });
      return result.signature;
    },
    [privySignRawHash]
  );

  const value = useMemo(() => {
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
      signRawHash: isPrivy && privySignRawHash ? wrappedSignRawHash : null,
      signAndSubmitTransaction: !isPrivy && isNativeConnected
        ? (nativeSignAndSubmit as (payload: unknown) => Promise<{ hash: string }>)
        : null,
      login,
      logout: handleLogout,
    };
  }, [ready, authenticated, user, login, privyLogout, connected, account, nativeSignAndSubmit, disconnect, privySignRawHash, wrappedSignRawHash]);

  return (
    <WalletContextContext.Provider value={value}>
      {children}
    </WalletContextContext.Provider>
  );
}

// Provider for when Privy is NOT available - only native wallet
export function NativeWalletContextProvider({ children }: { children: ReactNode }) {
  const { account, connected, signAndSubmitTransaction: nativeSignAndSubmit, disconnect } = useWallet();

  const value = useMemo(() => {
    const isNativeConnected = connected && !!account?.address;
    const walletAddress = isNativeConnected ? account?.address.toString() ?? null : null;

    return {
      walletAddress,
      isPrivy: false,
      isConnected: isNativeConnected,
      isReady: true,
      publicKeyHex: null,
      signRawHash: null,
      signAndSubmitTransaction: isNativeConnected
        ? (nativeSignAndSubmit as (payload: unknown) => Promise<{ hash: string }>)
        : null,
      login: () => console.warn('Privy not configured'),
      logout: async () => {
        if (isNativeConnected) await disconnect();
      },
    };
  }, [connected, account, nativeSignAndSubmit, disconnect]);

  return (
    <WalletContextContext.Provider value={value}>
      {children}
    </WalletContextContext.Provider>
  );
}
