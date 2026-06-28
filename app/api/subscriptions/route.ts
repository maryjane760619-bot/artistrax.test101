import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/subscriptions - Get all fan's subscriptions
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscriptions, error } = await supabase
      .from('fan_subscriptions')
      .select(`
        *,
        artists:artist_id (display_name, username, avatar_url),
        labels:label_id (name, slug, logo_url)
      `)
      .eq('fan_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch subscriptions error:', error);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    return NextResponse.json({ subscriptions: subscriptions || [] });

  } catch (error: any) {
    console.error('Get subscriptions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/subscriptions - Create new subscription
export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a fan
    const { data: fan } = await supabase
      .from('fans')
      .select('id, email')
      .eq('id', user.id)
      .single();

    if (!fan) {
      return NextResponse.json({ error: 'Must be a fan to subscribe' }, { status: 403 });
    }

    const body = await request.json();
    const { artist_id, label_id } = body;

    if (!artist_id && !label_id) {
      return NextResponse.json({ error: 'Artist ID or Label ID required' }, { status: 400 });
    }

    // Get creator's subscription settings
    const { data: settings } = await supabase
      .from('creator_subscription_settings')
      .select('*')
      .eq(artist_id ? 'artist_id' : 'label_id', artist_id || label_id)
      .single();

    if (!settings || !settings.is_enabled) {
      return NextResponse.json({ error: 'This creator is not accepting subscriptions' }, { status: 400 });
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('fan_subscriptions')
      .select('id, status')
      .eq('fan_id', user.id)
      .eq(artist_id ? 'artist_id' : 'label_id', artist_id || label_id)
      .single();

    if (existing && existing.status === 'active') {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 400 });
    }

    // Create Stripe checkout session
    const stripeResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/create-subscription-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fan_id: user.id,
        artist_id,
        label_id,
        price: settings.monthly_price,
        success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/fan/subscriptions?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/${artist_id ? 'artists' : 'labels'}/${artist_id || label_id}`,
      }),
    });

    if (!stripeResponse.ok) {
      throw new Error('Failed to create checkout session');
    }

    const { url } = await stripeResponse.json();

    return NextResponse.json({ checkout_url: url });

  } catch (error: any) {
    console.error('Create subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}