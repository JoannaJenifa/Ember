import { NextRequest, NextResponse } from 'next/server'

// NEXT_PUBLIC_INDEXER_URL is required - validated by env-config.ts
const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL!
const SUBGRAPH_URL = `${INDEXER_URL}/subgraphs/name/labang`

// GET /api/subgraph/tips - Fetch tips from subgraph (real on-chain data)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const streamerAddress = searchParams.get('streamer')
    const fromAddress = searchParams.get('from')
    const first = parseInt(searchParams.get('first') || '50')

    // Build where clause
    const whereConditions: string[] = []
    if (streamerAddress) {
      whereConditions.push(`streamer: "${streamerAddress.toLowerCase()}"`)
    }
    if (fromAddress) {
      whereConditions.push(`from: "${fromAddress.toLowerCase()}"`)
    }

    const whereClause = whereConditions.length > 0
      ? `where: { ${whereConditions.join(', ')} }`
      : ''

    const query = `
      query GetTips {
        tips(
          first: ${first}
          orderBy: createdAt
          orderDirection: desc
          ${whereClause}
        ) {
          id
          from
          streamer
          amount
          message
          createdAt
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
    const tips = (result.data?.tips || []).map((tip: any) => {
      // Use Number division to preserve decimals (BigInt truncates)
      const amountVery = Number(tip.amount) / 1e18
      return {
        ...tip,
        amountFormatted: amountVery < 0.0001 ? amountVery.toFixed(6) : amountVery < 1 ? amountVery.toFixed(4) : amountVery.toFixed(2),
        amountVery,
        createdAtDate: new Date(parseInt(tip.createdAt) * 1000).toISOString(),
      }
    })

    return NextResponse.json({ success: true, data: tips })
  } catch (error) {
    console.error('Subgraph tips error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch tips' },
      { status: 500 }
    )
  }
}
