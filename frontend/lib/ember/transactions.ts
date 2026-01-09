import { aptos } from '@/lib/aptos';
import {
  generateSigningMessageForTransaction,
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
} from '@aptos-labs/ts-sdk';
import { isShinamiEnabled, submitSponsoredTransaction } from '@/lib/shinami/client';

export type SignRawHashFunction = (
  hash: string,
  options?: { address?: string }
) => Promise<string>;

export interface TransactionContext {
  isPrivy: boolean;
  signRawHash?: SignRawHashFunction;
  publicKeyHex?: string | null;
  signAndSubmitTransaction?: (payload: unknown) => Promise<{ hash: string }>;
  /** Force disable gas sponsorship for this transaction */
  disableSponsorship?: boolean;
}

/**
 * Build entry function arguments for Move calls
 */
export function toHex(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Sign and submit SPONSORED transaction using Privy + Shinami Gas Station API
 * User pays $0 gas - Shinami sponsors the transaction via server-side API
 */
export async function signAndSubmitSponsoredWithPrivy(
  walletAddress: string,
  functionId: string,
  typeArgs: string[],
  args: unknown[],
  signRawHash: SignRawHashFunction,
  publicKeyHex: string
): Promise<string> {
  const [moduleAddr, moduleName, funcName] = functionId.split('::');

  // Build fee-payer transaction (Shinami will pay gas)
  const rawTxn = await aptos.transaction.build.simple({
    sender: walletAddress,
    withFeePayer: true,
    data: {
      function: `${moduleAddr}::${moduleName}::${funcName}`,
      typeArguments: typeArgs,
      functionArguments: args,
    },
  });

  // Generate signing message for sender
  const signingMessage = generateSigningMessageForTransaction(rawTxn);
  const messageHex = Buffer.from(signingMessage).toString('hex');

  // Sign via Privy
  const signatureHex = await signRawHash(messageHex, { address: walletAddress });

  // Clean up keys/signatures
  let cleanPubKey = publicKeyHex.startsWith('0x') ? publicKeyHex.slice(2) : publicKeyHex;
  // Handle Ed25519 public key with prefix byte (66 hex chars = 33 bytes, need 64 hex chars = 32 bytes)
  if (cleanPubKey.length === 66) {
    cleanPubKey = cleanPubKey.slice(2);
  }
  const cleanSig = signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex;

  // Build sender authenticator
  const publicKey = new Ed25519PublicKey(cleanPubKey);
  const signature = new Ed25519Signature(cleanSig);
  const senderAuth = new AccountAuthenticatorEd25519(publicKey, signature);

  // Serialize for API call (must serialize entire SimpleTransaction for feePayer txns)
  const rawTxnHex = rawTxn.bcsToHex().toString();
  const senderAuthHex = senderAuth.bcsToHex().toString();

  // Submit via server-side API (Shinami sponsors and submits)
  const txHash = await submitSponsoredTransaction(rawTxnHex, senderAuthHex);

  // Wait for transaction completion
  await aptos.waitForTransaction({ transactionHash: txHash });
  return txHash;
}

/**
 * Sign and submit transaction using Privy embedded wallet (user pays gas)
 */
export async function signAndSubmitWithPrivy(
  walletAddress: string,
  functionId: string,
  typeArgs: string[],
  args: unknown[],
  signRawHash: SignRawHashFunction,
  publicKeyHex: string
): Promise<string> {
  const [moduleAddr, moduleName, funcName] = functionId.split('::');

  const rawTxn = await aptos.transaction.build.simple({
    sender: walletAddress,
    data: {
      function: `${moduleAddr}::${moduleName}::${funcName}`,
      typeArguments: typeArgs,
      functionArguments: args,
    },
  });

  const signingMessage = generateSigningMessageForTransaction(rawTxn);
  const messageHex = Buffer.from(signingMessage).toString('hex');

  const signatureHex = await signRawHash(messageHex, { address: walletAddress });

  let cleanPubKey = publicKeyHex.startsWith('0x') ? publicKeyHex.slice(2) : publicKeyHex;
  // Handle Ed25519 public key with prefix byte (66 hex chars = 33 bytes, need 64 hex chars = 32 bytes)
  if (cleanPubKey.length === 66) {
    cleanPubKey = cleanPubKey.slice(2);
  }
  const cleanSig = signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex;

  const publicKey = new Ed25519PublicKey(cleanPubKey);
  const signature = new Ed25519Signature(cleanSig);
  const authenticator = new AccountAuthenticatorEd25519(publicKey, signature);

  const pendingTxn = await aptos.transaction.submit.simple({
    transaction: rawTxn,
    senderAuthenticator: authenticator,
  });

  await aptos.waitForTransaction({ transactionHash: pendingTxn.hash });
  return pendingTxn.hash;
}

/**
 * Sign and submit transaction using native wallet adapter
 */
export async function signAndSubmitWithNative(
  functionId: string,
  typeArgs: string[],
  args: unknown[],
  signAndSubmitTransaction: (payload: unknown) => Promise<{ hash: string }>
): Promise<string> {
  const [moduleAddr, moduleName, funcName] = functionId.split('::');

  const result = await signAndSubmitTransaction({
    data: {
      function: `${moduleAddr}::${moduleName}::${funcName}`,
      typeArguments: typeArgs,
      functionArguments: args,
    },
  });

  await aptos.waitForTransaction({ transactionHash: result.hash });
  return result.hash;
}

/**
 * Universal transaction submitter that handles Privy, native wallets, and gas sponsorship
 *
 * Priority:
 * 1. Privy + Shinami Gas Station (gasless, best UX) - via server API
 * 2. Privy without sponsorship (user pays gas)
 * 3. Native wallet adapter (user pays gas)
 */
export async function submitTransaction(
  walletAddress: string,
  functionId: string,
  typeArgs: string[],
  args: unknown[],
  context: TransactionContext
): Promise<string> {
  // Privy embedded wallet flow
  if (context.isPrivy && context.signRawHash && context.publicKeyHex) {
    // Check if sponsorship is available and not disabled
    const useSponsorship = !context.disableSponsorship && (await isShinamiEnabled());

    if (useSponsorship) {
      // Gasless transaction via Shinami server API
      return signAndSubmitSponsoredWithPrivy(
        walletAddress,
        functionId,
        typeArgs,
        args,
        context.signRawHash,
        context.publicKeyHex
      );
    }
    // User pays gas
    return signAndSubmitWithPrivy(
      walletAddress,
      functionId,
      typeArgs,
      args,
      context.signRawHash,
      context.publicKeyHex
    );
  }

  // Native wallet adapter flow
  if (context.signAndSubmitTransaction) {
    return signAndSubmitWithNative(functionId, typeArgs, args, context.signAndSubmitTransaction);
  }

  throw new Error('No signing method available');
}
