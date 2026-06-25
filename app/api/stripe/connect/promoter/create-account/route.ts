import { getSiteUrl } from "@/lib/site-url"
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }
    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
      apiVersion: '2024-12-18.acacia'
    })

    const authHeader = request.headers.get('authorization')
    const contentLength = request.headers.get('content-length')
    const hasBody = contentLength && parseInt(contentLength) > 0

    let promoterId: string
    let promoterEmail: string

    if (authHeader && !hasBody) {
      const token = authHeader.replace('Bearer ', '')
      const supabaseClient = createClient()
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
      if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { data: promoter, error: promoterError } = await supabaseClient
        .from('promoters')
        .select('id, email, stripe_account_id')
        .eq('id', user.id)
        .single()

      if (promoterError || !promoter) return NextResponse.json({ error: 'Promoter not found' }, { status: 404 })

      if (promoter.stripe_account_id) {
        const accountLink = await stripe.accountLinks.create({
          account: promoter.stripe_account_id,
          refresh_url: `${getSiteUrl()}/promoter/dashboard?stripe=refresh`,
          return_url: `${getSiteUrl()}/promoter/dashboard?stripe=success`,
          type: 'account_onboarding',
        })
        return NextResponse.json({ accountId: promoter.stripe_account_id, onboardingUrl: accountLink.url })
      }

      promoterId = promoter.id
      promoterEmail = promoter.email || ''
    } else {
      const body = await request.json()
      const { userId, email } = body

      if (!userId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const { data: existing } = await createClient()
        .from('promoters')
        .select('stripe_account_id')
        .eq('id', userId)
        .single()

      if (existing?.stripe_account_id) {
        return NextResponse.json({ accountId: existing.stripe_account_id, alreadyExists: true })
      }

      promoterId = userId
      promoterEmail = email || ''
    }

    const account = await stripe.accounts.create({
      type: 'express',
      email: promoterEmail,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_type: 'individual',
      metadata: {
        promoter_id: promoterId,
        platform: 'artistrax',
        account_type: 'promoter'
      }
    })

    await createClient()
      .from('promoters')
      .update({
        stripe_account_id: account.id,
        stripe_onboarding_complete: false,
        stripe_charges_enabled: false,
      })
      .eq('id', promoterId)

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${getSiteUrl()}/promoter/dashboard?stripe=refresh`,
      return_url: `${getSiteUrl()}/promoter/dashboard?stripe=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
      success: true
    })

  } catch (error: any) {
    console.error('Stripe Connect account creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Connect account' },
      { status: 500 }
    )
  }
}