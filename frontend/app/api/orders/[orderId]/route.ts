import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/db/supabase'

interface RouteParams {
  params: Promise<{ orderId: string }>
}

// GET /api/orders/[orderId] - Get single order
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params

    const { data: order, error } = await supabase
      .from('labang_orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('GET /api/orders/[orderId] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[orderId] - Update order status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params
    const body = await request.json()

    const updates: Record<string, unknown> = {}

    if (body.status) {
      updates.status = body.status
    }

    if (body.trackingNumber) {
      updates.tracking_number = body.trackingNumber
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid updates provided' },
        { status: 400 }
      )
    }

    const { data: order, error } = await supabase
      .from('labang_orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('PUT /api/orders/[orderId] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
