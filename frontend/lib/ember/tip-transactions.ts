import { EMBER_ADDRESS } from '@/lib/aptos';
import { submitTransaction, TransactionContext } from './transactions';

/**
 * Send a tip to a streamer
 */
export async function sendTip(
  walletAddress: string,
  streamer: string,
  amount: number,
  message: string,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::tip_jar::send_tip`,
    [],
    [streamer, amount, message],
    context
  );
}
