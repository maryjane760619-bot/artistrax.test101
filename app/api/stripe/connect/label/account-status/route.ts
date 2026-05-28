import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
  apiVersion: '2024-12-18.acacia',
})

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: label, error: labelError } = await supabase
      .from('labels')
      .select('id, stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled')
      .eq('id', user.id)
      .single()

    if (labelError || !label) {
      return NextResponse.json(
        { error: 'Label not found' },
        { status: 404 }
      )
    }

    if (!label.stripe_account_id) {
      return NextResponse.json({
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false
      })
    }

    // Use DB values as primary source of truth — Stripe API as optional enhancement
    const dbResponse = {
      hasAccount: true,
      accountId: label.stripe_account_id,
      onboardingComplete: label.stripe_onboarding_complete ?? false,
      chargesEnabled: label.stripe_charges_enabled ?? false,
      payoutsEnabled: label.stripe_charges_enabled ?? false,
    }

    // Try to enrich with live Stripe data, but don't fail if unavailable
    try {
      const account = await stripe.accounts.retrieve(label.stripe_account_id)
      return NextResponse.json({
        ...dbResponse,
        onboardingComplete: account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements,
        email: account.email,
      })
    } catch {
      // Stripe API unavailable or account mismatch — return DB state
      return NextResponse.json(dbResponse)
    }

  } catch (error: any) {
    console.error('Stripe account status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check account status' },
      { status: 500 }
    )
  }
}
