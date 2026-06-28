import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/creator/subscription-settings - Get creator's subscription settings
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is artist or label
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('id', user.id)
      .single();
    
    const { data: label } = await supabase
      .from('labels')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!artist && !label) {
      return NextResponse.json({ error: 'Only artists and labels can have subscription settings' }, { status: 403 });
    }

    const { data: settings, error } = await supabase
      .from('creator_subscription_settings')
      .select('*')
      .eq(artist ? 'artist_id' : 'label_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Fetch settings error:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // If no settings exist, return defaults
    if (!settings) {
      return NextResponse.json({
        settings: {
          is_enabled: false,
          monthly_price: 5.00,
          description: 'Support my music and get exclusive perks',
          benefits_discount_percent: 10,
          benefits_early_access_hours: 24,
          benefits_exclusive_streams: true,
          benefits_subscriber_badge: true,
        }
      });
    }

    return NextResponse.json({ settings });

  } catch (error: any) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/creator/subscription-settings - Update creator's subscription settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is artist or label
    const { data: artist } = await supabase
      .from('artists')
      .select('id')
      .eq('id', user.id)
      .single();

    const { data: label } = await supabase
      .from('labels')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!artist && !label) {
      return NextResponse.json({ error: 'Only artists and labels can update subscription settings' }, { status: 403 });
    }

    const body = await request.json();
    const {
      is_enabled,
      monthly_price,
      description,
      welcome_message,
      benefits_discount_percent,
      benefits_early_access_hours,
      benefits_exclusive_streams,
      benefits_subscriber_badge,
    } = body;

    // Validate price
    if (monthly_price && (monthly_price < 1 || monthly_price > 50)) {
      return NextResponse.json({ error: 'Price must be between $1 and $50' }, { status: 400 });
    }

    const updateData: any = {
      is_enabled,
      monthly_price,
      description,
      welcome_message,
      benefits_discount_percent,
      benefits_early_access_hours,
      benefits_exclusive_streams,
      benefits_subscriber_badge,
    };

    // Check if settings already exist
    const { data: existing } = await supabase
      .from('creator_subscription_settings')
      .select('id')
      .eq(artist ? 'artist_id' : 'label_id', user.id)
      .single();

    let result;
    if (existing) {
      // Update existing
      result = await supabase
        .from('creator_subscription_settings')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Create new
      result = await supabase
        .from('creator_subscription_settings')
        .insert({
          ...updateData,
          [artist ? 'artist_id' : 'label_id']: user.id,
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Update settings error:', result.error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ settings: result.data });

  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}