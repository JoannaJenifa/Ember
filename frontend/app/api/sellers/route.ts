import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// GET /api/sellers - Get unique sellers from streams
export async function GET() {
  try {
    const supabase = getSupabase();

    // Get unique seller addresses from streams
    const { data, error } = await supabase
      .from('ember_streams')
      .select('seller_address')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get unique addresses
    const uniqueAddresses = [...new Set(data.map((s) => s.seller_address))];

    return NextResponse.json({ sellers: uniqueAddresses });
  } catch (err) {
    console.error('GET /api/sellers error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
