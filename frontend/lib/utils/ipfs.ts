// IPFS metadata fetching utilities

const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
]

// In-memory cache with TTL (5 minutes)
const CACHE_TTL = 5 * 60 * 1000
const metadataCache = new Map<string, { data: unknown; timestamp: number }>()

// In-flight requests deduplication
const inFlightRequests = new Map<string, Promise<unknown>>()

function getCached<T>(key: string): T | null {
  const cached = metadataCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T
  }
  if (cached) {
    metadataCache.delete(key) // Expired
  }
  return null
}

function setCache(key: string, data: unknown): void {
  metadataCache.set(key, { data, timestamp: Date.now() })
}

/**
 * Convert IPFS URI to HTTP gateway URL
 */
export function ipfsToHttp(uri: string): string {
  if (!uri) return ''

  // Already an HTTP URL
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri
  }

  // Handle ipfs:// protocol
  if (uri.startsWith('ipfs://')) {
    const hash = uri.slice(7)
    return `${IPFS_GATEWAYS[0]}${hash}`
  }

  // Handle raw CID
  if (uri.startsWith('Qm') || uri.startsWith('baf')) {
    return `${IPFS_GATEWAYS[0]}${uri}`
  }

  return uri
}

/**
 * Fetch JSON metadata from IPFS with fallback gateways and caching
 */
export async function fetchMetadata<T = Record<string, unknown>>(
  metadataURI: string,
  timeout = 5000
): Promise<T | null> {
  if (!metadataURI) return null

  // Try to parse as inline JSON first (for legacy data)
  try {
    const parsed = JSON.parse(metadataURI)
    if (typeof parsed === 'object') return parsed as T
  } catch {
    // Not inline JSON, try fetching from IPFS
  }

  // Check cache first
  const cached = getCached<T>(metadataURI)
  if (cached !== null) return cached

  // Check for in-flight request to prevent duplicate fetches
  const inFlight = inFlightRequests.get(metadataURI)
  if (inFlight) return inFlight as Promise<T | null>

  // Create the fetch promise
  const fetchPromise = (async (): Promise<T | null> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    // Try each gateway
    for (const gateway of IPFS_GATEWAYS) {
      try {
        let url: string

        if (metadataURI.startsWith('ipfs://')) {
          url = `${gateway}${metadataURI.slice(7)}`
        } else if (metadataURI.startsWith('http')) {
          url = metadataURI
        } else if (metadataURI.startsWith('Qm') || metadataURI.startsWith('baf')) {
          url = `${gateway}${metadataURI}`
        } else {
          continue
        }

        const response = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })

        if (response.ok) {
          clearTimeout(timeoutId)
          const data = await response.json()
          setCache(metadataURI, data)
          return data as T
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') break
      }
    }

    clearTimeout(timeoutId)
    return null
  })()

  // Track in-flight request
  inFlightRequests.set(metadataURI, fetchPromise)

  try {
    return await fetchPromise
  } finally {
    inFlightRequests.delete(metadataURI)
  }
}

/**
 * Fetch metadata for multiple items in parallel
 */
export async function fetchMetadataBatch<T = Record<string, unknown>>(
  items: Array<{ metadataURI: string }>,
  timeout = 5000
): Promise<Map<string, T | null>> {
  const results = new Map<string, T | null>()

  await Promise.all(
    items.map(async (item) => {
      const metadata = await fetchMetadata<T>(item.metadataURI, timeout)
      results.set(item.metadataURI, metadata)
    })
  )

  return results
}
