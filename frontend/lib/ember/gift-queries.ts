import { aptos, EMBER_ADDRESS } from '@/lib/aptos';

// === Gift Types ===

export interface Gift {
  id: number;
  sender: string;
  streamer: string;
  giftType: number;
  quantity: number;
  totalValue: number;
  message: string;
  timestamp: number;
}

// Gift type names for display
export const GIFT_NAMES = ['Heart', 'Star', 'Fire', 'Diamond', 'Crown'] as const;

export const GIFT_EMOJIS = ['❤️', '⭐', '🔥', '💎', '👑'] as const;

// === Helper to parse Move struct responses ===

function parseGift(data: any): Gift {
  return {
    id: Number(data.id),
    sender: data.sender,
    streamer: data.streamer,
    giftType: data.gift_type,
    quantity: Number(data.quantity),
    totalValue: Number(data.total_value),
    message: data.message,
    timestamp: Number(data.timestamp),
  };
}

// === Gift Queries ===

export async function getGift(giftId: number): Promise<Gift | null> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::gift_shop::get_gift`,
        functionArguments: [giftId],
      },
    });
    return parseGift(result[0]);
  } catch {
    return null;
  }
}

export async function getGiftPrice(giftType: number): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::gift_shop::get_gift_price`,
        functionArguments: [giftType],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}

export async function getAllGiftPrices(): Promise<number[]> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::gift_shop::get_all_gift_prices`,
        functionArguments: [],
      },
    });
    return (result[0] as any[]).map(Number);
  } catch {
    return [];
  }
}

export async function getStreamerGifts(
  streamerAddress: string,
  limit: number = 10
): Promise<Gift[]> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::gift_shop::get_streamer_gifts`,
        functionArguments: [streamerAddress, limit],
      },
    });
    return (result[0] as any[]).map(parseGift);
  } catch {
    return [];
  }
}

export async function getStreamerEarnings(streamerAddress: string): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::gift_shop::get_streamer_earnings`,
        functionArguments: [streamerAddress],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}

export async function getGiftCount(): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::gift_shop::get_gift_count`,
        functionArguments: [],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}
