import { NextRequest, NextResponse } from 'next/server'
import { pinFileToIPFS, getIPFSUrl } from '@/lib/web3/pinata'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Upload to IPFS via Pinata
    const result = await pinFileToIPFS(file, file.name, {
      pinataMetadata: {
        name: file.name,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          type: 'seller-image',
        },
      },
    })

    const url = getIPFSUrl(result.IpfsHash)

    return NextResponse.json({
      url,
      hash: result.IpfsHash,
      size: result.PinSize,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
