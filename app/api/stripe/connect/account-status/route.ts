import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Check Stripe Connect account status and onboarding completion
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get authenticated user (artist)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get artist details
    const { data: artist, error: artistError } = await supabase
      .from('artists')
      .select('id, stripe_account_id')
      .eq('id', user.id)
      .single()

    if (artistError || !artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
    }

    // No Stripe account yet
    if (!artist.stripe_account_id) {
      return NextResponse.json({
        hasAccount: false,
        onboardingComplete: false,
        chargesEnabled: false,
        payoutsEnabled: false
      })
    }

    // Get Stripe account details
    const account = await stripe.accounts.retrieve(artist.stripe_account_id)

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
