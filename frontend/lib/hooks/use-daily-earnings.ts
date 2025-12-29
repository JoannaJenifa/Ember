'use client'

// TODO: Replace with subgraph query for on-chain rewards
// Daily earnings are now tracked on-chain and indexed via subgraph

export interface DailyEarningsData {
  today: {
    watchRewards: number
    commentRewards: number
  }
}

export interface UseDailyEarningsReturn {
  todayEarnings: number
  dailyLimit: number
  unclaimedAmount: number
  resetInSeconds: number
  claimRewards: () => Promise<{ success: boolean; error?: string }>
  data: DailyEarningsData | null
  isLoading: boolean
  error: string | null
}

export interface UseDailyEarningsOptions {
  userAddress: string | undefined
  enabled?: boolean
}

export function useDailyEarnings({ userAddress, enabled = true }: UseDailyEarningsOptions): UseDailyEarningsReturn {
  // TODO: Implement subgraph query for on-chain rewards
  // For now return defaults until subgraph is connected

  return {
    todayEarnings: 0,
    dailyLimit: 100,
    unclaimedAmount: 0,
    resetInSeconds: 0,
    claimRewards: async () => {
      // TODO: Implement on-chain claim
      console.log('Claim rewards - to be implemented with on-chain transaction')
      return { success: true }
    },
    data: {
      today: {
        watchRewards: 0,
        commentRewards: 0,
      },
    },
    isLoading: false,
    error: null,
  }
}
