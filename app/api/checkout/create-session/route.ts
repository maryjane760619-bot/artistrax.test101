import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
      apiVersion: '2026-01-28.clover'
    })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { trackId } = body

    if (!trackId) {
      return NextResponse.json({ error: 'Track ID required' }, { status: 400 })
    }

    // Get track details
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select(`
        *,
        artists:artist_id (display_name, stripe_account_id)
      `)
      .eq('id', trackId)
      .single()

    if (trackError || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    // Get label details for platform fee
    const { data: label } = await supabase
      .from('labels')
      .select('stripe_account_id')
      .eq('id', track.label_id)
      .single()

    if (!label?.stripe_account_id) {
      return NextResponse.json({ error: 'Label Stripe account not found' }, { status: 400 })
    }

    // Calculate amounts
    const unitAmount = Math.round(track.price * 100)
    const platformFee = Math.round(unitAmount * 0.10)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: track.title,
              description: `Digital download by ${track.artists?.display_name || 'Unknown Artist'}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: label.stripe_account_id,
        },
      },
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/track/${trackId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/track/${trackId}`,
      metadata: {
        trackId: trackId,
        labelId: track.label_id,
        artistId: track.artist_id
      }
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url
    })

  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}