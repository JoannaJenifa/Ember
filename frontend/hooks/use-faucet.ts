import { useState } from 'react';
import { aptos, EMBER_ADDRESS } from '@/lib/aptos';
import { useWalletContext } from './use-wallet-context';
import { sponsoredSubmit, isSponsorshipEnabled } from '@/lib/shinami/client';
import {
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  generateSigningMessageForTransaction,
} from '@aptos-labs/ts-sdk';
import { toHex } from '@/lib/aptos';

export type MintStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseFaucetReturn {
  mint: (amount: string) => Promise<string>;
  status: MintStatus;
  error: string | null;
  txHash: string | null;
  reset: () => void;
}

// tUSDC uses 6 decimals (like real USDC)
const TUSDC_DECIMALS = 6;

// Convert amount to smallest unit
const toSmallestUnit = (amount: string, decimals: number): bigint => {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(whole + paddedFraction);
};

export function useFaucet(): UseFaucetReturn {
  const [status, setStatus] = useState<MintStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { walletAddress, isPrivy, signRawHash, publicKeyHex, signAndSubmitTransaction } = useWalletContext();

  const reset = () => {
    setStatus('idle');
    setError(null);
    setTxHash(null);
  };

  // Fallback: user pays gas (Native wallet)
  const mintWithNativeWalletFallback = async (amount: string): Promise<string> => {
    if (!walletAddress || !signAndSubmitTransaction) {
      throw new Error('Wallet not connected');
    }

    const amountInSmallest = toSmallestUnit(amount, TUSDC_DECIMALS);

    const response = await signAndSubmitTransaction({
      sender: walletAddress,
      data: {
        function: `${EMBER_ADDRESS}::test_tokens::faucet`,
        functionArguments: [EMBER_ADDRESS, amountInSmallest.toString()],
      },
    });

    const executed = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    if (!executed.success) {
      throw new Error('Transaction failed');
    }

    return response.hash;
  };

  // Fallback: user pays gas (Privy wallet)
  const mintWithPrivyFallback = async (amount: string): Promise<string> => {
    if (!walletAddress || !signRawHash || !publicKeyHex) {
      throw new Error('Privy wallet not connected or missing signing function');
    }

    const amountInSmallest = toSmallestUnit(amount, TUSDC_DECIMALS);

    const rawTxn = await aptos.transaction.build.simple({
      sender: walletAddress,
      data: {
        function: `${EMBER_ADDRESS}::test_tokens::faucet`,
        typeArguments: [],
        functionArguments: [EMBER_ADDRESS, amountInSmallest.toString()],
      },
    });

    const message = generateSigningMessageForTransaction(rawTxn);

    const rawSignature = await signRawHash(`0x${toHex(message)}`, { address: walletAddress });

    let cleanPublicKey = publicKeyHex.startsWith('0x')
      ? publicKeyHex.slice(2)
      : publicKeyHex;

    if (cleanPublicKey.length === 66) {
      cleanPublicKey = cleanPublicKey.slice(2);
    }

    const senderAuthenticator = new AccountAuthenticatorEd25519(
      new Ed25519PublicKey(cleanPublicKey),
      new Ed25519Signature(
        rawSignature.startsWith('0x') ? rawSignature.slice(2) : rawSignature
      )
    );

    const committedTx = await aptos.transaction.submit.simple({
      transaction: rawTxn,
      senderAuthenticator,
    });

    const executed = await aptos.waitForTransaction({
      transactionHash: committedTx.hash,
    });

    if (!executed.success) {
      throw new Error('Transaction failed');
    }

    return committedTx.hash;
  };

  // Smart mint with Shinami Gas Station (Privy wallet)
  const mintWithPrivy = async (amount: string): Promise<string> => {
    if (!walletAddress || !signRawHash || !publicKeyHex) {
      throw new Error('Privy wallet not connected or missing signing function');
    }

    const amountInSmallest = toSmallestUnit(amount, TUSDC_DECIMALS);
    const functionId = `${EMBER_ADDRESS}::test_tokens::faucet` as `${string}::${string}::${string}`;

    const sponsorshipAvailable = await isSponsorshipEnabled();
    if (sponsorshipAvailable) {
      try {
        console.log('[Faucet] Using Shinami Gas Station (Privy)');

        // Need to wrap signRawHash to match Shinami's expected interface
        const shinamiSignRawHash = async (params: { address: string; chainType: 'aptos'; hash: `0x${string}` }) => {
          const signature = await signRawHash(params.hash, { address: params.address });
          return { signature };
        };

        return await sponsoredSubmit(
          walletAddress,
          functionId,
          [EMBER_ADDRESS, amountInSmallest.toString()],
          publicKeyHex,
          shinamiSignRawHash
        );
      } catch (error) {
        console.warn('[Faucet] Sponsored submission failed, falling back:', error);
      }
    }

    console.log('[Faucet] Using user-paid gas (Privy)');
    return mintWithPrivyFallback(amount);
  };

  // Smart mint with Shinami Gas Station (Native wallet)
  const mintWithNativeWallet = async (amount: string): Promise<string> => {
    if (!walletAddress || !signAndSubmitTransaction) {
      throw new Error('Wallet not connected');
    }

    // For native wallets, always use user-paid gas
    console.log('[Faucet] Using user-paid gas (Native)');
    return mintWithNativeWalletFallback(amount);
  };

  const mint = async (amount: string): Promise<string> => {
    try {
      setStatus('loading');
      setError(null);

      const hash = isPrivy
        ? await mintWithPrivy(amount)
        : await mintWithNativeWallet(amount);

      setTxHash(hash);
      setStatus('success');
      return hash;
    } catch (err) {
      console.error('Faucet error:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint tokens');
      setStatus('error');
      throw err;
    }
  };

  return { mint, status, error, txHash, reset };
}
