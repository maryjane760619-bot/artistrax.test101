// Direct fix - link specific tracks to Siesta Records
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST() {
  try {
    // Get Siesta Records label ID
    const { data: label, error: labelError } = await supabase
      .from('labels')
      .select('id')
      .eq('slug', 'siesta-records')
      .single();

    if (labelError || !label) {
      return NextResponse.json({ error: 'Label not found', details: labelError }, { status: 404 });
    }

    const labelId = label.id;

    // Get ALL tracks (including those with null label_id)
    const { data: allTracks, error: tracksError } = await supabase
      .from('tracks')
      .select('id, title, label_id');

    if (tracksError) {
      return NextResponse.json({ error: 'Failed to fetch tracks', details: tracksError }, { status: 500 });
    }

    // Update ALL tracks to have this label_id
    const trackIds = allTracks.map(t => t.id);
    
    const { data: updateData, error: updateError } = await supabase
      .from('tracks')
      .update({ label_id: labelId })
      .in('id', trackIds)
      .select();

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update tracks', 
        details: updateError,
        attempted: trackIds.length 
      }, { status: 500 });
    }

    // Also update all artists
    const { data: allArtists } = await supabase
      .from('artists')
      .select('id');

    const artistIds = allArtists.map(a => a.id);
    
    await supabase
      .from('artists')
      .update({ label_id: labelId })
      .in('id', artistIds);

    return NextResponse.json({
      success: true,
      labelId: labelId,
      tracksFound: allTracks.length,
      tracksUpdated: updateData?.length || 0,
      artistsUpdated: artistIds.length,
      trackList: allTracks.map(t => ({ id: t.id, title: t.title }))
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}