// Admin API to link tracks/artists to Siesta Records label
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    // Get Siesta Records label ID
    const { data: label } = await supabase
      .from('labels')
      .select('id, name, slug')
      .eq('slug', 'siesta-records')
      .single();

    if (!label) {
      return NextResponse.json({ error: 'Siesta Records label not found' }, { status: 404 });
    }

    // Get all artists NOT linked to a label
    const { data: unlinkedArtists } = await supabase
      .from('artists')
      .select('id, display_name, email, label_id')
      .is('label_id', null)
      .limit(10);

    // Get all tracks NOT linked to a label
    const { data: unlinkedTracks } = await supabase
      .from('tracks')
      .select('id, title, artist_id, label_id')
      .is('label_id', null)
      .limit(10);

    // Get all artists
    const { data: allArtists } = await supabase
      .from('artists')
      .select('id, display_name, email, label_id')
      .limit(20);

    return NextResponse.json({
      siestaRecordsLabel: label,
      allArtists: allArtists || [],
      unlinkedArtists: unlinkedArtists || [],
      unlinkedTracks: unlinkedTracks || [],
      message: 'Use POST to link artists/tracks to Siesta Records'
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { artistIds, trackIds } = body;

    // Get Siesta Records label ID
    const { data: label } = await supabase
      .from('labels')
      .select('id')
      .eq('slug', 'siesta-records')
      .single();

    if (!label) {
      return NextResponse.json({ error: 'Siesta Records label not found' }, { status: 404 });
    }

    const results = {
      artistsUpdated: 0,
      tracksUpdated: 0,
      errors: []
    };

    // Link artists to label
    if (artistIds && artistIds.length > 0) {
      const { error: artistError } = await supabase
        .from('artists')
        .update({ label_id: label.id })
        .in('id', artistIds);

      if (artistError) {
        results.errors.push(`Artists error: ${artistError.message}`);
      } else {
        results.artistsUpdated = artistIds.length;
      }
    }

    // Link tracks to label
    if (trackIds && trackIds.length > 0) {
      const { error: trackError } = await supabase
        .from('tracks')
        .update({ label_id: label.id })
        .in('id', trackIds);

      if (trackError) {
        results.errors.push(`Tracks error: ${trackError.message}`);
      } else {
        results.tracksUpdated = trackIds.length;
      }
    }

    return NextResponse.json({
      success: true,
      results,
      labelId: label.id
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}