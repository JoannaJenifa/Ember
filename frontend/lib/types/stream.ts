// Stream types for Ember live commerce

export interface LabangStream {
  id: string;
  seller_id: string;
  title: string;
  title_ko?: string | null;
  description?: string | null;
  status: 'scheduled' | 'live' | 'ended';
  scheduled_at?: string | null;
  started_at?: string | null;
  ended_at?: string | null;
  thumbnail?: string | null;
  youtube_url?: string | null;
  viewer_count: number;
  replay_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LabangSeller {
  id: string;
  wallet_address: string;
  shop_name: string;
  shop_name_ko?: string | null;
  description?: string | null;
  category?: number;
  profile_image?: string | null;
  is_verified?: boolean;
  total_sales?: number;
  total_orders?: number;
  rating_sum?: number;
  rating_count?: number;
  created_at: string;
}

export interface StreamWithSeller extends LabangStream {
  seller?: LabangSeller | null;
  category?: string;
}

export interface LabangReview {
  id: string;
  order_id: string;
  product_id: string;
  reviewer_address: string;
  rating: number;
  content: string;
  is_verified: boolean;
  tx_hash?: string | null;
  created_at: string;
}
