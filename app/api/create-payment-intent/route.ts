import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId, metadata, sellerId, sellerType } = await request.json()

    if (!sellerId || !sellerType) {
      return NextResponse.json(
        { error: 'Seller information required' },
        { status: 400 }
      )
    }

    // Get seller's Stripe Connect account
    const table = sellerType === 'label' ? 'labels' : 'artists'
    const { data: seller, error: sellerError } = await supabase
      .from(table)
      .select('stripe_account_id, stripe_charges_enabled')
      .eq('id', sellerId)
      .single()

    if (sellerError || !seller) {
      return NextResponse.json(
        { error: 'Seller not found' },
        { status: 404 }
      )
    }

    if (!seller.stripe_account_id || !seller.stripe_charges_enabled) {
      return NextResponse.json(
        { error: 'Seller has not completed Stripe setup' },
        { status: 400 }
      )
    }

    // Calculate platform fee (5% of total)
    const totalCents = Math.round(amount * 100)
    const platformFeeCents = Math.round(totalCents * 0.05)

    // Create a PaymentIntent with destination charge (95/5 split)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      application_fee_amount: platformFeeCents, // Platform keeps 5%
      transfer_data: {
        destination: seller.stripe_account_id, // 95% goes to seller
      },
      metadata: {
        orderId,
        sellerId,
        sellerType,
        ...metadata
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    console.error('Payment intent creation error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
