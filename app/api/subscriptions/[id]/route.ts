import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// DELETE /api/subscriptions/[id] -- fan cancels their own subscription to a creator
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient()
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription, error: fetchError } = await supabase
      .from('fan_subscriptions')
      .select('id, fan_id, stripe_subscription_id')
      .eq('id', params.id)
      .single()

    if (fetchError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.fan_id !== user.id) {
      return NextResponse.json({ error: 'Not your subscription' }, { status: 403 })
    }

    if (subscription.stripe_subscription_id) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
        apiVersion: '2024-12-18.acacia',
      })
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
      })
    }

    const { error: updateError } = await supabase
      .from('fan_subscriptions')
      .update({ status: 'canceled', canceled_at: new Date().toISOString() })
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Cancel fan subscription error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
