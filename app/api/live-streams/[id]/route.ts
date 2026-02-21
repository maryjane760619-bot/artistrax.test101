import { createClient } from '@/lib/supabase';
import { getLiveStreamStatus } from '@/lib/mux';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { id } = params;

    const { data: stream, error } = await supabase
      .from('live_streams')
      .select(`*, artists:artist_id (display_name, username, avatar_url), labels:label_id (name, slug, logo_url)`)
      .eq('id', id)
      .single();

    if (error || !stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const { count: viewerCount } = await supabase
      .from('stream_viewers')
      .select('*', { count: 'exact', head: true })
      .eq('stream_id', id)
      .is('left_at', null);

    return NextResponse.json({ stream: { ...stream, viewer_count: viewerCount || 0 } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}