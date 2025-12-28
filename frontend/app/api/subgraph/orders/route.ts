import { NextRequest, NextResponse } from 'next/server'

// NEXT_PUBLIC_INDEXER_URL is required - validated by env-config.ts
const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL!
const SUBGRAPH_URL = `${INDEXER_URL}/subgraphs/name/labang`

// GET /api/subgraph/orders - Fetch orders from subgraph (real on-chain data)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const buyerAddress = searchParams.get('buyer')
    const sellerAddress = searchParams.get('seller')
    const status = searchParams.get('status')
    const first = parseInt(searchParams.get('first') || '50')

    // Build where clause
    const whereConditions: string[] = []
    if (buyerAddress) {
      whereConditions.push(`buyer: "${buyerAddress.toLowerCase()}"`)
    }
    if (sellerAddress) {
      whereConditions.push(`seller: "${sellerAddress.toLowerCase()}"`)
    }
    if (status) {
      whereConditions.push(`status: ${status}`)
    }

    const whereClause = whereConditions.length > 0
      ? `where: { ${whereConditions.join(', ')} }`
      : ''

    const query = `
      query GetOrders {
        orders(
          first: ${first}
          orderBy: createdAt
          orderDirection: desc
          ${whereClause}
        ) {
          id
          buyer
          seller
          productId
          amount
          status
          createdAt
          confirmedAt
          releasedAmount
          txHash
          blockNumber
        }
      }
    `

    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Subgraph error: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Subgraph query failed')
    }

    // Transform amounts from wei to formatted values
    const orders = (result.data?.orders || []).map((order: any) => {
      // Convert wei to VERY with proper decimal handling
      const amountVery = Number(order.amount) / 1e18
      const releasedVery = order.releasedAmount ? Number(order.releasedAmount) / 1e18 : null

      return {
        ...order,
        amountFormatted: amountVery < 0.001 ? amountVery.toFixed(6) : amountVery < 1 ? amountVery.toFixed(4) : amountVery.toFixed(2),
        releasedAmountFormatted: releasedVery !== null
          ? (releasedVery < 0.001 ? releasedVery.toFixed(6) : releasedVery < 1 ? releasedVery.toFixed(4) : releasedVery.toFixed(2))
          : null,
        createdAtDate: new Date(parseInt(order.createdAt) * 1000).toISOString(),
        confirmedAtDate: order.confirmedAt
          ? new Date(parseInt(order.confirmedAt) * 1000).toISOString()
          : null,
      }
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error('Subgraph orders error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
