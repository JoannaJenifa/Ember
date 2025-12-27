import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ sellerAddress: string }>;
}

// GET /api/streams/seller/[sellerAddress] - Get active stream for seller
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { sellerAddress } = await params;

  const { data, error } = await supabase
    .from('ember_streams')
    .select('*')
    .eq('seller_address', sellerAddress)
    .eq('is_live', true)
    .single();

  if (error) {
    // No active stream is not an error
    return NextResponse.json({ stream: null });
  }

  return NextResponse.json({ stream: data });
}
