import { NextRequest, NextResponse } from 'next/server';

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud';

export async function POST(request: NextRequest) {
  if (!PINATA_JWT) {
    return NextResponse.json({ error: 'PINATA_JWT not configured' }, { status: 500 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create form data for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    pinataFormData.append(
      'pinataMetadata',
      JSON.stringify({ name: name || file.name })
    );

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: pinataFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata error:', error);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;

    return NextResponse.json({
      ipfsHash,
      ipfsUrl: `ipfs://${ipfsHash}`,
      gatewayUrl: `https://${PINATA_GATEWAY}/ipfs/${ipfsHash}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
