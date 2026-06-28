import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { linkId } = await request.json();

    if (!linkId) {
      return NextResponse.json({ error: 'linkId required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Increment click count
    const { error: incrementError } = await supabase.rpc('increment_link_clicks', {
      p_link_id: linkId,
    });

    if (incrementError) {
      console.error('Failed to increment clicks:', incrementError);
    }

    // Log click for analytics (optional - collect referrer, user agent, etc.)
    const referrer = request.headers.get('referer') || null;
    const userAgent = request.headers.get('user-agent') || null;
    
    // Get IP address (Vercel provides this)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : null;

    const { error: logError } = await supabase.from('link_clicks').insert({
      link_id: linkId,
      referrer,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    if (logError) {
      console.error('Failed to log click:', logError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Click tracking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to track click' },
      { status: 500 }
    );
  }
}
