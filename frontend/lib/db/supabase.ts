import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY! // Service role key

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Type aliases for Labang tables (off-chain only)
// Note: sellers, products, orders, rewards, daily_earnings are now on-chain via subgraph

// Product type alias - compatible with ProductWithSeller for UI components
export interface LabangProduct {
  id: string
  title: string
  titleKo?: string
  description?: string
  descriptionKo?: string
  images?: string[]
  category: string
  priceVery: string
  inventory: string | number
  isActive: boolean
  sellerId?: string
  metadataURI?: string
  createdAt?: string
  totalSold?: string
  seller?: {
    id: string
    wallet: string
    shopName: string
    shopNameKo?: string
    description?: string
    kycVerified?: boolean
  }
}

// Order type alias - now references subgraph order type
export interface LabangOrder {
  id: string
  productId: string
  buyerAddress: string
  sellerAddress: string
  quantity: number
  totalPriceVery: string
  status: string
  txHash?: string
  createdAt: string
}

export type LabangSeller = Database['public']['Tables']['labang_sellers']['Row']
export type LabangSellerInsert = Database['public']['Tables']['labang_sellers']['Insert']
export type LabangSellerUpdate = Database['public']['Tables']['labang_sellers']['Update']

export type LabangStream = Database['public']['Tables']['labang_streams']['Row']
export type LabangStreamInsert = Database['public']['Tables']['labang_streams']['Insert']
export type LabangStreamUpdate = Database['public']['Tables']['labang_streams']['Update']

// Note: product_id is on-chain ID from subgraph, not a Supabase UUID
export type LabangStreamProduct = Database['public']['Tables']['labang_stream_products']['Row']
export type LabangStreamProductInsert = Database['public']['Tables']['labang_stream_products']['Insert']
export type LabangStreamProductUpdate = Database['public']['Tables']['labang_stream_products']['Update']

export type LabangReview = Database['public']['Tables']['labang_reviews']['Row']
export type LabangReviewInsert = Database['public']['Tables']['labang_reviews']['Insert']
export type LabangReviewUpdate = Database['public']['Tables']['labang_reviews']['Update']

export type LabangChatMessage = Database['public']['Tables']['labang_chat_messages']['Row']
export type LabangChatMessageInsert = Database['public']['Tables']['labang_chat_messages']['Insert']
export type LabangChatMessageUpdate = Database['public']['Tables']['labang_chat_messages']['Update']

export type LabangWatchSession = Database['public']['Tables']['labang_watch_sessions']['Row']
export type LabangWatchSessionInsert = Database['public']['Tables']['labang_watch_sessions']['Insert']
export type LabangWatchSessionUpdate = Database['public']['Tables']['labang_watch_sessions']['Update']

// Gift history types (may not be in generated types yet)
export interface LabangGiftHistory {
  id: string
  stream_id: string | null
  from_address: string
  to_address: string
  gift_id: string | null
  gift_name: string | null
  quantity: number
  value_very: number
  type: 'gift' | 'tip'
  message: string | null
  tx_hash: string | null
  created_at: string
}

export type LabangGiftHistoryInsert = Omit<LabangGiftHistory, 'id' | 'created_at'>

// Table names for reference (off-chain tables only)
export const LABANG_TABLES = {
  streams: 'labang_streams',
  streamProducts: 'labang_stream_products',
  reviews: 'labang_reviews',
  chatMessages: 'labang_chat_messages',
  giftHistory: 'labang_gift_history',
  watchSessions: 'labang_watch_sessions',
  rewards: 'labang_rewards',
  dailyEarnings: 'labang_daily_earnings',
} as const
