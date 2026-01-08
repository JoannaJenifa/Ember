import { aptos, EMBER_ADDRESS, SHINAMI_GAS_ENABLED } from '@/lib/aptos';
import {
  generateSigningMessageForTransaction,
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
} from '@aptos-labs/ts-sdk';
import { getGasStationClient, isShinamiConfigured } from '@/lib/shinami/client';

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
 * Sign and submit SPONSORED transaction using Privy embedded wallet + Shinami Gas Station
 * User pays $0 gas - Shinami sponsors the transaction
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
  const gasClient = getGasStationClient();

  // Build fee-payer transaction (Shinami will pay gas)
  const rawTxn = await aptos.transaction.build.simple({
    sender: walletAddress,
    withFeePayer: true, // Enable fee payer sponsorship
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
  const cleanPubKey = publicKeyHex.startsWith('0x') ? publicKeyHex.slice(2) : publicKeyHex;
  const cleanSig = signatureHex.startsWith('0x') ? signatureHex.slice(2) : signatureHex;

  // Build sender authenticator
  const publicKey = new Ed25519PublicKey(cleanPubKey);
  const signature = new Ed25519Signature(cleanSig);
  const senderAuth = new AccountAuthenticatorEd25519(publicKey, signature);

  // Shinami sponsors and submits the transaction
  const pendingTxn = await gasClient.sponsorAndSubmitSignedTransaction(rawTxn, senderAuth);

  // Wait for transaction completion
  const txHash = (pendingTxn as { hash: string }).hash;
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

  const cleanPubKey = publicKeyHex.startsWith('0x') ? publicKeyHex.slice(2) : publicKeyHex;
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
 * 1. Privy + Shinami Gas Station (gasless, best UX)
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
  const useSponsorship = SHINAMI_GAS_ENABLED && isShinamiConfigured() && !context.disableSponsorship;

  // Privy embedded wallet flow
  if (context.isPrivy && context.signRawHash && context.publicKeyHex) {
    if (useSponsorship) {
      // Gasless transaction via Shinami
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
