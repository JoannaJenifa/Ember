import { NextRequest, NextResponse } from 'next/server'
import { supabase, LABANG_TABLES } from '@/lib/db/supabase'

const DAILY_WATCH_CAP = 50 // VERY

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userAddress = searchParams.get('userAddress')

    if (!userAddress) {
      return NextResponse.json({ error: 'Missing userAddress' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    // Get daily earnings
    const { data: dailyEarnings } = await supabase
      .from(LABANG_TABLES.dailyEarnings)
      .select('*')
      .eq('user_address', userAddress)
      .eq('date', today)
      .single()

    // Get unclaimed rewards
    const { data: unclaimedRewards } = await supabase
      .from(LABANG_TABLES.rewards)
      .select('*')
      .eq('user_address', userAddress)
      .eq('claimed', false)

    // Get today's rewards breakdown
    const { data: todayRewards } = await supabase
      .from(LABANG_TABLES.rewards)
      .select('*')
      .eq('user_address', userAddress)
      .gte('created_at', `${today}T00:00:00Z`)
      .lte('created_at', `${today}T23:59:59Z`)

    // Get active watch session
    const { data: activeSession } = await supabase
      .from(LABANG_TABLES.watchSessions)
      .select('*')
      .eq('user_address', userAddress)
      .eq('is_active', true)
      .single()

    const watchRewards = Number(dailyEarnings?.watch_rewards ?? 0)
    const commentRewards = Number(dailyEarnings?.comment_rewards ?? 0)
    const totalRewards = Number(dailyEarnings?.total_rewards ?? 0)

    // Calculate next reset time (midnight KST)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const resetInSeconds = Math.floor((tomorrow.getTime() - now.getTime()) / 1000)

    // Calculate rewards by type for today
    const rewardsByType = (todayRewards ?? []).reduce((acc, r) => {
      const type = r.reward_type as string
      acc[type] = (acc[type] ?? 0) + Number(r.amount_very)
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      today: {
        watchRewards,
        commentRewards,
        totalRewards,
        dailyLimit: DAILY_WATCH_CAP,
        remaining: Math.max(0, DAILY_WATCH_CAP - watchRewards),
        rewardsByType,
      },
      unclaimed: {
        count: unclaimedRewards?.length ?? 0,
        totalAmount: (unclaimedRewards ?? []).reduce((sum, r) => sum + Number(r.amount_very), 0),
        rewards: unclaimedRewards ?? [],
      },
      activeSession: activeSession ? {
        streamId: activeSession.stream_id,
        totalSeconds: activeSession.total_seconds,
        startedAt: activeSession.started_at,
      } : null,
      resetInSeconds,
    })
  } catch (error) {
    console.error('Status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
