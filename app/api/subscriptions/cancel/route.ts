import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {
      apiVersion: '2024-12-18.acacia',
    });

    const body = await request.json();
    const { userId, userType, subscriptionId } = body;

    if (!userId || !userType || !subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Cancel subscription at period end (not immediately)
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update database
    const tableName = userType === 'artist' ? 'artists' : 'labels';
    await supabase
      .from(tableName)
      .update({
        subscription_status: 'canceled',
        // Keep subscription_expires_at so they have access until then
      })
      .eq('id', userId);

    // Log event
    await supabase.from('subscription_events').insert({
      user_id: userId,
      user_type: userType,
      event_type: 'subscription_canceled',
      stripe_event_id: subscriptionId,
      metadata: {
        canceled_at: new Date().toISOString(),
        cancel_at_period_end: true,
        period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
      access_until: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
