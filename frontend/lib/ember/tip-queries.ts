import { aptos, EMBER_ADDRESS } from '@/lib/aptos';

// === Tip Types ===

export interface Tip {
  id: number;
  sender: string;
  streamer: string;
  amount: number;
  message: string;
  timestamp: number;
}

// === Helper to parse Move struct responses ===

function parseTip(data: any): Tip {
  return {
    id: Number(data.id),
    sender: data.sender,
    streamer: data.streamer,
    amount: Number(data.amount),
    message: data.message,
    timestamp: Number(data.timestamp),
  };
}

// === Tip Queries ===

export async function getTip(tipId: number): Promise<Tip | null> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::tip_jar::get_tip`,
        functionArguments: [tipId],
      },
    });
    return parseTip(result[0]);
  } catch {
    return null;
  }
}

export async function getStreamerTips(
  streamerAddress: string,
  limit: number = 10
): Promise<Tip[]> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::tip_jar::get_streamer_tips`,
        functionArguments: [streamerAddress, limit],
      },
    });
    return (result[0] as any[]).map(parseTip);
  } catch {
    return [];
  }
}

export async function getStreamerTotal(streamerAddress: string): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::tip_jar::get_streamer_total`,
        functionArguments: [streamerAddress],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}

export async function getRecentTips(limit: number = 10): Promise<Tip[]> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::tip_jar::get_recent_tips`,
        functionArguments: [limit],
      },
    });
    return (result[0] as any[]).map(parseTip);
  } catch {
    return [];
  }
}

export async function getTipCount(): Promise<number> {
  try {
    const result = await aptos.view({
      payload: {
        function: `${EMBER_ADDRESS}::tip_jar::get_tip_count`,
        functionArguments: [],
      },
    });
    return Number(result[0]);
  } catch {
    return 0;
  }
}
