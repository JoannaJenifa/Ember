import { EMBER_ADDRESS } from '@/lib/aptos';
import { submitTransaction, TransactionContext } from './transactions';

/**
 * Create a new product (verified sellers only)
 */
export async function createProduct(
  walletAddress: string,
  title: string,
  description: string,
  imageUrl: string,
  price: number,
  inventory: number,
  category: number,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::product_registry::create_product`,
    [],
    [title, description, imageUrl, price, inventory, category],
    context
  );
}

/**
 * Update product details
 */
export async function updateProduct(
  walletAddress: string,
  productId: number,
  title: string,
  description: string,
  imageUrl: string,
  price: number,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::product_registry::update_product`,
    [],
    [productId, title, description, imageUrl, price],
    context
  );
}

/**
 * Update product inventory
 */
export async function updateInventory(
  walletAddress: string,
  productId: number,
  inventory: number,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::product_registry::update_inventory`,
    [],
    [productId, inventory],
    context
  );
}

/**
 * Deactivate a product
 */
export async function deactivateProduct(
  walletAddress: string,
  productId: number,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::product_registry::deactivate_product`,
    [],
    [productId],
    context
  );
}
