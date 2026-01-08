import { NextRequest, NextResponse } from 'next/server';
import { GasStationClient } from '@shinami/clients/aptos';
import { AccountAuthenticator, Deserializer } from '@aptos-labs/ts-sdk';

// Server-side only - no NEXT_PUBLIC_ prefix
const SHINAMI_GAS_KEY = process.env.SHINAMI_GAS_KEY;

/**
 * POST /api/shinami/sponsor
 *
 * Sponsors a signed transaction using Shinami Gas Station.
 * User pays $0 gas - Shinami sponsors the transaction.
 *
 * Request body:
 * - rawTransaction: hex-encoded raw transaction bytes
 * - senderSignature: hex-encoded sender authenticator bytes
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Gas Station is configured
    if (!SHINAMI_GAS_KEY) {
      return NextResponse.json(
        { error: 'Gas sponsorship not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { rawTransaction, senderSignature } = body;

    if (!rawTransaction || !senderSignature) {
      return NextResponse.json(
        { error: 'Missing rawTransaction or senderSignature' },
        { status: 400 }
      );
    }

    // Initialize Gas Station client
    const gasClient = new GasStationClient(SHINAMI_GAS_KEY);

    // Deserialize the sender authenticator
    const sigBytes = hexToBytes(senderSignature);
    const senderAuth = AccountAuthenticator.deserialize(new Deserializer(sigBytes));

    // Parse raw transaction for the API
    const rawTxnHex = rawTransaction.startsWith('0x') ? rawTransaction : `0x${rawTransaction}`;

    // Sponsor and submit the transaction
    // The Gas Station will add fee payer signature and submit
    const pendingTxn = await gasClient.sponsorAndSubmitSignedTransaction(
      { rawTransaction: { bcsToHex: () => rawTxnHex } } as any,
      senderAuth
    );

    const txHash = (pendingTxn as { hash: string }).hash;

    return NextResponse.json({
      success: true,
      hash: txHash
    });

  } catch (error) {
    console.error('Shinami sponsor error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sponsorship failed' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/shinami/sponsor
 * Returns whether gas sponsorship is available
 */
export async function GET() {
  return NextResponse.json({
    enabled: !!SHINAMI_GAS_KEY,
  });
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}
