import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ streamId: string }>;
}

// GET /api/streams/[streamId]/chat - Get chat messages
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { streamId } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '100');
  const since = searchParams.get('since'); // Message ID to fetch messages after

  let query = supabase
    .from('ember_chat_messages')
    .select('*')
    .eq('stream_id', streamId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (since) {
    // Get the timestamp of the 'since' message and fetch newer ones
    const { data: sinceMsg } = await supabase
      .from('ember_chat_messages')
      .select('created_at')
      .eq('id', since)
      .single();

    if (sinceMsg) {
      query = query.gt('created_at', sinceMsg.created_at);
    }
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}

// POST /api/streams/[streamId]/chat - Send a chat message
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { streamId } = await params;
  const body = await request.json();
  const { sender_address, sender_name, message, is_seller } = body;

  if (!sender_address || !message) {
    return NextResponse.json(
      { error: 'sender_address and message are required' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('ember_chat_messages')
    .insert({
      stream_id: streamId,
      sender_address,
      sender_name: sender_name || null,
      message,
      is_seller: is_seller || false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: data });
}
