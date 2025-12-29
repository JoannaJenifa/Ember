// Order types - now sourced from subgraph
// TODO: Replace with subgraph query types

export const ORDER_STATUS_LABELS = {
  pending: { en: 'Pending', ko: '결제 대기' },
  paid: { en: 'Paid', ko: '결제 완료' },
  shipped: { en: 'Shipped', ko: '배송 중' },
  delivered: { en: 'Delivered', ko: '배송 완료' },
  disputed: { en: 'Disputed', ko: '분쟁 중' },
  refunded: { en: 'Refunded', ko: '환불됨' },
  cancelled: { en: 'Cancelled', ko: '취소됨' },
} as const

export const ORDER_STATUS_COLORS = {
  pending: 'text-yellow-600 border-yellow-600/50',
  paid: 'text-blue-600 border-blue-600/50',
  shipped: 'text-purple-600 border-purple-600/50',
  delivered: 'text-green-600 border-green-600/50',
  disputed: 'text-red-600 border-red-600/50',
  refunded: 'text-gray-600 border-gray-600/50',
  cancelled: 'text-gray-600 border-gray-600/50',
} as const

export type OrderStatus = keyof typeof ORDER_STATUS_LABELS

// On-chain order status enum (matches contract)
export type OnchainOrderStatus = 0 | 1 | 2 | 3 | 4 // Pending, Shipped, Delivered, Disputed, Refunded

// On-chain order type (from contract)
export interface OnchainOrder {
  buyer: `0x${string}`
  seller: `0x${string}`
  amount: bigint
  productId: bigint
  createdAt: bigint
  status: OnchainOrderStatus
}

// Subgraph order type
export interface SubgraphOrder {
  id: string
  buyer: string
  seller: {
    id: string
    wallet: string
    shopName: string
  }
  product: {
    id: string
    title: string
    metadataURI: string
  }
  quantity: string
  priceVery: string
  totalVery: string
  status: OrderStatus
  createdAt: string
  txHash: string
  blockNumber: string
}

// Shipping information for orders
export interface ShippingInfo {
  name: string
  phone: string
  address: string
  memo?: string
}

// Order with all details including shipping (Supabase data)
export interface OrderWithDetails extends SubgraphOrder {
  // Shipping info from Supabase
  shipping?: ShippingInfo
  shipping_name?: string
  shipping_phone?: string
  shipping_address?: string
  shipping_memo?: string
  tracking_number?: string
  // Additional Supabase fields
  onchain_order_id?: string
  buyer_address?: string
  total_price_very?: string
  // Metadata from IPFS (for display)
  productImage?: string
  productDescription?: string
}

// Note: ProductDetail is exported from './product' to avoid duplication
