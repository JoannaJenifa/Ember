'use client';

import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <AptosWalletAdapterProvider autoConnect={true}>
      {children}
    </AptosWalletAdapterProvider>
  );
}
