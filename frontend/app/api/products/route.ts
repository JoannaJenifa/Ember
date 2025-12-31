import { NextRequest, NextResponse } from 'next/server'
import { getAllProducts, getProductsBySeller, getProductsByCategory } from '@/lib/services/subgraph'
import { fetchMetadata } from '@/lib/utils/ipfs'
import type { ProductWithSeller, ProductMetadata } from '@/lib/types/product'

// GET /api/products - Fetch products from subgraph with IPFS metadata
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sellerId = searchParams.get('sellerId')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const activeOnly = searchParams.get('activeOnly') !== 'false'

    // Build query based on filters
    let products
    if (sellerId) {
      products = await getProductsBySeller(sellerId, limit, offset)
    } else if (category) {
      products = await getProductsByCategory(category, limit, offset)
    } else {
      const where = activeOnly ? { isActive: true } : undefined
      products = await getAllProducts(limit, offset, where)
    }

    // Fetch IPFS metadata for each product
    const productsWithMetadata: ProductWithSeller[] = await Promise.all(
      products.map(async (product) => {
        const metadata = await fetchMetadata<ProductMetadata>(product.metadataURI)
        return {
          ...product,
          description: metadata?.description,
          descriptionKo: metadata?.descriptionKo,
          images: metadata?.images,
          specifications: metadata?.specifications,
        }
      })
    )

    // Filter by search term if provided
    let filteredProducts = productsWithMetadata
    if (search) {
      const searchLower = search.toLowerCase()
      filteredProducts = productsWithMetadata.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.descriptionKo?.includes(search)
      )
    }

    return NextResponse.json(
      { success: true, data: filteredProducts },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
