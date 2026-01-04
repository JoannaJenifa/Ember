import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// GET /api/streams - List all live streams
export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('ember_streams')
      .select('*')
      .eq('is_live', true)
      .order('started_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ streams: data });
  } catch (err) {
    console.error('GET /api/streams error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/streams - Create a new stream
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { seller_address, youtube_url, featured_product_ids } = body;

    if (!seller_address || !youtube_url) {
      return NextResponse.json(
        { error: 'seller_address and youtube_url are required' },
        { status: 400 }
      );
    }

    // End any existing live streams for this seller
    await supabase
      .from('ember_streams')
      .update({ is_live: false, ended_at: new Date().toISOString() })
      .eq('seller_address', seller_address)
      .eq('is_live', true);

    // Create new stream
    const { data, error } = await supabase
      .from('ember_streams')
      .insert({
        seller_address,
        youtube_url,
        featured_product_ids: featured_product_ids || [],
        is_live: true,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stream: data });
  } catch (err) {
    console.error('POST /api/streams error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
