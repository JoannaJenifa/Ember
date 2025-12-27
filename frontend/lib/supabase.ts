import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// === Stream Types ===

export interface Stream {
  id: string;
  seller_address: string;
  youtube_url: string;
  featured_product_ids: number[];
  is_live: boolean;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  stream_id: string;
  sender_address: string;
  sender_name: string | null;
  message: string;
  is_seller: boolean;
  created_at: string;
}

// === Stream Functions ===

export async function createStream(
  sellerAddress: string,
  youtubeUrl: string,
  featuredProductIds: number[]
): Promise<Stream | null> {
  // End any existing live streams for this seller
  await supabase
    .from('ember_streams')
    .update({ is_live: false, ended_at: new Date().toISOString() })
    .eq('seller_address', sellerAddress)
    .eq('is_live', true);

  const { data, error } = await supabase
    .from('ember_streams')
    .insert({
      seller_address: sellerAddress,
      youtube_url: youtubeUrl,
      featured_product_ids: featuredProductIds,
      is_live: true,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create stream:', error);
    return null;
  }
  return data;
}

export async function endStream(streamId: string): Promise<boolean> {
  const { error } = await supabase
    .from('ember_streams')
    .update({ is_live: false, ended_at: new Date().toISOString() })
    .eq('id', streamId);

  if (error) {
    console.error('Failed to end stream:', error);
    return false;
  }
  return true;
}

export async function getActiveStream(sellerAddress: string): Promise<Stream | null> {
  const { data, error } = await supabase
    .from('ember_streams')
    .select('*')
    .eq('seller_address', sellerAddress)
    .eq('is_live', true)
    .single();

  if (error) return null;
  return data;
}

export async function getStreamById(streamId: string): Promise<Stream | null> {
  const { data, error } = await supabase
    .from('ember_streams')
    .select('*')
    .eq('id', streamId)
    .single();

  if (error) return null;
  return data;
}

export async function getAllLiveStreams(): Promise<Stream[]> {
  const { data, error } = await supabase
    .from('ember_streams')
    .select('*')
    .eq('is_live', true)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch live streams:', error);
    return [];
  }
  return data || [];
}

export async function updateFeaturedProducts(
  streamId: string,
  productIds: number[]
): Promise<boolean> {
  const { error } = await supabase
    .from('ember_streams')
    .update({ featured_product_ids: productIds })
    .eq('id', streamId);

  if (error) {
    console.error('Failed to update featured products:', error);
    return false;
  }
  return true;
}

// === Chat Functions ===

export async function sendChatMessage(
  streamId: string,
  senderAddress: string,
  senderName: string | null,
  message: string,
  isSeller: boolean
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('ember_chat_messages')
    .insert({
      stream_id: streamId,
      sender_address: senderAddress,
      sender_name: senderName,
      message,
      is_seller: isSeller,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to send message:', error);
    return null;
  }
  return data;
}

export async function getChatMessages(
  streamId: string,
  limit = 100
): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('ember_chat_messages')
    .select('*')
    .eq('stream_id', streamId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch messages:', error);
    return [];
  }
  return data || [];
}

// === Realtime Subscriptions ===

export function subscribeToChat(
  streamId: string,
  onMessage: (message: ChatMessage) => void
) {
  return supabase
    .channel(`chat:${streamId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ember_chat_messages',
        filter: `stream_id=eq.${streamId}`,
      },
      (payload) => {
        onMessage(payload.new as ChatMessage);
      }
    )
    .subscribe();
}
