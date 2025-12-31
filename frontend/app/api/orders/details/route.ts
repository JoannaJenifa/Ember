import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// POST /api/orders/details - Store sensitive order data
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const {
      tx_hash,
      buyer_address,
      seller_address,
      product_id,
      quantity,
      total_price,
      shipping_name,
      shipping_phone,
      shipping_address,
      shipping_city,
      shipping_postal_code,
      shipping_notes,
    } = body;

    if (!tx_hash || !buyer_address || !seller_address || !product_id) {
      return NextResponse.json(
        { error: 'tx_hash, buyer_address, seller_address, and product_id are required' },
        { status: 400 }
      );
    }

    if (!shipping_name || !shipping_phone || !shipping_address || !shipping_city) {
      return NextResponse.json(
        { error: 'Shipping name, phone, address, and city are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('ember_order_details')
      .insert({
        tx_hash,
        buyer_address,
        seller_address,
        product_id,
        quantity: quantity || 1,
        total_price,
        shipping_name,
        shipping_phone,
        shipping_address,
        shipping_city,
        shipping_postal_code: shipping_postal_code || null,
        shipping_notes: shipping_notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to store order details:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data });
  } catch (err) {
    console.error('POST /api/orders/details error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
