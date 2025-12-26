/**
 * Format a price from wei to VERY with appropriate decimal precision
 * @param priceWei - Price in wei (18 decimals)
 * @returns Formatted price string (without "VERY" suffix)
 */
export function formatVeryPrice(priceWei: string | number | null | undefined): string {
  if (!priceWei) return '0'
  const priceInVery = Number(priceWei) / 1e18
  if (priceInVery < 0.001) return priceInVery.toFixed(6)
  if (priceInVery < 1) return priceInVery.toFixed(4)
  return priceInVery.toFixed(2)
}
