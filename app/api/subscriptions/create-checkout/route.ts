import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userType, userId, plan } = body;

    if (!userType || !userId || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (userType !== 'artist' && userType !== 'label') {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      );
    }

    if (plan !== 'monthly' && plan !== 'annual') {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Get user data
    const tableName = userType === 'artist' ? 'artists' : 'labels';
    const { data: userData, error: userError } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the correct Stripe Price ID
    let priceId: string;
    if (userType === 'artist') {
      priceId = plan === 'monthly'
        ? process.env.STRIPE_ARTIST_MONTHLY_PRICE_ID!
        : process.env.STRIPE_ARTIST_ANNUAL_PRICE_ID!;
    } else {
      priceId = plan === 'monthly'
        ? process.env.STRIPE_LABEL_MONTHLY_PRICE_ID!
        : process.env.STRIPE_LABEL_ANNUAL_PRICE_ID!;
    }

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price configuration missing' },
        { status: 500 }
      );
    }

    // Create or get Stripe customer
    let stripeCustomerId = userData.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: userData.email || undefined,
        metadata: {
          user_type: userType,
          user_id: userId,
          username: userData.username || userData.name,
        },
      });

      stripeCustomerId = customer.id;

      // Save customer ID to database
      await supabase
        .from(tableName)
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          user_type: userType,
          user_id: userId,
          plan: plan,
        },
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${userType}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${userType}/subscribe?canceled=true`,
      metadata: {
        user_type: userType,
        user_id: userId,
        plan: plan,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
