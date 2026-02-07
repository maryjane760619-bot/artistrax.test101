import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const trackId = session.metadata?.trackId
    const artistId = session.metadata?.artistId
    const labelId = session.metadata?.labelId
    const customerEmail = session.customer_details?.email
    const amountPaid = session.amount_total ? session.amount_total / 100 : 0

    if (!trackId || !customerEmail) {
      console.error('Missing required metadata:', session.metadata)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    try {
      // Record purchase
      const { error: purchaseError } = await supabase.from('purchases').insert({
        track_id: trackId,
        artist_id: artistId,
        label_id: labelId || null,
        buyer_email: customerEmail,
        amount: amountPaid,
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
      })

      if (purchaseError) {
        console.error('Failed to record purchase:', purchaseError)
        return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 })
      }

      console.log(`Purchase recorded: ${trackId} by ${customerEmail}`)
    } catch (error: any) {
      console.error('Webhook processing error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
