import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const headersList = headers()
  const authHeader = headersList.get('x-webhook-admin-key')

  // Simple admin key check (env var or hardcoded for now)
  if (authHeader !== 'artistrax-admin-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim()
    if (!stripeKey || stripeKey.includes('...')) {
      return NextResponse.json({ error: 'Invalid Stripe key' }, { status: 500 })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })

    // List existing webhook endpoints
    const endpoints = await stripe.webhookEndpoints.list({ limit: 10 })

    const results = {
      vercel_url: process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL || 'unknown',
      existing_endpoints: endpoints.data.map(e => ({
        id: e.id,
        url: e.url,
        status: e.status,
        enabled_events: e.enabled_events.slice(0, 5),
        created: new Date(e.created * 1000).toISOString()
      }))
    }

    // Find and update the stripe-connect webhook
    const connectEndpoint = endpoints.data.find(e => 
      e.url.includes('stripe-connect') || e.url.includes('webhook')
    )

    if (connectEndpoint) {
      const vercelBase = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL || 'https://music-download-store-2.vercel.app'

      const newUrl = `${vercelBase}/api/webhooks/stripe`

      if (connectEndpoint.url !== newUrl) {
        const updated = await stripe.webhookEndpoints.update(connectEndpoint.id, {
          url: newUrl,
          enabled_events: [
            'checkout.session.completed',
            'checkout.session.expired',
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'account.updated',
            'account.application.deauthorized'
          ]
        })
        results.updated = {
          id: updated.id,
          old_url: connectEndpoint.url,
          new_url: updated.url,
          secret_preview: updated.secret?.substring(0, 10) + '...'
        }
      } else {
        results.updated = 'already correct'
      }
    }

    return NextResponse.json(results)

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}