import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/live-streams/[id]/chat - Get chat messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const before = searchParams.get('before'); // For pagination

    let query = supabase
      .from('stream_chat')
      .select('*')
      .eq('stream_id', id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Chat fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch chat' }, { status: 500 });
    }

    return NextResponse.json({ messages: messages?.reverse() || [] });

  } catch (error: any) {
    console.error('Get chat error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// POST /api/live-streams/[id]/chat - Send chat message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { id } = params;

    if (!user) {
      return NextResponse.json({ error: 'Must be logged in to chat' }, { status: 401 });
    }

    // Get stream details
    const { data: stream } = await supabase
      .from('live_streams')
      .select('allow_chat, status, artist_id, label_id')
      .eq('id', id)
      .single();

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (stream.status !== 'live') {
      return NextResponse.json({ error: 'Stream is not live' }, { status: 400 });
    }

    if (!stream.allow_chat) {
      return NextResponse.json({ error: 'Chat is disabled for this stream' }, { status: 403 });
    }

    // Get user details
    const { data: artist } = await supabase
      .from('artists')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .single();

    const { data: label } = await supabase
      .from('labels')
      .select('name as display_name, logo_url as avatar_url')
      .eq('id', user.id)
      .single();

    const { data: fan } = await supabase
      .from('fans')
      .select('display_name, avatar_url')
      .eq('id', user.id)
      .single();

    const userData = artist || label || fan;
    
    if (!userData) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 500) {
      return NextResponse.json({ error: 'Message too long (max 500 chars)' }, { status: 400 });
    }

    const isArtist = stream.artist_id === user.id || stream.label_id === user.id;

    const { data: chatMessage, error } = await supabase
      .from('stream_chat')
      .insert({
        stream_id: id,
        user_id: user.id,
        user_type: artist ? 'artist' : label ? 'label' : 'fan',
        user_name: userData.display_name,
        user_avatar: userData.avatar_url,
        message: message.trim(),
        is_artist: isArtist,
      })
      .select()
      .single();

    if (error) {
      console.error('Chat insert error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ message: chatMessage });

  } catch (error: any) {
    console.error('Send chat error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}