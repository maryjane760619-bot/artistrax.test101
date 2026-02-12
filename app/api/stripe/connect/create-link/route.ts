import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Create new account link for existing Stripe Connect account
// Used when onboarding link expires or artist needs to update info
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request)
    
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

    if (!artist.stripe_account_id) {
      return NextResponse.json(
        { error: 'No Stripe account found. Create one first.' },
        { status: 400 }
      )
    }

    // Create new account link
    const accountLink = await stripe.accountLinks.create({
      account: artist.stripe_account_id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/artist/dashboard?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/artist/dashboard?stripe=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      onboardingUrl: accountLink.url
    })

  } catch (error: any) {
    console.error('Stripe account link creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create account link' },
      { status: 500 }
    )
  }
}
