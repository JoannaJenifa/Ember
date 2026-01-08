/**
 * Shinami Gas Station client utilities
 *
 * All Shinami API calls go through server-side API routes.
 * This module provides client-side utilities for interacting with those routes.
 */

let sponsorshipEnabled: boolean | null = null;

/**
 * Check if gas sponsorship is available (calls server API)
 */
export async function isShinamiEnabled(): Promise<boolean> {
  if (sponsorshipEnabled !== null) {
    return sponsorshipEnabled;
  }

  try {
    const response = await fetch('/api/shinami/sponsor');
    const data = await response.json();
    sponsorshipEnabled = data.enabled === true;
    return sponsorshipEnabled;
  } catch {
    sponsorshipEnabled = false;
    return false;
  }
}

/**
 * Submit a sponsored transaction via the server API
 *
 * @param rawTransaction - Hex-encoded raw transaction bytes
 * @param senderSignature - Hex-encoded sender authenticator bytes
 * @returns Transaction hash
 */
export async function submitSponsoredTransaction(
  rawTransaction: string,
  senderSignature: string
): Promise<string> {
  const response = await fetch('/api/shinami/sponsor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawTransaction, senderSignature }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Sponsorship request failed');
  }

  return data.hash;
}

/**
 * Reset the cached sponsorship status (useful for testing)
 */
export function resetSponsorshipCache(): void {
  sponsorshipEnabled = null;
}
