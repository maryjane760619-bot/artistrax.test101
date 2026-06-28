import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/creator/subscribers - Get all subscribers for creator
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
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
      return NextResponse.json({ error: 'Only artists and labels can view subscribers' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    const { data: subscribers, error } = await supabase
      .from('fan_subscriptions')
      .select(`
        *,
        fans:fan_id (display_name, email, avatar_url)
      `)
      .eq(artist ? 'artist_id' : 'label_id', user.id)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch subscribers error:', error);
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
    }

    // Calculate stats
    const totalSubscribers = subscribers?.length || 0;
    const monthlyRevenue = subscribers?.reduce((sum, s) => sum + s.monthly_price, 0) || 0;

    return NextResponse.json({
      subscribers: subscribers || [],
      stats: {
        total: totalSubscribers,
        monthlyRevenue,
        averagePrice: totalSubscribers > 0 ? monthlyRevenue / totalSubscribers : 0,
      }
    });

  } catch (error: any) {
    console.error('Get subscribers error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}