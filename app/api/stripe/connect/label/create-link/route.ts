import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from "@/lib/supabase-server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
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
      return NextResponse.json(
        { error: 'No Stripe account found. Create one first.' },
        { status: 400 }
      )
    }

    const accountLink = await stripe.accountLinks.create({
      account: label.stripe_account_id,
      refresh_url: `${process.env.NEXT_PUBLIC_SITE_URL}/label/dashboard?stripe=refresh`,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/label/dashboard?stripe=success`,
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
