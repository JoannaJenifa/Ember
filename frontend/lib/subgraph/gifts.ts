/**
 * Subgraph queries for Gift and Tip data
 * Queries events from GiftShop and TipJar contracts
 */

// NEXT_PUBLIC_INDEXER_URL is required - validated by env-config.ts
const INDEXER_URL = process.env.NEXT_PUBLIC_INDEXER_URL!
const SUBGRAPH_URL = `${INDEXER_URL}/subgraphs/name/labang`

interface GiftSentEvent {
  id: string
  from: string
  streamerId: string
  giftId: string
  quantity: string
  totalValue: string
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}

interface TipSentEvent {
  id: string
  from: string
  streamerId: string
  amount: string
  message: string
  timestamp: string
  blockNumber: string
  transactionHash: string
}

interface StreamerStats {
  id: string
  address: string
  totalGiftsReceived: string
  totalTipsReceived: string
  totalGiftCount: string
  totalTipCount: string
}

interface TopGifter {
  id: string
  address: string
  totalValue: string
  giftCount: string
}

// Execute GraphQL query
async function executeQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T | null> {
  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) {
      console.error('Subgraph query failed:', response.statusText)
      return null
    }

    const result = await response.json()
    if (result.errors) {
      console.error('Subgraph query errors:', result.errors)
      return null
    }

    return result.data as T
  } catch (error) {
    console.error('Subgraph query error:', error)
    return null
  }
}

// Get gifts sent during a specific stream period
export async function getStreamGifts(
  streamerId: string,
  startTime: number,
  endTime?: number
): Promise<GiftSentEvent[]> {
  const query = `
    query GetStreamGifts($streamerId: String!, $startTime: BigInt!, $endTime: BigInt) {
      giftSents(
        where: {
          streamerId: $streamerId
          blockTimestamp_gte: $startTime
          ${endTime ? 'blockTimestamp_lte: $endTime' : ''}
        }
        orderBy: blockTimestamp
        orderDirection: desc
        first: 100
      ) {
        id
        from
        streamerId
        giftId
        quantity
        totalValue
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `

  const data = await executeQuery<{ giftSents: GiftSentEvent[] }>(query, {
    streamerId: streamerId.toLowerCase(),
    startTime: startTime.toString(),
    endTime: endTime?.toString(),
  })

  return data?.giftSents || []
}

// Get tips sent during a specific stream period
export async function getStreamTips(
  streamerId: string,
  startTime: number,
  endTime?: number
): Promise<TipSentEvent[]> {
  const query = `
    query GetStreamTips($streamerId: String!, $startTime: BigInt!, $endTime: BigInt) {
      tipSents(
        where: {
          streamerId: $streamerId
          timestamp_gte: $startTime
          ${endTime ? 'timestamp_lte: $endTime' : ''}
        }
        orderBy: timestamp
        orderDirection: desc
        first: 100
      ) {
        id
        from
        streamerId
        amount
        message
        timestamp
        blockNumber
        transactionHash
      }
    }
  `

  const data = await executeQuery<{ tipSents: TipSentEvent[] }>(query, {
    streamerId: streamerId.toLowerCase(),
    startTime: startTime.toString(),
    endTime: endTime?.toString(),
  })

  return data?.tipSents || []
}

// Get streamer stats (total gifts/tips received)
export async function getStreamerStats(address: string): Promise<StreamerStats | null> {
  const query = `
    query GetStreamerStats($address: ID!) {
      streamerStats(id: $address) {
        id
        address
        totalGiftsReceived
        totalTipsReceived
        totalGiftCount
        totalTipCount
      }
    }
  `

  const data = await executeQuery<{ streamerStats: StreamerStats }>(query, {
    address: address.toLowerCase(),
  })

  return data?.streamerStats || null
}

// Get top gifters for a streamer
export async function getTopGifters(
  streamerId: string,
  limit: number = 10
): Promise<TopGifter[]> {
  const query = `
    query GetTopGifters($streamerId: String!, $limit: Int!) {
      gifterStats(
        where: { streamerId: $streamerId }
        orderBy: totalValue
        orderDirection: desc
        first: $limit
      ) {
        id
        address
        totalValue
        giftCount
      }
    }
  `

  const data = await executeQuery<{ gifterStats: TopGifter[] }>(query, {
    streamerId: streamerId.toLowerCase(),
    limit,
  })

  return data?.gifterStats || []
}

// Get recent gifts for any streamer (for feed display)
export async function getRecentGifts(limit: number = 20): Promise<GiftSentEvent[]> {
  const query = `
    query GetRecentGifts($limit: Int!) {
      giftSents(
        orderBy: blockTimestamp
        orderDirection: desc
        first: $limit
      ) {
        id
        from
        streamerId
        giftId
        quantity
        totalValue
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `

  const data = await executeQuery<{ giftSents: GiftSentEvent[] }>(query, { limit })
  return data?.giftSents || []
}

// Get all gifts from a specific sender
export async function getGiftsBySender(senderAddress: string): Promise<GiftSentEvent[]> {
  const query = `
    query GetGiftsBySender($sender: String!) {
      giftSents(
        where: { from: $sender }
        orderBy: blockTimestamp
        orderDirection: desc
        first: 100
      ) {
        id
        from
        streamerId
        giftId
        quantity
        totalValue
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `

  const data = await executeQuery<{ giftSents: GiftSentEvent[] }>(query, {
    sender: senderAddress.toLowerCase(),
  })

  return data?.giftSents || []
}
