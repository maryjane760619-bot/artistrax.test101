import { getSiteUrl } from "@/lib/site-url"
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || '').trim(), {
      apiVersion: '2024-12-18.acacia',
    })
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: promoter, error: promoterError } = await supabase
      .from('promoters')
      .select('id, stripe_account_id')
      .eq('id', user.id)
      .single()

    if (promoterError || !promoter) {
      return NextResponse.json({ error: 'Promoter not found' }, { status: 404 })
    }

    if (!promoter.stripe_account_id) {
      return NextResponse.json({ error: 'No Stripe account found. Create one first.' }, { status: 400 })
    }

    const accountLink = await stripe.accountLinks.create({
      account: promoter.stripe_account_id,
      refresh_url: `${getSiteUrl()}/promoter/dashboard?stripe=refresh`,
      return_url: `${getSiteUrl()}/promoter/dashboard?stripe=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ onboardingUrl: accountLink.url })

  } catch (error: any) {
    console.error('Stripe account link creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create account link' },
      { status: 500 }
    )
  }
}