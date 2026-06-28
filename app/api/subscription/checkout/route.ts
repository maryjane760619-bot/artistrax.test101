import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
      apiVersion: '2024-12-18.acacia',
    });

    const { priceId, accountType, accountId, email, successUrl, cancelUrl } = await request.json();

    if (!priceId || !accountType || !accountId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['artist', 'label'].includes(accountType)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Check if account already has a Stripe customer ID
    const { data: account } = await supabase
      .from(accountType === 'artist' ? 'artists' : 'labels')
      .select('stripe_customer_id, email')
      .eq('id', accountId)
      .single();

    let customerId = account?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          accountType,
          accountId,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await supabase
        .from(accountType === 'artist' ? 'artists' : 'labels')
        .update({ stripe_customer_id: customerId })
        .eq('id', accountId);
    }

    // Create Stripe Checkout Session for subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          accountType,
          accountId,
        },
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/${accountType}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/${accountType}/dashboard`,
      metadata: {
        accountType,
        accountId,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
