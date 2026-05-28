import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getSiteUrl } from '@/lib/site-url'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { trackIds, fanEmail } = await request.json()

    if (!trackIds || trackIds.length === 0) {
      return NextResponse.json({ error: 'No tracks provided' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch all tracks with artist/label Stripe accounts
    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('*, artists(display_name, stripe_account_id), labels(name, stripe_account_id)')
      .in('id', trackIds)

    if (tracksError || !tracks || tracks.length === 0) {
      return NextResponse.json({ error: 'Tracks not found' }, { status: 404 })
    }

    // All tracks must go to the same connected account for one Stripe session
    const recipientAccount = tracks[0].label_id
      ? tracks[0].labels?.stripe_account_id
      : tracks[0].artists?.stripe_account_id

    if (!recipientAccount) {
      return NextResponse.json({
        error: 'Artist/Label must complete Stripe onboarding before selling tracks'
      }, { status: 400 })
    }

    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
      apiVersion: '2024-11-20.acacia',
    })

    // Build line items
    const lineItems = tracks.map(track => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: track.title,
          description: track.artists?.display_name || track.labels?.name || 'Unknown Artist',
          images: track.cover_url ? [track.cover_url] : undefined,
        },
        unit_amount: Math.round(Number(track.price) * 100),
      },
      quantity: 1,
    }))

    // Total platform fee (10% for labels, 5% for artists)
    const totalAmount = tracks.reduce((sum, t) => sum + Math.round(Number(t.price) * 100), 0)
    const platformFeePercent = tracks[0].label_id ? 0.10 : 0.05
    const platformFee = Math.round(totalAmount * platformFeePercent)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      customer_email: fanEmail || undefined,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: recipientAccount,
        },
      },
      metadata: {
        trackIds: trackIds.join(','),
        artistId: tracks[0].artist_id || '',
        labelId: tracks[0].label_id || '',
      },
      success_url: `${getSiteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/cart`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Cart checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
