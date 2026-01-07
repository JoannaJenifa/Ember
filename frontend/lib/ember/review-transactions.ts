import { EMBER_ADDRESS } from '@/lib/aptos';
import { submitTransaction, TransactionContext } from './transactions';

/**
 * Submit a review for a delivered order
 */
export async function submitReview(
  walletAddress: string,
  orderId: number,
  rating: number,
  content: string,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::review_registry::submit_review`,
    [],
    [orderId, rating, content],
    context
  );
}
