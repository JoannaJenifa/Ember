import { EMBER_ADDRESS } from '@/lib/aptos';
import { submitTransaction, TransactionContext } from './transactions';

/**
 * Gift types enum
 */
export enum GiftType {
  Heart = 0,
  Star = 1,
  Fire = 2,
  Diamond = 3,
  Crown = 4,
}

/**
 * Send a gift to a streamer
 */
export async function sendGift(
  walletAddress: string,
  streamer: string,
  giftType: GiftType,
  quantity: number,
  message: string,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::gift_shop::send_gift`,
    [],
    [streamer, giftType, quantity, message],
    context
  );
}
