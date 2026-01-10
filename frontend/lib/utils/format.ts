/**
 * Format a price from wei to MOVE with appropriate decimal precision
 * @param priceWei - Price in wei (18 decimals)
 * @returns Formatted price string (without "MOVE" suffix)
 */
export function formatMovePrice(priceWei: string | number | null | undefined): string {
  if (!priceWei) return '0'
  const priceInMove = Number(priceWei) / 1e18
  if (priceInMove < 0.001) return priceInMove.toFixed(6)
  if (priceInMove < 1) return priceInMove.toFixed(4)
  return priceInMove.toFixed(2)
}

// Alias for backwards compatibility
export const formatVeryPrice = formatMovePrice
