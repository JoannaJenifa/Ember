import { NextRequest, NextResponse } from 'next/server'
import { getSellerByWallet, getSellerById } from '@/lib/services/subgraph'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Try to fetch by wallet address first (most common case from sellers page)
    // If it looks like a wallet address (0x...), use getSellerByWallet
    // Otherwise try getSellerById
    let seller = null

    if (id.startsWith('0x')) {
      seller = await getSellerByWallet(id)
    } else {
      seller = await getSellerById(id)
    }

    if (!seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    // Transform subgraph data to match LabangSeller format expected by frontend
    const transformedSeller = {
      id: seller.id,
      wallet_address: seller.wallet,
      shop_name: seller.shopName,
      shop_name_ko: parseMetadata(seller.metadataURI).shopNameKo || null,
      category: seller.category || 'fashion',
      description: parseMetadata(seller.metadataURI).description || null,
      profile_image: parseMetadata(seller.metadataURI).profileImage || null,
      banner_image: parseMetadata(seller.metadataURI).bannerImage || null,
      kyc_verified: seller.isActive,
      is_active: seller.isActive,
      total_sales: seller.totalSales,
      total_orders: seller.totalOrders,
      created_at: new Date(Number(seller.createdAt) * 1000).toISOString(),
    }

    return NextResponse.json(transformedSeller)
  } catch (error) {
    console.error('Error fetching seller:', error)
    return NextResponse.json(
      { error: 'Failed to fetch seller' },
      { status: 500 }
    )
  }
}

function parseMetadata(metadataURI: string): {
  shopNameKo?: string
  description?: string
  profileImage?: string
  bannerImage?: string
} {
  if (!metadataURI) return {}
  try {
    return JSON.parse(metadataURI)
  } catch {
    return {}
  }
}
