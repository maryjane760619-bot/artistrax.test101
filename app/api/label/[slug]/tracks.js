// Universal Label API - works for any label
// GET /api/label/[slug]/tracks

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;
  
  if (!slug) {
    return res.status(400).json({ error: 'Label slug required' });
  }

  try {
    // Get label info
    const { data: label, error: labelError } = await supabase
      .from('labels')
      .select(`
        id, 
        name, 
        slug, 
        description, 
        avatar_url,
        banner_url,
        website_url,
        social_links
      `)
      .eq('slug', slug)
      .single();

    if (labelError || !label) {
      return res.status(404).json({ error: 'Label not found' });
    }

    // Get all published tracks for this label
    const { data: tracks, error: tracksError } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        price,
        cover_art_url,
        audio_preview_url,
        created_at,
        artists:artist_id (name, slug, avatar_url)
      `)
      .eq('label_id', label.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (tracksError) throw tracksError;

    // Get label stats
    const { count: totalTracks } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('label_id', label.id)
      .eq('status', 'published');

    // Format response
    const formattedTracks = tracks?.map(track => ({
      id: track.id,
      title: track.title,
      artist: track.artists?.name || 'Unknown Artist',
      artistSlug: track.artists?.slug,
      artistAvatar: track.artists?.avatar_url,
      price: track.price,
      coverArt: track.cover_art_url,
      previewUrl: track.audio_preview_url,
      buyUrl: `https://artistrax.com/track/${track.id}`,
      createdAt: track.created_at
    })) || [];

    res.status(200).json({
      label: {
        id: label.id,
        name: label.name,
        slug: label.slug,
        description: label.description,
        avatar: label.avatar_url,
        banner: label.banner_url,
        website: label.website_url,
        socialLinks: label.social_links || {},
        totalTracks: totalTracks || 0
      },
      tracks: formattedTracks
    });
  } catch (error) {
    console.error('Label API Error:', error);
    res.status(500).json({ error: 'Failed to fetch label data' });
  }
}