import { aptos, EMBER_ADDRESS } from '@/lib/aptos';

// === Order Types ===

export interface Order {
  id: number;
  buyer: string;
  seller: string;
  productId: number;
  quantity: number;
  totalPrice: number;
  platformFee: number;
  sellerAmount: number;
  status: number;
  shippingInfo: string;
  createdAt: number;
  shippedAt: number;
  deliveredAt: number;
}

// Order status enum
export enum OrderStatus {
  Paid = 0,
  Shipped = 1,
  Delivered = 2,
  Disputed = 3,
  Cancelled = 4,
  Refunded = 5,
}

// === Helper to parse Move struct responses ===

function parseOrder(data: any): Order {
  return {
    id: Number(data.id),
    buyer: data.buyer,
    seller: data.seller,
    productId: Number(data.product_id),
    quantity: Number(data.quantity),
    totalPrice: Number(data.total_price),
    platformFee: Number(data.platform_fee),
    sellerAmount: Number(data.seller_amount),
    status: data.status,
    shippingInfo: data.shipping_info,
    createdAt: Number(data.created_at),
    shippedAt: Number(data.shipped_at),
    deliveredAt: Number(data.delivered_at),
  };
}

// === Order Queries ===

export async function getOrder(orderId: number): Promise<Order | null> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::order_escrow::get_order`,
        functionArguments: [orderId],
      },
    });
    return parseOrder(result[0]);
  } catch {
    return null;
  }
}

export async function getBuyerOrders(buyerAddress: string): Promise<number[]> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::order_escrow::get_buyer_orders`,
        functionArguments: [buyerAddress],
      },
    });
    return (result[0] as any[]).map(Number);
  } catch {
    return [];
  }
}

export async function getBuyerOrdersFull(buyerAddress: string): Promise<Order[]> {
  const ids = await getBuyerOrders(buyerAddress);
  const orders = await Promise.all(ids.map((id) => getOrder(id)));
  return orders.filter((o): o is Order => o !== null).reverse();
}

export async function getSellerOrders(sellerAddress: string): Promise<number[]> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::order_escrow::get_seller_orders`,
        functionArguments: [sellerAddress],
      },
    });
    return (result[0] as any[]).map(Number);
  } catch {
    return [];
  }
}

export async function getSellerOrdersFull(sellerAddress: string): Promise<Order[]> {
  const ids = await getSellerOrders(sellerAddress);
  const orders = await Promise.all(ids.map((id) => getOrder(id)));
  return orders.filter((o): o is Order => o !== null).reverse();
}

export async function hasDeliveredOrder(
  buyerAddress: string,
  productId: number
): Promise<boolean> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::order_escrow::has_delivered_order`,
        functionArguments: [buyerAddress, productId],
      },
    });
    return Boolean(result[0]);
  } catch {
    return false;
  }
}

export async function getOrderCount(): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::order_escrow::get_order_count`,
        functionArguments: [],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}

export async function isOrderDelivered(orderId: number): Promise<boolean> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::order_escrow::is_order_delivered`,
        functionArguments: [orderId],
      },
    });
    return Boolean(result[0]);
  } catch {
    return false;
  }
}
