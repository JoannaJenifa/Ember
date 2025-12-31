import { NextRequest, NextResponse } from 'next/server'
import { supabase, LABANG_TABLES } from '@/lib/db/supabase'

const HEARTBEAT_INTERVAL = 30 // seconds
const WATCH_5MIN_THRESHOLD = 300 // seconds (5 min)
const WATCH_30MIN_THRESHOLD = 1800 // seconds (30 min)
const ATTENTION_CHECK_INTERVAL = 600 // seconds (10 min)
const DAILY_WATCH_CAP = 50 // VERY

interface HeartbeatRequest {
  streamId: string
  userAddress: string
}

interface Reward {
  type: 'watch_5min' | 'watch_30min'
  amount: number
}

export async function POST(req: NextRequest) {
  try {
    const { streamId, userAddress }: HeartbeatRequest = await req.json()

    if (!streamId || !userAddress) {
      return NextResponse.json({ error: 'Missing streamId or userAddress' }, { status: 400 })
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Check daily cap
    const { data: dailyEarnings } = await supabase
      .from(LABANG_TABLES.dailyEarnings)
      .select('watch_rewards')
      .eq('user_address', userAddress)
      .eq('date', today)
      .single()

    const currentWatchRewards = Number(dailyEarnings?.watch_rewards ?? 0)
    if (currentWatchRewards >= DAILY_WATCH_CAP) {
      return NextResponse.json({
        continue: true,
        attentionCheck: false,
        rewards: [],
        totalWatchTime: 0,
        dailyCapReached: true,
      })
    }

    // Get or create watch session
    let { data: session } = await supabase
      .from(LABANG_TABLES.watchSessions)
      .select('*')
      .eq('user_address', userAddress)
      .eq('stream_id', streamId)
      .eq('is_active', true)
      .single()

    if (!session) {
      const { data: newSession, error } = await supabase
        .from(LABANG_TABLES.watchSessions)
        .insert({ user_address: userAddress, stream_id: streamId })
        .select()
        .single()

      if (error) throw error
      session = newSession
    }

    const sessionTotalSeconds = session.total_seconds ?? 0
    const sessionLastHeartbeat = session.last_heartbeat ?? session.started_at ?? now.toISOString()

    // Check if attention check is pending
    if (session.attention_check_pending) {
      return NextResponse.json({
        continue: false,
        attentionCheck: true,
        rewards: [],
        totalWatchTime: sessionTotalSeconds,
        message: 'Attention check required',
      })
    }

    // Update watch time
    const timeSinceLastHeartbeat = Math.min(
      (now.getTime() - new Date(sessionLastHeartbeat).getTime()) / 1000,
      HEARTBEAT_INTERVAL + 5 // Allow 5 seconds grace
    )

    const newTotalSeconds = sessionTotalSeconds + Math.round(timeSinceLastHeartbeat)

    // Check for milestone rewards
    const rewards: Reward[] = []
    const previousMilestones = Math.floor(sessionTotalSeconds / WATCH_5MIN_THRESHOLD)
    const newMilestones = Math.floor(newTotalSeconds / WATCH_5MIN_THRESHOLD)

    for (let i = previousMilestones; i < newMilestones; i++) {
      if (currentWatchRewards + rewards.reduce((a, r) => a + r.amount, 0) >= DAILY_WATCH_CAP) break
      rewards.push({ type: 'watch_5min', amount: 1 })
    }

    // Check 30min bonus
    const previous30MinMilestones = Math.floor(sessionTotalSeconds / WATCH_30MIN_THRESHOLD)
    const new30MinMilestones = Math.floor(newTotalSeconds / WATCH_30MIN_THRESHOLD)

    for (let i = previous30MinMilestones; i < new30MinMilestones; i++) {
      const remaining = DAILY_WATCH_CAP - currentWatchRewards - rewards.reduce((a, r) => a + r.amount, 0)
      if (remaining >= 5) {
        rewards.push({ type: 'watch_30min', amount: 5 })
      }
    }

    // Should show attention check?
    const attentionCheck =
      newTotalSeconds > 0 &&
      Math.floor(newTotalSeconds / ATTENTION_CHECK_INTERVAL) >
      Math.floor(sessionTotalSeconds / ATTENTION_CHECK_INTERVAL)

    // Update session
    await supabase
      .from(LABANG_TABLES.watchSessions)
      .update({
        last_heartbeat: now.toISOString(),
        total_seconds: newTotalSeconds,
        attention_check_pending: attentionCheck,
      })
      .eq('id', session.id)

    // Record rewards
    if (rewards.length > 0) {
      const rewardInserts = rewards.map(r => ({
        user_address: userAddress,
        reward_type: r.type,
        amount_very: r.amount,
        stream_id: streamId,
      }))

      await supabase.from(LABANG_TABLES.rewards).insert(rewardInserts)

      // Update daily earnings
      const totalNewRewards = rewards.reduce((a, r) => a + r.amount, 0)
      await supabase
        .from(LABANG_TABLES.dailyEarnings)
        .upsert({
          user_address: userAddress,
          date: today,
          watch_rewards: currentWatchRewards + totalNewRewards,
          total_rewards: currentWatchRewards + totalNewRewards,
        }, { onConflict: 'user_address,date' })
    }

    return NextResponse.json({
      continue: true,
      attentionCheck,
      rewards,
      totalWatchTime: newTotalSeconds,
    })
  } catch (error) {
    console.error('Heartbeat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
