import { NextRequest, NextResponse } from 'next/server'
import { supabase, LABANG_TABLES } from '@/lib/db/supabase'

interface ClaimRequest {
  userAddress: string
  rewardIds?: string[] // If empty, claim all unclaimed
}

export async function POST(req: NextRequest) {
  try {
    const { userAddress, rewardIds }: ClaimRequest = await req.json()

    if (!userAddress) {
      return NextResponse.json({ error: 'Missing userAddress' }, { status: 400 })
    }

    // Get unclaimed rewards
    let query = supabase
      .from(LABANG_TABLES.rewards)
      .select('*')
      .eq('user_address', userAddress)
      .eq('claimed', false)

    if (rewardIds && rewardIds.length > 0) {
      query = query.in('id', rewardIds)
    }

    const { data: rewards, error: fetchError } = await query

    if (fetchError) throw fetchError

    if (!rewards || rewards.length === 0) {
      return NextResponse.json({ error: 'No unclaimed rewards' }, { status: 404 })
    }

    const totalAmount = rewards.reduce((sum, r) => sum + Number(r.amount_very), 0)

    // TODO: Implement actual VERY token transfer here
    // For now, just mark as claimed with a placeholder tx hash
    const txHash = `pending_${Date.now()}`

    const { error: updateError } = await supabase
      .from(LABANG_TABLES.rewards)
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
        tx_hash: txHash,
      })
      .eq('user_address', userAddress)
      .eq('claimed', false)
      .in('id', rewards.map(r => r.id))

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      claimedAmount: totalAmount,
      claimedCount: rewards.length,
      txHash,
    })
  } catch (error) {
    console.error('Claim error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
