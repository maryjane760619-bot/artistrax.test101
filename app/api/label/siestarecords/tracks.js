// API endpoint to fetch tracks for Siesta Records
// GET /api/label/siestarecords/tracks

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get Siesta Records label ID
    const { data: label } = await supabase
      .from('labels')
      .select('id, name, slug, description, avatar_url')
      .eq('slug', 'siesta-records')
      .single();

    if (!label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    // Get all tracks for this label
    const { data: tracks, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        cover_art_url,
        audio_preview_url,
        created_at,
        artists:artist_id (name, slug)
      `)
      .eq('label_id', label.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format response
    const formattedTracks = tracks?.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artists?.name || 'Unknown Artist',
      artistSlug: track.artists?.slug,
      price: track.price,
      coverArt: track.cover_art_url,
      previewUrl: track.audio_preview_url,
      buyUrl: `https://artistrax.com/track/${track.id}`,
      createdAt: track.created_at
    })) || [];

    res.status(200).json({
      label: {
        name: label.name,
        slug: label.slug,
        description: label.description,
        avatar: label.avatar_url
      },
      tracks: formattedTracks
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
}