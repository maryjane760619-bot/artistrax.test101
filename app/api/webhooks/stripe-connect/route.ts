import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

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

async function handleAccountUpdated(account: Stripe.Account) {
  try {
    // Find which user this account belongs to (check artists then labels)
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('stripe_account_id', account.id)
      .single()

    if (artist) {
      await supabase
        .from('artists')
        .update({
          stripe_charges_enabled: account.charges_enabled,
          stripe_details_submitted: account.details_submitted,
          stripe_onboarding_complete: account.details_submitted
        })
        .eq('id', artist.id)
      return
    }

    const { data: label } = await supabase
      .from('labels')
      .select('id')
      .eq('stripe_account_id', account.id)
      .single()

    if (label) {
      await supabase
        .from('labels')
        .update({
          stripe_charges_enabled: account.charges_enabled,
          stripe_details_submitted: account.details_submitted,
          stripe_onboarding_complete: account.details_submitted
        })
        .eq('id', label.id)
    }
  } catch (error) {
    console.error('Error handling account update:', error)
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const orderId = paymentIntent.metadata.orderId
    const sellerId = paymentIntent.metadata.sellerId
    const sellerType = paymentIntent.metadata.sellerType

    if (!orderId) return

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'processing',
        stripe_payment_intent_id: paymentIntent.id
      })
      .eq('id', orderId)

    // Record payout entry
    if (sellerId && sellerType) {
      const amount = paymentIntent.amount / 100 // Convert from cents
      const platformFee = (paymentIntent.application_fee_amount || 0) / 100
      const netAmount = amount - platformFee

      const payoutData: any = {
        order_id: orderId,
        amount: amount,
        platform_fee: platformFee,
        net_amount: netAmount,
        status: 'paid', // Payment succeeded, money is in Connect account
        paid_at: new Date().toISOString()
      }

      if (sellerType === 'label') {
        payoutData.label_id = sellerId
      } else {
        payoutData.artist_id = sellerId
      }

      await supabase.from('payouts').insert(payoutData)
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
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
