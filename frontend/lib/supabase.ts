import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Server-side only Supabase client
// Use this in API routes only, never in client components

function createSupabaseClient(): SupabaseClient<Database> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    console.error('Missing Supabase environment variables:', {
      SUPABASE_URL: url ? 'set' : 'missing',
      SUPABASE_KEY: key ? 'set' : 'missing',
    });
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  }

  return createClient<Database>(url, key);
}

// Lazy initialization to avoid errors during build
let _supabase: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    _supabase = createSupabaseClient();
  }
  return _supabase;
}

// For backwards compatibility
export const supabase = {
  from: (table: string) => getSupabase().from(table as any),
};

// === Type exports for API responses ===

export type Stream = Database['public']['Tables']['ember_streams']['Row'];
export type ChatMessage = Database['public']['Tables']['ember_chat_messages']['Row'];

export type StreamInsert = Database['public']['Tables']['ember_streams']['Insert'];
export type ChatMessageInsert = Database['public']['Tables']['ember_chat_messages']['Insert'];
