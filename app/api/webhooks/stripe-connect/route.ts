import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        await handleAccountUpdated(account)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        await handleTransferCreated(transfer)
        break
      }

      case 'transfer.paid': {
        const transfer = event.data.object as Stripe.Transfer
        await handleTransferPaid(transfer)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

// Handle checkout.session.completed — confirms ticket purchases
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const eventId = session.metadata?.eventId
    const tierId = session.metadata?.tierId
    const buyerName = session.metadata?.buyerName || 'Ticket Buyer'
    const buyerEmail = session.metadata?.buyerEmail || ''
    const quantity = parseInt(session.metadata?.quantity || '1')
    const paymentIntentId = session.payment_intent as string

    if (!eventId || !tierId) return // Not a ticket purchase

    // Update ticket purchase to paid
    const { data: purchase, error: purchaseError } = await supabase
      .from('ticket_purchases')
      .update({
        status: 'paid',
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq('stripe_session_id', session.id)
      .select('id')
      .single()

    if (purchaseError) {
      console.error('Failed to update ticket purchase:', purchaseError)
      throw purchaseError
    }

    // Check if attendee records exist for this purchase
    const { data: existingAttendees } = await supabase
      .from('ticket_attendees')
      .select('id')
      .eq('purchase_id', purchase?.id)
      .limit(1)

    // If no attendee records exist, create them (edge case recovery)
    if (!existingAttendees || existingAttendees.length === 0) {
      const attendeeRows = []
      for (let i = 0; i < quantity; i++) {
        attendeeRows.push({
          purchase_id: purchase?.id,
          event_id: eventId,
          ticket_tier_id: tierId,
          attendee_name: buyerName,
          attendee_email: buyerEmail || null,
          ticket_code: crypto.randomBytes(6).toString('base64url').toUpperCase().slice(0, 8),
        })
      }
      const { error: attendeeError } = await supabase.from('ticket_attendees').insert(attendeeRows)
      if (attendeeError) throw attendeeError
    }

    // Increment quantity_sold on ticket tier
    const { data: tier, error: tierFetchError } = await supabase
      .from('ticket_tiers')
      .select('quantity_sold')
      .eq('id', tierId)
      .single()

    if (tierFetchError) throw tierFetchError

    if (tier) {
      const { error: tierUpdateError } = await supabase
        .from('ticket_tiers')
        .update({ quantity_sold: (tier.quantity_sold || 0) + quantity })
        .eq('id', tierId)
      if (tierUpdateError) throw tierUpdateError
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error)
    throw error // Propagate so Stripe retries
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    // Find which user this account belongs to (check artists then labels)
    const { data: artist, error: artistFetchError } = await supabase
      .from('artists')
      .select('id')
      .eq('stripe_account_id', account.id)
      .single()

    if (artistFetchError && artistFetchError.code !== 'PGRST116') throw artistFetchError

    if (artist) {
      const { error: updateError } = await supabase
        .from('artists')
        .update({
          stripe_charges_enabled: account.charges_enabled,
          stripe_details_submitted: account.details_submitted,
          stripe_onboarding_complete: account.details_submitted
        })
        .eq('id', artist.id)
      if (updateError) throw updateError
      return
    }

    const { data: label, error: labelFetchError } = await supabase
      .from('labels')
      .select('id')
      .eq('stripe_account_id', account.id)
      .single()

    if (labelFetchError && labelFetchError.code !== 'PGRST116') throw labelFetchError

    if (label) {
      const { error: updateError } = await supabase
        .from('labels')
        .update({
          stripe_charges_enabled: account.charges_enabled,
          stripe_details_submitted: account.details_submitted,
          stripe_onboarding_complete: account.details_submitted
        })
        .eq('id', label.id)
      if (updateError) throw updateError
    }
  } catch (error) {
    console.error('Error handling account update:', error)
    throw error
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId
    const sellerId = paymentIntent.metadata.sellerId
    const sellerType = paymentIntent.metadata.sellerType

    if (!orderId) return

    // Update order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        status: 'processing',
        stripe_payment_intent_id: paymentIntent.id
      })
      .eq('id', orderId)
    if (orderError) throw orderError

    // Record payout entry
    if (sellerId && sellerType) {
      const amount = paymentIntent.amount / 100
      const platformFee = (paymentIntent.application_fee_amount || 0) / 100
      const netAmount = amount - platformFee

      const payoutData: any = {
        order_id: orderId,
        amount: amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: 'paid',
        paid_at: new Date().toISOString()
      }

      if (sellerType === 'label') {
        payoutData.label_id = sellerId
      } else {
        payoutData.artist_id = sellerId
      }

      const { error: payoutError } = await supabase.from('payouts').insert(payoutData)
      if (payoutError) throw payoutError
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
    throw error
  }
}

async function handleTransferCreated(transfer: Stripe.Transfer) {
  try {
    // Transfer to connected account created
    // You can track transfer IDs here if needed
    console.log('Transfer created:', transfer.id, 'to', transfer.destination)
  } catch (error) {
    console.error('Error handling transfer created:', error)
  }
}

async function handleTransferPaid(transfer: Stripe.Transfer) {
  try {
    // Transfer completed to connected account
    // Update payout record with transfer ID
    await supabase
      .from('payouts')
      .update({
        stripe_transfer_id: transfer.id,
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('order_id', transfer.metadata?.orderId)
  } catch (error) {
    console.error('Error handling transfer paid:', error)
  }
}
