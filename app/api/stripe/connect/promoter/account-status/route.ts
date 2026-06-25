import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
  apiVersion: '2024-12-18.acacia'
})

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const supabaseClient = createClient()

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: promoter } = await supabaseClient
      .from('promoters')
      .select('id, stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled')
      .eq('id', user.id)
      .single()

    if (!promoter) {
      return NextResponse.json({ error: 'Promoter not found' }, { status: 404 })
    }

    if (!promoter.stripe_account_id) {
      return NextResponse.json({
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false
      })
    }

    const dbResponse = {
      hasAccount: true,
      accountId: promoter.stripe_account_id,
      onboardingComplete: promoter.stripe_onboarding_complete ?? false,
      chargesEnabled: promoter.stripe_charges_enabled ?? false,
      payoutsEnabled: promoter.stripe_charges_enabled ?? false,
    }

    try {
      const account = await stripe.accounts.retrieve(promoter.stripe_account_id)
      return NextResponse.json({
        ...dbResponse,
        onboardingComplete: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements,
        email: account.email,
      })
    } catch {
      return NextResponse.json(dbResponse)
    }

  } catch (error: any) {
    console.error('Stripe account status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get account status' },
      { status: 500 }
    )
  }
}