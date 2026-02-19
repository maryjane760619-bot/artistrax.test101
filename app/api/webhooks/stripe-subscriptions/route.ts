import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Received webhook event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userType = session.metadata?.user_type;
  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan;

  if (!userType || !userId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  const tableName = userType === 'artist' ? 'artists' : 'labels';
  const subscriptionId = session.subscription as string;

  // Update user with subscription info
  await supabase
    .from(tableName)
    .update({
      subscription_status: 'trialing',
      subscription_tier: plan,
      stripe_subscription_id: subscriptionId,
      stripe_customer_id: session.customer as string,
      trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      subscription_started_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Log event
  await supabase.from('subscription_events').insert({
    user_id: userId,
    user_type: userType,
    event_type: 'trial_started',
    stripe_event_id: subscriptionId,
    metadata: { plan, session_id: session.id },
  });

  console.log(`Trial started for ${userType} ${userId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userType = subscription.metadata?.user_type;
  const userId = subscription.metadata?.user_id;

  if (!userType || !userId) {
    console.error('Missing metadata in subscription');
    return;
  }

  const tableName = userType === 'artist' ? 'artists' : 'labels';

  // Determine tier from price ID
  let tier = 'monthly';
  const priceId = subscription.items.data[0]?.price.id;
  if (priceId === process.env.STRIPE_ARTIST_ANNUAL_PRICE_ID || 
      priceId === process.env.STRIPE_LABEL_ANNUAL_PRICE_ID) {
    tier = 'annual';
  }

  // Calculate expiration date
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Update user subscription
  await supabase
    .from(tableName)
    .update({
      subscription_status: subscription.status,
      subscription_tier: tier,
      subscription_expires_at: currentPeriodEnd.toISOString(),
      stripe_subscription_id: subscription.id,
    })
    .eq('id', userId);

  // Log event
  await supabase.from('subscription_events').insert({
    user_id: userId,
    user_type: userType,
    event_type: subscription.status === 'active' ? 'subscription_created' : 'subscription_updated',
    stripe_event_id: subscription.id,
    metadata: { 
      status: subscription.status,
      tier,
      current_period_end: currentPeriodEnd.toISOString(),
    },
  });

  console.log(`Subscription updated for ${userType} ${userId}: ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userType = subscription.metadata?.user_type;
  const userId = subscription.metadata?.user_id;

  if (!userType || !userId) {
    console.error('Missing metadata in subscription');
    return;
  }

  const tableName = userType === 'artist' ? 'artists' : 'labels';

  // Update user subscription to canceled
  await supabase
    .from(tableName)
    .update({
      subscription_status: 'canceled',
      subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('id', userId);

  // Log event
  await supabase.from('subscription_events').insert({
    user_id: userId,
    user_type: userType,
    event_type: 'subscription_canceled',
    stripe_event_id: subscription.id,
    metadata: { 
      canceled_at: new Date(subscription.canceled_at! * 1000).toISOString(),
      ends_at: new Date(subscription.current_period_end * 1000).toISOString(),
    },
  });

  console.log(`Subscription canceled for ${userType} ${userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // Get subscription to find user
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userType = subscription.metadata?.user_type;
  const userId = subscription.metadata?.user_id;

  if (!userType || !userId) return;

  // Log payment event
  await supabase.from('subscription_events').insert({
    user_id: userId,
    user_type: userType,
    event_type: 'payment_succeeded',
    stripe_event_id: invoice.id,
    metadata: {
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      invoice_id: invoice.id,
    },
  });

  console.log(`Payment succeeded for ${userType} ${userId}: $${invoice.amount_paid / 100}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // Get subscription to find user
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userType = subscription.metadata?.user_type;
  const userId = subscription.metadata?.user_id;

  if (!userType || !userId) return;

  const tableName = userType === 'artist' ? 'artists' : 'labels';

  // Update subscription status to past_due
  await supabase
    .from(tableName)
    .update({ subscription_status: 'past_due' })
    .eq('id', userId);

  // Log payment failure
  await supabase.from('subscription_events').insert({
    user_id: userId,
    user_type: userType,
    event_type: 'payment_failed',
    stripe_event_id: invoice.id,
    metadata: {
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      invoice_id: invoice.id,
      attempt_count: invoice.attempt_count,
    },
  });

  console.log(`Payment failed for ${userType} ${userId}`);
}
