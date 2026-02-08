import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { POINTS_CONFIG } from '@/lib/points-config';

export async function POST(request: NextRequest) {
  try {
    const { trackId, fanId } = await request.json();

    if (!trackId || !fanId) {
      return NextResponse.json(
        { error: 'Missing trackId or fanId' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get fan's current points balance
    const { data: fan, error: fanError } = await supabase
      .from('fans')
      .select('id, points_balance, email')
      .eq('id', fanId)
      .single();

    if (fanError || !fan) {
      return NextResponse.json(
        { error: 'Fan not found' },
        { status: 404 }
      );
    }

    // Check if fan has enough points
    if (fan.points_balance < POINTS_CONFIG.POINTS_PER_TRACK) {
      return NextResponse.json(
        { 
          error: 'Insufficient points',
          required: POINTS_CONFIG.POINTS_PER_TRACK,
          current: fan.points_balance 
        },
        { status: 400 }
      );
    }

    // Get track details
    const { data: track, error: trackError } = await supabase
      .from('tracks')
      .select('id, title, artist_id, label_id, price')
      .eq('id', trackId)
      .single();

    if (trackError || !track) {
      return NextResponse.json(
        { error: 'Track not found' },
        { status: 404 }
      );
    }

    // Check if track is paid (can only redeem points for paid tracks)
    if (track.price === 0) {
      return NextResponse.json(
        { error: 'Cannot redeem points for free tracks' },
        { status: 400 }
      );
    }

    // Check if fan already purchased this track
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_email', fan.email)
      .eq('track_id', trackId)
      .single();

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You already own this track' },
        { status: 400 }
      );
    }

    // Redeem points using the database function
    const { data: redeemResult, error: redeemError } = await supabase
      .rpc('redeem_points', {
        p_fan_id: fanId,
        p_amount: POINTS_CONFIG.POINTS_PER_TRACK,
        p_track_id: trackId,
        p_description: `Redeemed ${POINTS_CONFIG.POINTS_PER_TRACK} points for "${track.title}"`
      });

    if (redeemError || redeemResult === false) {
      console.error('Failed to redeem points:', redeemError);
      return NextResponse.json(
        { error: 'Failed to redeem points' },
        { status: 500 }
      );
    }

    // Record as a purchase (amount: 0 since it was redeemed with points)
    const { error: purchaseError } = await supabase
      .from('purchases')
      .insert({
        track_id: trackId,
        artist_id: track.artist_id,
        label_id: track.label_id,
        buyer_email: fan.email,
        amount: 0, // Free via points redemption
        stripe_session_id: null,
        stripe_payment_intent: null,
      });

    if (purchaseError) {
      console.error('Failed to record redemption purchase:', purchaseError);
      return NextResponse.json(
        { error: 'Failed to record purchase' },
        { status: 500 }
      );
    }

    // Get updated points balance
    const { data: updatedFan } = await supabase
      .from('fans')
      .select('points_balance')
      .eq('id', fanId)
      .single();

    return NextResponse.json({
      success: true,
      pointsRedeemed: POINTS_CONFIG.POINTS_PER_TRACK,
      newBalance: updatedFan?.points_balance || 0,
      message: `Successfully redeemed "${track.title}"!`
    });

  } catch (error: any) {
    console.error('Redemption error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to redeem points' },
      { status: 500 }
    );
  }
}
