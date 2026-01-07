import { EMBER_ADDRESS } from '@/lib/aptos';
import { submitTransaction, TransactionContext } from './transactions';

/**
 * Register as a new seller
 */
export async function registerSeller(
  walletAddress: string,
  shopName: string,
  description: string,
  category: number,
  youtubeChannel: string,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::seller_registry::register_seller`,
    [],
    [shopName, description, category, youtubeChannel],
    context
  );
}

/**
 * Update seller profile
 */
export async function updateProfile(
  walletAddress: string,
  shopName: string,
  description: string,
  youtubeChannel: string,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::seller_registry::update_profile`,
    [],
    [shopName, description, youtubeChannel],
    context
  );
}
