// One-click reset for Siesta Records
// Cleans up duplicates and links all tracks

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST() {
  try {
    const results = {
      steps: [],
      errors: []
    };

    // Step 1: Find or create the main Siesta Records label
    const { data: existingLabels } = await supabase
      .from('labels')
      .select('*')
      .in('slug', ['siesta-records', 'siestarecords', 'siesta-test']);

    results.steps.push(`Found ${existingLabels?.length || 0} existing Siesta labels`);

    let mainLabelId;

    if (existingLabels && existingLabels.length > 0) {
      // Use the one with the most data (stripe connected)
      const bestLabel = existingLabels.find(l => l.stripe_charges_enabled) || existingLabels[0];
      mainLabelId = bestLabel.id;
      
      // Update it with proper info
      await supabase
        .from('labels')
        .update({
          name: 'Siesta Records',
          slug: 'siesta-records',
          bio: 'Surf · Sound · Soul. Independent electronic music label from Encinitas, CA.',
          website: 'https://siestarecords.net',
          instagram: 'siestabert',
          twitter: 'Siestabert'
        })
        .eq('id', mainLabelId);
        
      results.steps.push(`Updated main label: ${mainLabelId}`);

      // Delete the others
      const idsToDelete = existingLabels
        .filter(l => l.id !== mainLabelId)
        .map(l => l.id);
        
      if (idsToDelete.length > 0) {
        await supabase.from('labels').delete().in('id', idsToDelete);
        results.steps.push(`Deleted ${idsToDelete.length} duplicate labels`);
      }
    } else {
      // Create fresh
      const { data: newLabel } = await supabase
        .from('labels')
        .insert({
          email: 'bert@siestarecords.net',
          slug: 'siesta-records',
          name: 'Siesta Records',
          bio: 'Surf · Sound · Soul. Independent electronic music label from Encinitas, CA.',
          website: 'https://siestarecords.net',
          instagram: 'siestabert',
          twitter: 'Siestabert'
        })
        .select()
        .single();
        
      mainLabelId = newLabel.id;
      results.steps.push(`Created new label: ${mainLabelId}`);
    }

    // Step 2: Get all tracks
    const { data: allTracks } = await supabase
      .from('tracks')
      .select('id, title, artist_id, label_id');

    results.steps.push(`Found ${allTracks?.length || 0} total tracks`);

    // Step 3: Link ALL tracks to Siesta Records
    if (allTracks && allTracks.length > 0) {
      const trackIds = allTracks.map(t => t.id);
      
      const { error: updateError } = await supabase
        .from('tracks')
        .update({ label_id: mainLabelId })
        .in('id', trackIds);

      if (updateError) {
        results.errors.push(`Failed to link tracks: ${updateError.message}`);
      } else {
        results.steps.push(`Linked ${trackIds.length} tracks to Siesta Records`);
      }
    }

    // Step 4: Link all artists to Siesta Records
    const { data: allArtists } = await supabase
      .from('artists')
      .select('id, display_name');

    if (allArtists && allArtists.length > 0) {
      const artistIds = allArtists.map(a => a.id);
      
      await supabase
        .from('artists')
        .update({ label_id: mainLabelId })
        .in('id', artistIds);
        
      results.steps.push(`Linked ${artistIds.length} artists to Siesta Records`);
    }

    // Step 5: Verify
    const { data: verifyTracks } = await supabase
      .from('tracks')
      .select('id, title')
      .eq('label_id', mainLabelId);

    results.steps.push(`Verification: ${verifyTracks?.length || 0} tracks now linked`);

    return NextResponse.json({
      success: true,
      results,
      labelUrl: 'https://music-download-store-2.vercel.app/labels/siesta-records'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}