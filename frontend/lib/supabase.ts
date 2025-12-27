import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Server-side only Supabase client
// Use this in API routes only, never in client components
export const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// === Type exports for API responses ===

export type Stream = Database['public']['Tables']['ember_streams']['Row'];
export type ChatMessage = Database['public']['Tables']['ember_chat_messages']['Row'];

export type StreamInsert = Database['public']['Tables']['ember_streams']['Insert'];
export type ChatMessageInsert = Database['public']['Tables']['ember_chat_messages']['Insert'];
