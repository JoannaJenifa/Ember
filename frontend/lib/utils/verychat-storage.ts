import { type VeryChatUser } from '@/lib/services/verychat-service'

const STORAGE_KEY_PREFIX = 'labang_verychat_'

export interface VeryChatVerification {
  handleId: string
  user: VeryChatUser
  accessToken: string
  refreshToken: string
  verifiedAt: number
}

function getStorageKey(walletAddress: string): string {
  return `${STORAGE_KEY_PREFIX}${walletAddress.toLowerCase()}`
}

/**
 * Get VeryChat verification from localStorage
 */
export function getVeryChatVerification(walletAddress: string): VeryChatVerification | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(getStorageKey(walletAddress))
    if (!stored) return null

    const verification = JSON.parse(stored) as VeryChatVerification

    // Validate structure
    if (!verification.handleId || !verification.user || !verification.verifiedAt) {
      return null
    }

    return verification
  } catch {
    return null
  }
}

/**
 * Save VeryChat verification to localStorage
 */
export function saveVeryChatVerification(
  walletAddress: string,
  verification: VeryChatVerification
): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(getStorageKey(walletAddress), JSON.stringify(verification))
  } catch (error) {
    console.error('Failed to save VeryChat verification:', error)
  }
}

/**
 * Clear VeryChat verification from localStorage
 */
export function clearVeryChatVerification(walletAddress: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(getStorageKey(walletAddress))
  } catch (error) {
    console.error('Failed to clear VeryChat verification:', error)
  }
}

/**
 * Check if VeryChat verification exists
 */
export function hasVeryChatVerification(walletAddress: string): boolean {
  return getVeryChatVerification(walletAddress) !== null
}

/**
 * Get VeryChat handle from verification (for on-chain storage)
 */
export function getVeryChatHandle(walletAddress: string): string | null {
  const verification = getVeryChatVerification(walletAddress)
  return verification?.handleId ?? null
}
