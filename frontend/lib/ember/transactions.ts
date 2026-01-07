import { aptos, EMBER_ADDRESS } from '@/lib/aptos';
import {
  generateSigningMessageForTransaction,
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  RawTransaction,
  TransactionPayloadEntryFunction,
  EntryFunction,
  ModuleId,
  Identifier,
} from '@aptos-labs/ts-sdk';

export type SignRawHashFunction = (
  hash: string,
  options?: { address?: string }
) => Promise<string>;

export interface TransactionContext {
  isPrivy: boolean;
  signRawHash?: SignRawHashFunction;
  publicKeyHex?: string | null;
  signAndSubmitTransaction?: (payload: unknown) => Promise<{ hash: string }>;
}

/**
 * Build entry function arguments for Move calls
 */
export function toHex(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * Sign and submit transaction using Privy embedded wallet
 */
export async function signAndSubmitWithPrivy(
  walletAddress: string,
  functionId: string,
  typeArgs: string[],
  args: unknown[],
  signRawHash: SignRawHashFunction,
  publicKeyHex: string
): Promise<string> {
  // Parse function ID (e.g., "0x1::module::function")
  const [moduleAddr, moduleName, funcName] = functionId.split('::');

  // Build the raw transaction
  const rawTxn = await aptos.transaction.build.simple({
    sender: walletAddress,
    data: {
      function: `${moduleAddr}::${moduleName}::${funcName}`,
      typeArguments: typeArgs,
      functionArguments: args,
    },
  });

  // Generate signing message
  const signingMessage = generateSigningMessageForTransaction(rawTxn);
  const messageHex = Buffer.from(signingMessage).toString('hex');

  // Sign via Privy
  const signatureHex = await signRawHash(messageHex, { address: walletAddress });

  // Remove 0x prefix if present
  const cleanPubKey = publicKeyHex.startsWith('0x')
    ? publicKeyHex.slice(2)
    : publicKeyHex;
  const cleanSig = signatureHex.startsWith('0x')
    ? signatureHex.slice(2)
    : signatureHex;

  // Build authenticator
  const publicKey = new Ed25519PublicKey(cleanPubKey);
  const signature = new Ed25519Signature(cleanSig);
  const authenticator = new AccountAuthenticatorEd25519(publicKey, signature);

  // Submit and wait
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
 * Universal transaction submitter that handles both Privy and native wallets
 */
export async function submitTransaction(
  walletAddress: string,
  functionId: string,
  typeArgs: string[],
  args: unknown[],
  context: TransactionContext
): Promise<string> {
  if (context.isPrivy && context.signRawHash && context.publicKeyHex) {
    return signAndSubmitWithPrivy(
      walletAddress,
      functionId,
      typeArgs,
      args,
      context.signRawHash,
      context.publicKeyHex
    );
  } else if (context.signAndSubmitTransaction) {
    return signAndSubmitWithNative(
      functionId,
      typeArgs,
      args,
      context.signAndSubmitTransaction
    );
  }
  throw new Error('No signing method available');
}
