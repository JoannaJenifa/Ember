import { BigInt, BigDecimal, Bytes } from "@graphprotocol/graph-ts";

export const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);
export const ZERO_BD = BigDecimal.fromString("0");

export const SECONDS_PER_DAY = BigInt.fromI32(86400);

/**
 * Get date string in YYYY-MM-DD format from timestamp
 */
export function getDayId(timestamp: BigInt): string {
  const dayTimestamp = timestamp.div(SECONDS_PER_DAY).times(SECONDS_PER_DAY);
  return dayTimestamp.toString();
}

/**
 * Get day start timestamp from any timestamp
 */
export function getDayStartTimestamp(timestamp: BigInt): BigInt {
  return timestamp.div(SECONDS_PER_DAY).times(SECONDS_PER_DAY);
}

/**
 * Convert bytes32 to hex string ID
 */
export function bytes32ToId(value: Bytes): string {
  return value.toHexString();
}

/**
 * Calculate average rating from total and count
 */
export function calculateAverageRating(
  totalRating: BigInt,
  reviewCount: BigInt
): BigDecimal {
  if (reviewCount.equals(ZERO_BI)) {
    return ZERO_BD;
  }
  return totalRating.toBigDecimal().div(reviewCount.toBigDecimal());
}
