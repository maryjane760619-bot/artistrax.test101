'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { POINTS_CONFIG } from '@/lib/points-config';
import { Sparkles, Loader2 } from 'lucide-react';

interface RedeemWithPointsButtonProps {
  trackId: string;
  fanId: string;
  pointsBalance: number;
  onSuccess?: () => void;
}

export function RedeemWithPointsButton({
  trackId,
  fanId,
  pointsBalance,
  onSuccess,
}: RedeemWithPointsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canRedeem = pointsBalance >= POINTS_CONFIG.POINTS_PER_TRACK;
  const pointsNeeded = POINTS_CONFIG.pointsToNextReward(pointsBalance);

  const handleRedeem = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/points/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId, fanId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to redeem');
        return;
      }

      // Success! Notify parent component
      if (onSuccess) {
        onSuccess();
      }

      alert(data.message || 'Track redeemed successfully!');
    } catch (err: any) {
      console.error('Redemption error:', err);
      setError('Failed to redeem points. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!canRedeem) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <Sparkles className="w-6 h-6 text-blue-600 mx-auto mb-2" />
        <p className="text-sm text-blue-800 font-medium mb-1">
          Need {pointsNeeded} more points
        </p>
        <p className="text-xs text-blue-600">
          You have {POINTS_CONFIG.formatPoints(pointsBalance)} points
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleRedeem}
        disabled={loading}
        className="w-full bg-gradient-to-r from-[#F59E0B] to-[#f59e0bcc] hover:from-[#e08e00] hover:to-[#e08e00cc] text-white"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redeeming...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Redeem with {POINTS_CONFIG.POINTS_PER_TRACK} Points
          </>
        )}
      </Button>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <p className="text-xs text-center text-gray-500">
        You have {POINTS_CONFIG.formatPoints(pointsBalance)} points •{' '}
        {POINTS_CONFIG.availableRedemptions(pointsBalance)} free track
        {POINTS_CONFIG.availableRedemptions(pointsBalance) !== 1 ? 's' : ''} available
      </p>
    </div>
  );
}
