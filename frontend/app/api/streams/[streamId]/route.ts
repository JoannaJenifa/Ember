import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ streamId: string }>;
}

// GET /api/streams/[streamId] - Get a single stream
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { streamId } = await params;

  const { data, error } = await supabase
    .from('ember_streams')
    .select('*')
    .eq('id', streamId)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
  }

  return NextResponse.json({ stream: data });
}

// PATCH /api/streams/[streamId] - Update stream (featured products, end stream)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { streamId } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};

  if (body.featured_product_ids !== undefined) {
    updates.featured_product_ids = body.featured_product_ids;
  }

  if (body.is_live === false) {
    updates.is_live = false;
    updates.ended_at = new Date().toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('ember_streams')
    .update(updates)
    .eq('id', streamId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stream: data });
}

// DELETE /api/streams/[streamId] - End stream
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { streamId } = await params;

  const { data, error } = await supabase
    .from('ember_streams')
    .update({ is_live: false, ended_at: new Date().toISOString() })
    .eq('id', streamId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stream: data });
}
