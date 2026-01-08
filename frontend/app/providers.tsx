'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WalletProvider } from '@/components/wallet-provider';
import { Toaster } from '@/components/ui/sonner';
import { createContext, useContext, ReactNode } from 'react';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
export const isPrivyConfigured = !!(PRIVY_APP_ID && PRIVY_APP_ID !== 'YOUR_PRIVY_APP_ID');

const PrivyAvailableContext = createContext<boolean>(false);
export const usePrivyAvailable = () => useContext(PrivyAvailableContext);

interface MockPrivyContextType {
  ready: boolean;
  authenticated: boolean;
  user: null;
  login: () => void;
  logout: () => Promise<void>;
}

const MockPrivyContext = createContext<MockPrivyContextType>({
  ready: true,
  authenticated: false,
  user: null,
  login: () => {},
  logout: async () => {},
});

export const useMockPrivy = () => useContext(MockPrivyContext);

interface MockCreateWalletContextType {
  createWallet: () => Promise<null>;
}

const MockCreateWalletContext = createContext<MockCreateWalletContextType>({
  createWallet: async () => null,
});

export const useMockCreateWallet = () => useContext(MockCreateWalletContext);

export function Providers({ children }: { children: ReactNode }) {
  if (!isPrivyConfigured) {
    return (
      <PrivyAvailableContext.Provider value={false}>
        <MockPrivyContext.Provider value={{
          ready: true,
          authenticated: false,
          user: null,
          login: () => console.warn('Privy not configured'),
          logout: async () => {},
        }}>
          <MockCreateWalletContext.Provider value={{ createWallet: async () => null }}>
            <WalletProvider>
              {children}
              <Toaster />
            </WalletProvider>
          </MockCreateWalletContext.Provider>
        </MockPrivyContext.Provider>
      </PrivyAvailableContext.Provider>
    );
  }

  return (
    <PrivyAvailableContext.Provider value={true}>
      <WalletProvider>
        <PrivyProvider
          appId={PRIVY_APP_ID!}
          config={{
            loginMethods: ['email'],
            appearance: {
              theme: 'dark',
              accentColor: '#FF5C33',
              logo: '/logo.png',
            },
          }}
        >
          {children}
          <Toaster />
        </PrivyProvider>
      </WalletProvider>
    </PrivyAvailableContext.Provider>
  );
}
