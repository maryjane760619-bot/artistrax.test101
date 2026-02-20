import { createClient } from '@/lib/supabase';
import { createLiveStream } from '@/lib/mux';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/live-streams - Create a new live stream
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is an artist or label
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
      return NextResponse.json({ error: 'Only artists and labels can create streams' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, is_public = true, require_subscription = false, allow_chat = true } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create Mux live stream
    const muxStream = await createLiveStream(title);

    // Save to database
    const { data: stream, error } = await supabase
      .from('live_streams')
      .insert({
        artist_id: artist ? user.id : null,
        label_id: label ? user.id : null,
        title,
        description,
        status: 'scheduled',
        mux_stream_key: muxStream.streamKey,
        mux_playback_id: muxStream.playbackId,
        mux_live_stream_id: muxStream.liveStreamId,
        is_public,
        require_subscription,
        allow_chat,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to create stream' }, { status: 500 });
    }

    return NextResponse.json({
      stream: {
        id: stream.id,
        title: stream.title,
        status: stream.status,
        streamKey: stream.mux_stream_key,
        playbackId: stream.mux_playback_id,
      }
    });

  } catch (error: any) {
    console.error('Create stream error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// GET /api/live-streams - Get live streams
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const artistId = searchParams.get('artist_id');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('live_streams')
      .select(`
        *,
        artists:artist_id (display_name, username, avatar_url),
        labels:label_id (name, slug, logo_url)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    if (artistId) {
      query = query.eq('artist_id', artistId);
    }

    const { data: streams, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 });
    }

    return NextResponse.json({ streams: streams || [] });

  } catch (error: any) {
    console.error('Get streams error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}