import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Create Stripe Express Connect account for artist
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(request)
    
    // Get authenticated user
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
      .select('id, email, display_name, stripe_account_id')
      .eq('id', user.id)
      .single()

    if (artistError || !artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
    }

    // Check if artist already has a Stripe account
    if (artist.stripe_account_id) {
      return NextResponse.json(
        { error: 'Stripe account already exists', accountId: artist.stripe_account_id },
        { status: 400 }
      )
    }

    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // Default to US, can be changed during onboarding
      email: artist.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual', // Most artists are individuals
      metadata: {
        artist_id: artist.id,
        artist_name: artist.display_name,
        platform: 'artistrax'
      }
    })

    // Save Stripe account ID to database
    const { error: updateError } = await supabase
      .from('artists')
      .update({ stripe_account_id: account.id })
      .eq('id', artist.id)

    if (updateError) {
      console.error('Error saving Stripe account ID:', updateError)
      // Don't fail the request, account is created
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/artist/dashboard?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/artist/dashboard?stripe=success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url
    })

  } catch (error: any) {
    console.error('Stripe Connect account creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe account' },
      { status: 500 }
    )
  }
}
