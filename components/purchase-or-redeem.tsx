'use client';

import { useEffect, useState } from 'react';
import { BuyButton } from '@/components/buy-button';
import { RedeemWithPointsButton } from '@/components/redeem-with-points-button';
import { createClient } from '@/lib/supabase';
import { POINTS_CONFIG } from '@/lib/points-config';

interface PurchaseOrRedeemProps {
  trackId: string;
  price: number;
  isFree: boolean;
  fanId?: string;
  fanEmail?: string;
}

export function PurchaseOrRedeem({
  trackId,
  price,
  isFree,
  fanId,
  fanEmail,
}: PurchaseOrRedeemProps) {
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    if (fanId) {
      loadFanPoints();
      checkIfPurchased();
    } else {
      setLoading(false);
    }
  }, [fanId, trackId]);

  const loadFanPoints = async () => {
    if (!fanId) return;

    const supabase = createClient();
    const { data } = await supabase
      .from('fans')
      .select('points_balance')
      .eq('id', fanId)
      .single();

    if (data) {
      setPointsBalance(data.points_balance || 0);
    }
    setLoading(false);
  };

  const checkIfPurchased = async () => {
    if (!fanEmail) return;

    const supabase = createClient();
    const { data } = await supabase
      .from('purchases')
      .select('id')
      .eq('buyer_email', fanEmail)
      .eq('track_id', trackId)
      .single();

    setHasPurchased(!!data);
  };

  const handleRedeemSuccess = () => {
    // Refresh points balance and mark as purchased
    loadFanPoints();
    setHasPurchased(true);
  };

  // Don't show anything for free tracks
  if (isFree) {
    return null;
  }

  // Already purchased
  if (hasPurchased) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800">
        ✓ You own this track
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg h-12"></div>
    );
  }

  // Not logged in as fan - show buy button only
  if (!fanId) {
    return <BuyButton trackId={trackId} price={price} isFree={isFree} fanEmail={fanEmail} />;
  }

  // Logged in as fan with enough points - show both options
  const canRedeem = pointsBalance >= POINTS_CONFIG.POINTS_PER_TRACK;

  return (
    <div className="space-y-4">
      {canRedeem && (
        <>
          <RedeemWithPointsButton
            trackId={trackId}
            fanId={fanId}
            pointsBalance={pointsBalance}
            onSuccess={handleRedeemSuccess}
          />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
        </>
      )}

      <BuyButton trackId={trackId} price={price} isFree={isFree} fanEmail={fanEmail} />
    </div>
  );
}
