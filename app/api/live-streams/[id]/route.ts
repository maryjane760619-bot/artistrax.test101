import { createClient } from '@/lib/supabase';
import { getLiveStreamStatus } from '@/lib/mux';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/live-streams/[id] - Get stream details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { id } = params;

    const { data: stream, error } = await supabase
      .from('live_streams')
      .select(`
        *,
        artists:artist_id (display_name, username, avatar_url),
        labels:label_id (name, slug, logo_url)
      `)
      .eq('id', id)
      .single();

    if (error || !stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    // Check if stream is actually live in Mux
    if (stream.mux_live_stream_id && stream.status === 'live') {
      try {
        const muxStatus = await getLiveStreamStatus(stream.mux_live_stream_id);
        if (!muxStatus.isActive && stream.status === 'live') {
          // Stream ended in Mux but not updated in DB
          await supabase
            .from('live_streams')
            .update({ status: 'ended', ended_at: new Date().toISOString() })
            .eq('id', id);
          stream.status = 'ended';
        }
      } catch (e) {
        // Ignore Mux errors
      }
    }

    // Get active viewer count
    const { count: viewerCount } = await supabase
      .from('stream_viewers')
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', id)
      .is('left_at', null);

    return NextResponse.json({
      stream: {
        ...stream,
        viewer_count: viewerCount || 0,
      }
    });

  } catch (error: any) {
    console.error('Get stream error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/live-streams/[id] - Update stream (start/end)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { action } = body; // 'start' or 'end'

    // Verify ownership
    const { data: stream } = await supabase
      .from('live_streams')
      .select('artist_id, label_id, status')
      .eq('id', id)
      .single();

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (stream.artist_id !== user.id && stream.label_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let updateData: any = {};

    if (action === 'start') {
      if (stream.status === 'live') {
        return NextResponse.json({ error: 'Stream is already live' }, { status: 400 });
      }
      updateData = {
        status: 'live',
        started_at: new Date().toISOString(),
      };
    } else if (action === 'end') {
      if (stream.status !== 'live') {
        return NextResponse.json({ error: 'Stream is not live' }, { status: 400 });
      }
      updateData = {
        status: 'ended',
        ended_at: new Date().toISOString(),
      };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { data: updatedStream, error } = await supabase
      .from('live_streams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update stream' }, { status: 500 });
    }

    return NextResponse.json({ stream: updatedStream });

  } catch (error: any) {
    console.error('Update stream error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/live-streams/[id] - Delete stream
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Verify ownership
    const { data: stream } = await supabase
      .from('live_streams')
      .select('artist_id, label_id, mux_live_stream_id')
      .eq('id', id)
      .single();

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    if (stream.artist_id !== user.id && stream.label_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from database (cascade will handle related records)
    const { error } = await supabase
      .from('live_streams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete stream' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Delete stream error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}