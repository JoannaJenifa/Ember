// Product types - now sourced from subgraph

// Re-export SubgraphProduct type
export type { SubgraphProduct } from '@/lib/graphql/product-queries'

// Input type for creating/editing products
export interface CreateProductInput {
  title: string
  titleKo: string
  description: string
  descriptionKo: string
  images: string[]
  priceVery: string // Keep as string for proper decimal input handling
  inventory: number
  category: CategoryId
}

// Metadata fetched from IPFS
export interface ProductMetadata {
  description?: string
  descriptionKo?: string
  images?: string[]
  specifications?: Record<string, string>
}

// Extended seller type for product display
export interface ProductSeller {
  id: string
  wallet: string
  shopName: string
  // Optional display properties
  shopNameKo?: string
  description?: string
  kycVerified?: boolean
}

// Extended product type with seller info and IPFS metadata
export interface ProductWithSeller {
  id: string
  seller: ProductSeller
  title: string
  titleKo?: string
  category: string
  priceVery: string
  inventory: string | number
  metadataURI: string
  isActive: boolean
  createdAt: string
  totalSold: string
  // Rating and reviews (optional, aggregated data)
  rating?: number
  reviewCount?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviews?: any[]
  // IPFS metadata (optional, populated when fetched)
  description?: string
  descriptionKo?: string
  images?: string[]
  specifications?: Record<string, string>
}

// Filters for product queries
export interface ProductFilters {
  sellerId?: string
  category?: string
  search?: string
  limit?: number
  offset?: number
  activeOnly?: boolean
}

// ProductDetail type alias for detail pages
export type ProductDetail = ProductWithSeller

// Product categories
export const PRODUCT_CATEGORIES = [
  'beauty',
  'fashion',
  'food',
  'electronics',
  'home',
  'other',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
export type CategoryId = ProductCategory

export const CATEGORY_LABELS: Record<ProductCategory, { en: string; ko: string }> = {
  beauty: { en: 'Beauty', ko: '뷰티' },
  fashion: { en: 'Fashion', ko: '패션' },
  food: { en: 'Food', ko: '식품' },
  electronics: { en: 'Electronics', ko: '전자기기' },
  home: { en: 'Home', ko: '홈/리빙' },
  other: { en: 'Other', ko: '기타' },
}

// CATEGORIES as array of objects for use in components
export const CATEGORIES = PRODUCT_CATEGORIES.map((id) => ({
  id,
  label: CATEGORY_LABELS[id].ko,
  labelEn: CATEGORY_LABELS[id].en,
}))
