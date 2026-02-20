import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/live-streams/[id]/viewers - Join as viewer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { id } = params;

    // Get stream details
    const { data: stream } = await supabase
      .from('live_streams')
      .select('status, require_subscription, require_purchase, artist_id, label_id')
      .eq('id', id)
      .single();

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (stream.status !== 'live') {
      return NextResponse.json({ error: 'Stream is not live' }, { status: 400 });
    }

    // Check permissions
    if (stream.require_subscription && user) {
      // Check if user is subscribed to artist/label
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .or(`artist_id.eq.${stream.artist_id},label_id.eq.${stream.label_id}`)
        .eq('fan_id', user.id)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
      }
    }

    if (stream.require_purchase && user) {
      // Check if user has purchased from artist/label
      const { data: purchase } = await supabase
        .from('purchases')
        .select('id')
        .or(`artist_id.eq.${stream.artist_id},label_id.eq.${stream.label_id}`)
        .eq('buyer_id', user.id)
        .single();

      if (!purchase) {
        return NextResponse.json({ error: 'Purchase required' }, { status: 403 });
      }
    }

    // Record viewer joining
    if (user) {
      const { data: viewer } = await supabase
        .from('stream_viewers')
        .upsert({
          stream_id: id,
          user_id: user.id,
          user_type: 'fan', // Simplified - could be artist/label too
          joined_at: new Date().toISOString(),
          last_ping_at: new Date().toISOString(),
        }, {
          onConflict: 'stream_id, user_id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      return NextResponse.json({ 
        success: true, 
        viewer_id: viewer?.id,
        message: 'Joined stream' 
      });
    } else {
      // Anonymous viewer
      return NextResponse.json({ 
        success: true, 
        viewer_id: null,
        message: 'Joined as anonymous viewer' 
      });
    }

  } catch (error: any) {
    console.error('Join stream error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/live-streams/[id]/viewers - Leave as viewer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { id } = params;

    if (!user) {
      return NextResponse.json({ success: true }); // Anonymous, nothing to update
    }

    // Update viewer record
    const { error } = await supabase
      .from('stream_viewers')
      .update({
        left_at: new Date().toISOString(),
      })
      .eq('stream_id', id)
      .eq('user_id', user.id)
      .is('left_at', null);

    if (error) {
      console.error('Leave stream error:', error);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Leave stream error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}