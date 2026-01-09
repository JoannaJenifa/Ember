'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WalletProvider } from '@/components/wallet-provider';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode, createContext, useContext } from 'react';
import {
  PrivyWalletContextProvider,
  NativeWalletContextProvider,
} from '@/hooks/use-wallet-context';

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
export const isPrivyConfigured = !!(PRIVY_APP_ID && PRIVY_APP_ID !== 'YOUR_PRIVY_APP_ID');

// Context to indicate if Privy is available (for components that need direct Privy access)
const PrivyAvailableContext = createContext<boolean>(false);
export const usePrivyAvailable = () => useContext(PrivyAvailableContext);

export function Providers({ children }: { children: ReactNode }) {
  if (!isPrivyConfigured) {
    return (
      <PrivyAvailableContext.Provider value={false}>
        <WalletProvider>
          <NativeWalletContextProvider>
            {children}
            <Toaster />
          </NativeWalletContextProvider>
        </WalletProvider>
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
          <PrivyWalletContextProvider>
            {children}
            <Toaster />
          </PrivyWalletContextProvider>
        </PrivyProvider>
      </WalletProvider>
    </PrivyAvailableContext.Provider>
  );
}
