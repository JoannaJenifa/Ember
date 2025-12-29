// Subgraph service for querying on-chain data
import {
  GET_SELLER_BY_WALLET,
  GET_SELLER_BY_ID,
  GET_ALL_SELLERS,
  GET_ACTIVE_SELLERS,
  GET_SELLERS_BY_CATEGORY,
  type SubgraphSeller,
} from '@/lib/graphql/seller-queries'
import {
  GET_PRODUCT_BY_ID,
  GET_PRODUCTS_BY_SELLER,
  GET_ALL_PRODUCTS,
  GET_ACTIVE_PRODUCTS,
  GET_PRODUCTS_BY_CATEGORY,
  type SubgraphProduct,
} from '@/lib/graphql/product-queries'

// NEXT_PUBLIC_INDEXER_URL is required - validated by env-config.ts
const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL!
const SUBGRAPH_URL = `${INDEXER_URL}/subgraphs/name/labang`

interface SubgraphResponse<T> {
  data?: T
  errors?: Array<{ message: string }>
}

async function querySubgraph<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(SUBGRAPH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Subgraph error: ${response.statusText}`)
  }

  const result: SubgraphResponse<T> = await response.json()

  if (result.errors?.length) {
    throw new Error(result.errors[0].message)
  }

  if (!result.data) {
    throw new Error('No data returned from subgraph')
  }

  return result.data
}

// Seller queries
export async function getSellerByWallet(wallet: string): Promise<SubgraphSeller | null> {
  const data = await querySubgraph<{ sellers: SubgraphSeller[] }>(GET_SELLER_BY_WALLET, {
    wallet: wallet.toLowerCase(),
  })
  return data.sellers[0] || null
}

export async function getSellerById(id: string): Promise<SubgraphSeller | null> {
  const data = await querySubgraph<{ seller: SubgraphSeller | null }>(GET_SELLER_BY_ID, { id })
  return data.seller
}

export async function getAllSellers(
  first = 20,
  skip = 0,
  where?: Record<string, unknown>
): Promise<SubgraphSeller[]> {
  const data = await querySubgraph<{ sellers: SubgraphSeller[] }>(GET_ALL_SELLERS, {
    first,
    skip,
    where,
  })
  return data.sellers
}

export async function getActiveSellers(first = 20, skip = 0): Promise<SubgraphSeller[]> {
  const data = await querySubgraph<{ sellers: SubgraphSeller[] }>(GET_ACTIVE_SELLERS, {
    first,
    skip,
  })
  return data.sellers
}

export async function getSellersByCategory(
  category: string,
  first = 20,
  skip = 0
): Promise<SubgraphSeller[]> {
  const data = await querySubgraph<{ sellers: SubgraphSeller[] }>(GET_SELLERS_BY_CATEGORY, {
    category,
    first,
    skip,
  })
  return data.sellers
}

// Product queries
export async function getProductById(id: string): Promise<SubgraphProduct | null> {
  const data = await querySubgraph<{ product: SubgraphProduct | null }>(GET_PRODUCT_BY_ID, { id })
  return data.product
}

export async function getProductsBySeller(
  sellerId: string,
  first = 50,
  skip = 0
): Promise<SubgraphProduct[]> {
  const data = await querySubgraph<{ products: SubgraphProduct[] }>(GET_PRODUCTS_BY_SELLER, {
    sellerId,
    first,
    skip,
  })
  return data.products
}

export async function getAllProducts(
  first = 50,
  skip = 0,
  where?: Record<string, unknown>
): Promise<SubgraphProduct[]> {
  const data = await querySubgraph<{ products: SubgraphProduct[] }>(GET_ALL_PRODUCTS, {
    first,
    skip,
    where,
  })
  return data.products
}

export async function getActiveProducts(first = 50, skip = 0): Promise<SubgraphProduct[]> {
  const data = await querySubgraph<{ products: SubgraphProduct[] }>(GET_ACTIVE_PRODUCTS, {
    first,
    skip,
  })
  return data.products
}

export async function getProductsByCategory(
  category: string,
  first = 50,
  skip = 0
): Promise<SubgraphProduct[]> {
  const data = await querySubgraph<{ products: SubgraphProduct[] }>(GET_PRODUCTS_BY_CATEGORY, {
    category,
    first,
    skip,
  })
  return data.products
}

// Re-export types
export type { SubgraphSeller, SubgraphProduct }
