import { EMBER_ADDRESS } from '@/lib/aptos';
import { submitTransaction, TransactionContext } from './transactions';

/**
 * Create a new order with escrow
 */
export async function createOrder(
  walletAddress: string,
  productId: number,
  quantity: number,
  shippingInfo: string,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::order_escrow::create_order`,
    [],
    [productId, quantity, shippingInfo],
    context
  );
}

/**
 * Mark order as shipped (seller only)
 */
export async function markShipped(
  walletAddress: string,
  orderId: number,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::order_escrow::mark_shipped`,
    [],
    [orderId],
    context
  );
}

/**
 * Confirm delivery and release funds (buyer only)
 */
export async function confirmDelivery(
  walletAddress: string,
  orderId: number,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::order_escrow::confirm_delivery`,
    [],
    [orderId],
    context
  );
}

/**
 * Dispute an order (buyer only)
 */
export async function disputeOrder(
  walletAddress: string,
  orderId: number,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::order_escrow::dispute_order`,
    [],
    [orderId],
    context
  );
}

/**
 * Cancel order and get refund (buyer only, before shipping)
 */
export async function cancelOrder(
  walletAddress: string,
  orderId: number,
  context: TransactionContext
): Promise<string> {
  return submitTransaction(
    walletAddress,
    `${EMBER_ADDRESS}::order_escrow::cancel_order`,
    [],
    [orderId],
    context
  );
}
