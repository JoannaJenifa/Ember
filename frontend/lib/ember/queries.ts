import { aptos, EMBER_ADDRESS } from '@/lib/aptos';

// === Seller Types ===

export interface Seller {
  addr: string;
  shopName: string;
  description: string;
  category: number;
  status: number;
  totalSales: number;
  totalOrders: number;
  ratingSum: number;
  ratingCount: number;
  youtubeChannel: string;
  createdAt: number;
}

// === Helper to parse Move struct responses ===

function parseSeller(data: any): Seller {
  return {
    addr: data.addr,
    shopName: data.shop_name,
    description: data.description,
    category: data.category,
    status: data.status,
    totalSales: Number(data.total_sales),
    totalOrders: Number(data.total_orders),
    ratingSum: Number(data.rating_sum),
    ratingCount: Number(data.rating_count),
    youtubeChannel: data.youtube_channel,
    createdAt: Number(data.created_at),
  };
}

// === Seller Queries ===

export async function getSeller(sellerAddress: string): Promise<Seller | null> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::seller_registry::get_seller`,
        functionArguments: [sellerAddress],
      },
    });
    return parseSeller(result[0]);
  } catch {
    return null;
  }
}

export async function isVerifiedSeller(sellerAddress: string): Promise<boolean> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::seller_registry::is_verified_seller`,
        functionArguments: [sellerAddress],
      },
    });
    return Boolean(result[0]);
  } catch {
    return false;
  }
}

export async function isRegisteredSeller(sellerAddress: string): Promise<boolean> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::seller_registry::is_registered_seller`,
        functionArguments: [sellerAddress],
      },
    });
    return Boolean(result[0]);
  } catch {
    return false;
  }
}

export async function getSellerCount(): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::seller_registry::get_seller_count`,
        functionArguments: [],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}

export async function getSellerRating(
  sellerAddress: string
): Promise<{ sum: number; count: number }> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::seller_registry::get_seller_rating`,
        functionArguments: [sellerAddress],
      },
    });
    return { sum: Number(result[0]), count: Number(result[1]) };
  } catch {
    return { sum: 0, count: 0 };
  }
}
