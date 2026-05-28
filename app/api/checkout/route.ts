import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import { getSiteUrl } from '@/lib/site-url'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { trackId, fanEmail } = await request.json()

    if (!trackId) {
      return NextResponse.json({ error: 'Track ID required' }, { status: 400 })
    }

    // Fetch track details with artist's Stripe account
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('*, artists(display_name, stripe_account_id), labels(name, stripe_account_id)')
      .eq('id', trackId)
      .single()

    if (trackError || !track) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 })
    }

    // Check if track is free
    if (track.is_free) {
      return NextResponse.json({ error: 'This track is free' }, { status: 400 })
    }

    // Determine who gets paid (artist or label)
    const recipientAccount = track.label_id 
      ? track.labels?.stripe_account_id 
      : track.artists?.stripe_account_id

    if (!recipientAccount) {
      return NextResponse.json({ 
        error: 'Artist/Label must complete Stripe onboarding before selling tracks' 
      }, { status: 400 })
    }

    // Calculate platform fee (5% for artists, 10% for labels)
    const platformFeePercent = track.label_id ? 0.10 : 0.05
    const totalAmount = Math.round(track.price * 100) // Convert to cents
    const platformFee = Math.round(totalAmount * platformFeePercent)

    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
      apiVersion: '2024-11-20.acacia',
    })

    // Create Stripe Checkout Session with Connect
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: track.title,
              description: track.artists?.display_name || track.labels?.name || 'Unknown Artist',
              images: track.cover_url ? [track.cover_url] : undefined,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      customer_email: fanEmail || undefined,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: recipientAccount,
        },
      },
      metadata: {
        trackId: track.id,
        artistId: track.artist_id,
        labelId: track.label_id || '',
        platformFee: platformFee.toString(),
      },
      success_url: `${getSiteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/track/${trackId}`,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
