import { NextRequest, NextResponse } from 'next/server'
import { labangStreamService } from '@/lib/services/labang-stream-service'
import { supabase } from '@/lib/db/supabase'

// Find or create seller in Supabase by wallet address
async function findOrCreateSeller(walletAddress: string, shopName?: string, category?: string) {
  // Try to find existing seller
  const { data: existingSeller } = await supabase
    .from('labang_sellers')
    .select('id')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single()

  if (existingSeller) {
    return existingSeller.id
  }

  // Create new seller with minimal data (will be updated from subgraph)
  const { data: newSeller, error } = await supabase
    .from('labang_sellers')
    .insert({
      wallet_address: walletAddress.toLowerCase(),
      shop_name: shopName || 'Seller',
      category: category || 'general',
    })
    .select('id')
    .single()

  if (error) throw error
  return newSeller.id
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('walletAddress')
  const status = searchParams.get('status') as 'scheduled' | 'live' | 'ended' | null
  const limit = searchParams.get('limit')
  const offset = searchParams.get('offset')

  if (!walletAddress) {
    return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 })
  }

  try {
    // Find seller by wallet address
    const { data: seller } = await supabase
      .from('labang_sellers')
      .select('id')
      .eq('wallet_address', walletAddress.toLowerCase())
      .single()

    if (!seller) {
      return NextResponse.json({ data: [], count: 0 })
    }

    const { data, count } = await labangStreamService.getAll({
      sellerId: seller.id,
      status: status || undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    })

    return NextResponse.json(
      { data, count },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=15, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch streams:', error)
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, shopName, category, title, titleKo, thumbnail, scheduledAt, productIds, youtubeUrl } = body

    if (!walletAddress || !title) {
      return NextResponse.json(
        { error: 'walletAddress and title are required' },
        { status: 400 }
      )
    }

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      )
    }

    // Find or create seller in Supabase
    const sellerId = await findOrCreateSeller(walletAddress, shopName, category)

    // Create stream directly in database with YouTube URL
    const stream = await labangStreamService.create({
      seller_id: sellerId,
      title,
      title_ko: titleKo || null,
      thumbnail: thumbnail || null,
      scheduled_at: scheduledAt || null,
      youtube_url: youtubeUrl,
      status: 'live', // YouTube streams are already live
      viewer_count: 0,
      peak_viewers: 0,
    })

    // Add products to stream if provided
    if (stream && productIds && productIds.length > 0) {
      for (let i = 0; i < productIds.length; i++) {
        await labangStreamService.addProduct({
          stream_id: stream.id,
          product_id: productIds[i],
          display_order: i,
        })
      }
    }

    return NextResponse.json({ data: stream })
  } catch (error) {
    console.error('Failed to create stream:', error)
    return NextResponse.json({ error: 'Failed to create stream' }, { status: 500 })
  }
}
