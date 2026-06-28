import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getSiteUrl } from '@/lib/site-url'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Dedicated checkout path for bundle purchases. Deliberately separate from
// /api/checkout/cart -- doesn't touch that file at all. Reuses the same
// metadata.trackIds contract the Stripe webhook already trusts for
// fulfillment, so a bundle purchase is recorded as individual track
// purchases through code that's already tested and live, with zero
// changes to the webhook.
export async function POST(request: NextRequest) {
  try {
    const { bundleId, fanEmail } = await request.json()

    if (!bundleId) {
      return NextResponse.json({ error: 'Bundle ID required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: bundle, error: bundleError } = await supabase
      .from('bundles')
      .select(`
        id, title, discount_percent, cover_url, artist_id, label_id, is_active,
        artists (display_name, stripe_account_id),
        labels (name, stripe_account_id),
        bundle_tracks (track_id)
      `)
      .eq('id', bundleId)
      .single()

    if (bundleError || !bundle || !bundle.is_active) {
      return NextResponse.json({ error: 'Bundle not found' }, { status: 404 })
    }

    const trackIds = (bundle.bundle_tracks || []).map((bt: any) => bt.track_id)
    if (trackIds.length === 0) {
      return NextResponse.json({ error: 'This bundle has no tracks' }, { status: 400 })
    }

    const { data: tracks, error: tracksError } = await supabase
      .from('tracks')
      .select('id, title, price')
      .in('id', trackIds)

    if (tracksError || !tracks || tracks.length === 0) {
      return NextResponse.json({ error: 'Bundle tracks not found' }, { status: 404 })
    }

    const recipientAccount = bundle.label_id
      ? (bundle.labels as any)?.stripe_account_id
      : (bundle.artists as any)?.stripe_account_id

    if (!recipientAccount) {
      return NextResponse.json(
        { error: 'Seller must complete Stripe onboarding before selling bundles' },
        { status: 400 }
      )
    }

    const fullPrice = tracks.reduce((sum, t) => sum + Number(t.price), 0)
    const discountedPrice = fullPrice * (1 - bundle.discount_percent / 100)
    const sellerName = (bundle.artists as any)?.display_name || (bundle.labels as any)?.name || 'Unknown'

    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
      apiVersion: '2024-11-20.acacia',
    })

    const totalAmountCents = Math.round(discountedPrice * 100)
    const platformFeePercent = bundle.label_id ? 0.10 : 0.05
    const platformFee = Math.round(totalAmountCents * platformFeePercent)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${bundle.title} (${tracks.length} tracks, ${bundle.discount_percent}% off)`,
              description: sellerName,
              images: bundle.cover_url ? [bundle.cover_url] : undefined,
            },
            unit_amount: totalAmountCents,
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
        trackIds: trackIds.join(','),
        artistId: bundle.artist_id || '',
        labelId: bundle.label_id || '',
        bundleId: bundle.id,
      },
      success_url: `${getSiteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/bundles`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Bundle checkout error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
