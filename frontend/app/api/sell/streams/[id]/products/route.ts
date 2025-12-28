import { NextRequest, NextResponse } from 'next/server'
import { labangStreamService } from '@/lib/services/labang-stream-service'
import { getProductById } from '@/lib/services/subgraph'
import { fetchMetadata } from '@/lib/utils/ipfs'
import type { ProductMetadata, ProductWithSeller } from '@/lib/types/product'

interface RouteParams {
  params: Promise<{ id: string }>
}

export interface StreamProductWithDetails {
  product_id: string
  display_order: number
  is_featured: boolean
  special_price_very: number | null
  product: ProductWithSeller | null
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    // Get stream product mappings from Supabase
    const streamProducts = await labangStreamService.getStreamProducts(id)

    // Fetch full product details from subgraph for each product
    const productsWithDetails: StreamProductWithDetails[] = await Promise.all(
      streamProducts
        .filter((sp) => sp.product_id)
        .map(async (sp) => {
        try {
          const product = await getProductById(sp.product_id!)

          if (!product) {
            return {
              product_id: sp.product_id!,
              display_order: sp.display_order ?? 0,
              is_featured: sp.is_featured ?? false,
              special_price_very: sp.special_price_very ?? null,
              product: null,
            }
          }

          // Fetch IPFS metadata
          const metadata = await fetchMetadata<ProductMetadata>(product.metadataURI)

          const productWithSeller: ProductWithSeller = {
            ...product,
            description: metadata?.description,
            descriptionKo: metadata?.descriptionKo,
            images: metadata?.images,
            specifications: metadata?.specifications,
          }

          return {
            product_id: sp.product_id!,
            display_order: sp.display_order ?? 0,
            is_featured: sp.is_featured ?? false,
            special_price_very: sp.special_price_very ?? null,
            product: productWithSeller,
          }
        } catch (error) {
          console.error(`Failed to fetch product ${sp.product_id}:`, error)
          return {
            product_id: sp.product_id!,
            display_order: sp.display_order ?? 0,
            is_featured: sp.is_featured ?? false,
            special_price_very: sp.special_price_very ?? null,
            product: null,
          }
        }
      })
    )

    return NextResponse.json(
      { data: productsWithDetails },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    console.error('Failed to fetch stream products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stream products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { productId, displayOrder, specialPriceVery, isFeatured } = body

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    const product = await labangStreamService.addProduct({
      stream_id: id,
      product_id: productId,
      display_order: displayOrder ?? 0,
      special_price_very: specialPriceVery ?? null,
      is_featured: isFeatured ?? false,
    })

    return NextResponse.json({ data: product })
  } catch (error) {
    console.error('Failed to add product to stream:', error)
    return NextResponse.json(
      { error: 'Failed to add product to stream' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 })
    }

    await labangStreamService.removeProduct(id, productId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to remove product from stream:', error)
    return NextResponse.json(
      { error: 'Failed to remove product from stream' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await request.json()
    const { products } = body // Array of { productId, displayOrder }

    if (!products || !Array.isArray(products)) {
      return NextResponse.json(
        { error: 'products array is required' },
        { status: 400 }
      )
    }

    // Update display order for each product
    for (const { productId, displayOrder } of products) {
      await labangStreamService.removeProduct(id, productId)
      await labangStreamService.addProduct({
        stream_id: id,
        product_id: productId,
        display_order: displayOrder,
      })
    }

    // Fetch updated products with full details
    const streamProducts = await labangStreamService.getStreamProducts(id)
    const productsWithDetails = await Promise.all(
      streamProducts
        .filter((sp) => sp.product_id)
        .map(async (sp) => {
        const product = await getProductById(sp.product_id!)
        if (!product) return { ...sp, product: null }

        const metadata = await fetchMetadata<ProductMetadata>(product.metadataURI)
        return {
          ...sp,
          product: {
            ...product,
            description: metadata?.description,
            descriptionKo: metadata?.descriptionKo,
            images: metadata?.images,
            specifications: metadata?.specifications,
          },
        }
      })
    )

    return NextResponse.json({ data: productsWithDetails })
  } catch (error) {
    console.error('Failed to reorder products:', error)
    return NextResponse.json(
      { error: 'Failed to reorder products' },
      { status: 500 }
    )
  }
}
