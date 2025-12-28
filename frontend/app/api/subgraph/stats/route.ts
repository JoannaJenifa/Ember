import { NextRequest, NextResponse } from 'next/server'

// NEXT_PUBLIC_INDEXER_URL is required - validated by env-config.ts
const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL!
const SUBGRAPH_URL = `${INDEXER_URL}/subgraphs/name/labang`

// GET /api/subgraph/stats - Fetch aggregated stats from subgraph
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const streamerAddress = searchParams.get('streamer')
    const sellerAddress = searchParams.get('seller')

    // Build filter for seller-specific orders
    const orderFilter = sellerAddress
      ? `(first: 1000, where: { seller: "${sellerAddress.toLowerCase()}" })`
      : '(first: 1000)'

    // Build filter for seller-specific tips (tips to seller as streamer)
    const tipFilter = sellerAddress
      ? `(first: 1000, where: { streamer: "${sellerAddress.toLowerCase()}" })`
      : '(first: 1000)'

    // Build filter for seller-specific gifts
    const giftFilter = sellerAddress
      ? `(first: 1000, where: { streamer: "${sellerAddress.toLowerCase()}" })`
      : '(first: 1000)'

    // Query for stats (optionally filtered by seller)
    const query = `
      query GetStats${streamerAddress ? '($streamer: ID!)' : ''} {
        orders${orderFilter} {
          id
          amount
          status
        }
        tips${tipFilter} {
          id
          amount
        }
        giftSents${giftFilter} {
          id
          totalValue
          quantity
        }
        reviews(first: 1000) {
          id
          rating
        }
        ${streamerAddress ? `
        streamerStats(id: $streamer) {
          id
          totalTips
          totalGifts
          tipCount
          giftCount
        }
        ` : ''}
        dailyVolumes(first: 30, orderBy: date, orderDirection: desc) {
          id
          date
          orderVolume
          tipVolume
          giftVolume
          orderCount
          tipCount
          giftCount
        }
      }
    `

    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: streamerAddress ? { streamer: streamerAddress.toLowerCase() } : undefined
      }),
    })

    if (!response.ok) {
      throw new Error(`Subgraph error: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Subgraph query failed')
    }

    const data = result.data

    // Calculate aggregated stats
    const totalOrderVolume = (data.orders || []).reduce((sum: bigint, o: any) =>
      sum + BigInt(o.amount), 0n)
    const totalTipVolume = (data.tips || []).reduce((sum: bigint, t: any) =>
      sum + BigInt(t.amount), 0n)
    const totalGiftVolume = (data.giftSents || []).reduce((sum: bigint, g: any) =>
      sum + BigInt(g.totalValue), 0n)
    const totalGiftQuantity = (data.giftSents || []).reduce((sum: number, g: any) =>
      sum + parseInt(g.quantity), 0)

    const avgRating = data.reviews?.length > 0
      ? data.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / data.reviews.length
      : 0

    const stats = {
      orders: {
        count: data.orders?.length || 0,
        totalVolume: totalOrderVolume.toString(),
        totalVolumeVery: parseFloat((totalOrderVolume / BigInt(10 ** 18)).toString()),
        confirmedCount: data.orders?.filter((o: any) => o.status === 'CONFIRMED').length || 0,
      },
      tips: {
        count: data.tips?.length || 0,
        totalVolume: totalTipVolume.toString(),
        totalVolumeVery: parseFloat((totalTipVolume / BigInt(10 ** 18)).toString()),
      },
      gifts: {
        eventCount: data.giftSents?.length || 0,
        totalQuantity: totalGiftQuantity,
        totalVolume: totalGiftVolume.toString(),
        totalVolumeVery: parseFloat((totalGiftVolume / BigInt(10 ** 18)).toString()),
      },
      reviews: {
        count: data.reviews?.length || 0,
        averageRating: avgRating.toFixed(1),
      },
      streamerStats: data.streamerStats ? {
        totalTips: parseFloat((BigInt(data.streamerStats.totalTips) / BigInt(10 ** 18)).toString()),
        totalGifts: parseFloat((BigInt(data.streamerStats.totalGifts) / BigInt(10 ** 18)).toString()),
        tipCount: parseInt(data.streamerStats.tipCount),
        giftCount: parseInt(data.streamerStats.giftCount),
      } : null,
      dailyVolumes: (data.dailyVolumes || []).map((dv: any) => ({
        date: new Date(parseInt(dv.date) * 1000).toISOString().split('T')[0],
        orderVolume: parseFloat((BigInt(dv.orderVolume) / BigInt(10 ** 18)).toString()),
        tipVolume: parseFloat((BigInt(dv.tipVolume) / BigInt(10 ** 18)).toString()),
        giftVolume: parseFloat((BigInt(dv.giftVolume) / BigInt(10 ** 18)).toString()),
        orderCount: parseInt(dv.orderCount),
        tipCount: parseInt(dv.tipCount),
        giftCount: parseInt(dv.giftCount),
      })),
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Subgraph stats error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
