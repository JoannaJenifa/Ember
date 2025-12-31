import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/services/subgraph'
import { fetchMetadata } from '@/lib/utils/ipfs'
import type { ProductWithSeller, ProductMetadata } from '@/lib/types/product'

// GET /api/products/[id] - Fetch single product from subgraph
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await getProductById(id)

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Fetch IPFS metadata
    const metadata = await fetchMetadata<ProductMetadata>(product.metadataURI)

    const productWithMetadata: ProductWithSeller = {
      ...product,
      description: metadata?.description,
      descriptionKo: metadata?.descriptionKo,
      images: metadata?.images,
      specifications: metadata?.specifications,
    }

    return NextResponse.json({ success: true, data: productWithMetadata })
  } catch (error) {
    console.error('Product API error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
