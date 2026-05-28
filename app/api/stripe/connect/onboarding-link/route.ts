import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
  apiVersion: '2024-12-18.acacia'
})

export async function POST(request: NextRequest) {
  try {
    const { accountId, userType } = await request.json()

    if (!accountId || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const dashboardPath = userType === 'artist' ? '/artist/dashboard' : '/label/dashboard'

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}${dashboardPath}?stripe_refresh=true`,
      return_url: `${baseUrl}${dashboardPath}?stripe_onboarding=complete`,
      type: 'account_onboarding'
    })

    return NextResponse.json({
      url: accountLink.url,
      success: true
    })

  } catch (error: any) {
    console.error('Stripe onboarding link error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create onboarding link' },
      { status: 500 }
    )
  }
}
