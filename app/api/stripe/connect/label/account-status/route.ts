import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: label, error: labelError } = await supabase
      .from('labels')
      .select('id, stripe_account_id')
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

    const account = await stripe.accounts.retrieve(label.stripe_account_id)

    return NextResponse.json({
      hasAccount: true,
      accountId: account.id,
      onboardingComplete: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      email: account.email
    })

  } catch (error: any) {
    console.error('Stripe account status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check account status' },
      { status: 500 }
    )
  }
}
