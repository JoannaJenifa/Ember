/**
 * Shinami Gas Station Client for Ember
 * Provides gasless transaction sponsorship for user transactions
 * Uses the recommended flow: Sign first, then sponsor+submit on backend
 *
 * Flow:
 * 1. Build feePayer transaction on frontend (with 0x0 placeholder)
 * 2. User signs the transaction FIRST
 * 3. Send signed tx to backend
 * 4. Backend calls gas_sponsorAndSubmitSignedTransaction (sponsors, sets fee payer, submits)
 */

import {
  AccountAuthenticator,
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  generateSigningMessageForTransaction,
  SimpleTransaction,
} from '@aptos-labs/ts-sdk';
import { aptos, toHex } from '../aptos';

export interface SignRawHashFunction {
  (params: { address: string; chainType: 'aptos'; hash: `0x${string}` }): Promise<{
    signature: string;
  }>;
}

export interface SponsorAndSubmitResult {
  success: boolean;
  hash?: string;
  error?: string;
}

// Cache for sponsorship availability check
let sponsorshipEnabled: boolean | null = null;

/**
 * Check if Gas Station sponsorship is available (server-side configured)
 */
export async function isSponsorshipEnabled(): Promise<boolean> {
  if (sponsorshipEnabled !== null) {
    return sponsorshipEnabled;
  }

  try {
    const response = await fetch('/api/shinami/sponsor');
    const data = await response.json();
    sponsorshipEnabled = data.enabled === true;
    return sponsorshipEnabled;
  } catch {
    sponsorshipEnabled = false;
    return false;
  }
}

/**
 * Send signed transaction to backend for sponsorship and submission
 * Backend uses gas_sponsorAndSubmitSignedTransaction
 */
async function sponsorAndSubmitSignedTransaction(
  rawTransaction: SimpleTransaction,
  senderAuthenticator: AccountAuthenticator
): Promise<SponsorAndSubmitResult> {
  try {
    // Serialize transaction and authenticator to hex
    const rawTxHex = rawTransaction.bcsToHex().toString();
    const senderAuthenticatorHex = senderAuthenticator.bcsToHex().toString();

    const response = await fetch('/api/shinami/sponsor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawTxHex, senderAuthenticatorHex }),
    });

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Sponsorship and submission failed',
      };
    }

    return {
      success: true,
      hash: result.hash,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown sponsorship error',
    };
  }
}

/**
 * Build, sign, sponsor, and submit a transaction with Shinami Gas Station
 * For Privy wallets using signRawHash
 *
 * Follows recommended flow:
 * 1. Build feePayer tx (with 0x0 placeholder)
 * 2. User signs FIRST
 * 3. Backend sponsors and submits
 */
export async function sponsoredSubmit(
  walletAddress: string,
  functionId: `${string}::${string}::${string}`,
  args: (string | number | bigint | boolean)[],
  publicKeyHex: string,
  signRawHash: SignRawHashFunction
): Promise<string> {
  // 1. Build the transaction with fee payer enabled (uses 0x0 placeholder)
  const rawTxn = await aptos.transaction.build.simple({
    sender: walletAddress,
    data: {
      function: functionId,
      typeArguments: [],
      functionArguments: args,
    },
    withFeePayer: true,
  });

  // 2. Generate signing message and get user signature FIRST
  const message = generateSigningMessageForTransaction(rawTxn);
  const messageHex = `0x${toHex(message)}` as `0x${string}`;
  const { signature: rawSignature } = await signRawHash({
    address: walletAddress,
    chainType: 'aptos',
    hash: messageHex,
  });

  // 3. Create sender authenticator
  let cleanPublicKey = publicKeyHex.startsWith('0x') ? publicKeyHex.slice(2) : publicKeyHex;
  if (cleanPublicKey.length === 66) {
    cleanPublicKey = cleanPublicKey.slice(2);
  }

  const senderAuthenticator = new AccountAuthenticatorEd25519(
    new Ed25519PublicKey(cleanPublicKey),
    new Ed25519Signature(
      rawSignature.startsWith('0x') ? rawSignature.slice(2) : rawSignature
    )
  );

  // 4. Send to backend for sponsorship and submission
  const result = await sponsorAndSubmitSignedTransaction(rawTxn, senderAuthenticator);

  if (!result.success || !result.hash) {
    throw new Error(result.error || 'Sponsored submission failed');
  }

  // 5. Wait for transaction confirmation
  const executed = await aptos.waitForTransaction({ transactionHash: result.hash });
  if (!executed.success) {
    throw new Error('Sponsored transaction failed on-chain');
  }

  return result.hash;
}

/**
 * Reset the cached sponsorship status (useful for testing)
 */
export function resetSponsorshipCache(): void {
  sponsorshipEnabled = null;
}

// Backwards compatibility aliases
export const isShinamiEnabled = isSponsorshipEnabled;

/**
 * Legacy function for submitting sponsored transactions
 * Used by lib/ember/transactions.ts
 */
export async function submitSponsoredTransaction(
  rawTxnHex: string,
  senderAuthHex: string
): Promise<string> {
  const response = await fetch('/api/shinami/sponsor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rawTxHex: rawTxnHex, senderAuthenticatorHex: senderAuthHex }),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Sponsorship failed');
  }

  return result.hash;
}
