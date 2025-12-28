import { NextRequest, NextResponse } from 'next/server'

const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL
const SUBGRAPH_URL = `${INDEXER_URL}/subgraphs/name/labang`

const CHECK_SHOP_NAME_QUERY = `
  query CheckShopName($shopName: String!) {
    sellers(where: { shopName: $shopName }, first: 1) {
      id
      shopName
    }
  }
`

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const name = searchParams.get('name')

  if (!name || name.length < 2) {
    return NextResponse.json({ available: true })
  }

  if (!INDEXER_URL) {
    // If no indexer configured, assume available (will be checked on-chain during registration)
    return NextResponse.json({ available: true })
  }

  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: CHECK_SHOP_NAME_QUERY,
        variables: { shopName: name },
      }),
    })

    if (!response.ok) {
      // Subgraph unavailable, assume available
      return NextResponse.json({ available: true })
    }

    const result = await response.json()

    if (result.errors) {
      return NextResponse.json({ available: true })
    }

    const sellers = result.data?.sellers || []
    const available = sellers.length === 0

    return NextResponse.json({ available })
  } catch {
    // On error, assume available (will be validated on-chain)
    return NextResponse.json({ available: true })
  }
}
