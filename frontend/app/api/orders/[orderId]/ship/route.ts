import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'

interface RouteParams {
  params: Promise<{ orderId: string }>
}

// POST /api/orders/[orderId]/ship - Ship order with tracking number
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params
    const body = await request.json()

    const { trackingNumber } = body

    if (!trackingNumber) {
      return NextResponse.json(
        { success: false, error: 'Tracking number is required' },
        { status: 400 }
      )
    }

    const { data: order, error } = await supabase
      .from('labang_orders')
      .update({
        status: 'shipped',
        tracking_number: trackingNumber,
      })
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('POST /api/orders/[orderId]/ship error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to ship order' },
      { status: 500 }
    )
  }
}
