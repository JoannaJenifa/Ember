import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'

// POST /api/orders - Create an order after on-chain tx
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      onchainOrderId,
      buyerAddress,
      sellerId,
      productId,
      quantity,
      totalPriceVery,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingMemo,
      txHash,
      streamId,
    } = body

    // Validate required fields
    if (!onchainOrderId || !buyerAddress || !txHash) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Try to find seller by wallet address if we have it
    // Note: sellerId from subgraph is on-chain ID, not Supabase UUID
    // We'll store seller info via wallet lookup
    let supabaseSellerId: string | null = null

    // If sellerId looks like a wallet address, look it up
    // Otherwise we skip the FK relationship
    if (sellerId && sellerId.startsWith('0x')) {
      const { data: seller } = await supabase
        .from('labang_sellers')
        .select('id')
        .eq('wallet_address', sellerId)
        .single()
      supabaseSellerId = seller?.id || null
    }

    // For products, the subgraph uses on-chain IDs (numbers)
    // The Supabase labang_products table may or may not have matching data
    // We'll skip the FK for now as products are on-chain
    const supabaseProductId: string | null = null

    // Insert order into database
    const { data: order, error } = await supabase
      .from('labang_orders')
      .insert({
        onchain_order_id: onchainOrderId,
        buyer_address: buyerAddress,
        seller_id: supabaseSellerId,
        product_id: supabaseProductId,
        stream_id: streamId || null,
        quantity: quantity || 1,
        total_price_very: totalPriceVery,
        status: 'pending',
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        tx_hash: txHash,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create order:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('POST /api/orders error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

// GET /api/orders - Get orders for a buyer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buyerAddress = searchParams.get('buyerAddress')

    if (!buyerAddress) {
      return NextResponse.json(
        { success: false, error: 'buyerAddress required' },
        { status: 400 }
      )
    }

    const { data: orders, error } = await supabase
      .from('labang_orders')
      .select('*')
      .eq('buyer_address', buyerAddress)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error('GET /api/orders error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
