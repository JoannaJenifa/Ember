import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ sellerAddress: string }>;
}

// GET /api/orders/seller/[sellerAddress] - Get order details for a seller
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { sellerAddress } = await params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('ember_order_details')
      .select('*')
      .eq('seller_address', sellerAddress)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data });
  } catch (err) {
    console.error('GET /api/orders/seller/[sellerAddress] error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
