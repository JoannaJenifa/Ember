import { NextRequest, NextResponse } from 'next/server'
import { supabase, LABANG_TABLES } from '@/lib/db/supabase'

interface AttentionRequest {
  streamId: string
  userAddress: string
  passed: boolean
}

export async function POST(req: NextRequest) {
  try {
    const { streamId, userAddress, passed }: AttentionRequest = await req.json()

    if (!streamId || !userAddress) {
      return NextResponse.json({ error: 'Missing streamId or userAddress' }, { status: 400 })
    }

    // Get active session
    const { data: session, error: sessionError } = await supabase
      .from(LABANG_TABLES.watchSessions)
      .select('*')
      .eq('user_address', userAddress)
      .eq('stream_id', streamId)
      .eq('is_active', true)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No active session' }, { status: 404 })
    }

    if (passed) {
      // Clear attention check and continue session
      await supabase
        .from(LABANG_TABLES.watchSessions)
        .update({
          attention_check_pending: false,
          last_heartbeat: new Date().toISOString(),
        })
        .eq('id', session.id)

      return NextResponse.json({ success: true, continue: true })
    } else {
      // Failed attention check - end session
      await supabase
        .from(LABANG_TABLES.watchSessions)
        .update({
          is_active: false,
          attention_check_pending: false,
        })
        .eq('id', session.id)

      return NextResponse.json({ success: true, continue: false })
    }
  } catch (error) {
    console.error('Attention check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
