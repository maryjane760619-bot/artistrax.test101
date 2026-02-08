'use client';

import { POINTS_CONFIG } from '@/lib/points-config';
import { Sparkles, TrendingUp, Gift, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface PointsBalanceCardProps {
  pointsBalance: number;
  showDetails?: boolean;
}

export function PointsBalanceCard({ pointsBalance, showDetails = true }: PointsBalanceCardProps) {
  const availableRedemptions = POINTS_CONFIG.availableRedemptions(pointsBalance);
  const pointsToNext = POINTS_CONFIG.pointsToNextReward(pointsBalance);
  const progressPercentage = ((pointsBalance % POINTS_CONFIG.POINTS_PER_TRACK) / POINTS_CONFIG.POINTS_PER_TRACK) * 100;

  return (
    <div className="bg-gradient-to-br from-[#F59E0B] to-[#f59e0bcc] rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold">Rewards Points</h3>
        </div>
        <div className="bg-white/20 rounded-full px-3 py-1 text-xs font-medium">
          Active
        </div>
      </div>

      <div className="mb-6">
        <div className="text-4xl font-bold mb-1">
          {POINTS_CONFIG.formatPoints(pointsBalance)}
        </div>
        <div className="text-sm opacity-90">points balance</div>
      </div>

      {showDetails && (
        <>
          {availableRedemptions > 0 ? (
            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5" />
                <span className="font-semibold">Ready to Redeem!</span>
              </div>
              <p className="text-sm opacity-90">
                You can get <strong>{availableRedemptions}</strong> free track
                {availableRedemptions !== 1 ? 's' : ''} right now
              </p>
            </div>
          ) : (
            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Next reward</span>
                <span className="text-sm font-bold">{pointsToNext} points</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-white/20" />
              <p className="text-xs opacity-75 mt-2">
                {Math.round(progressPercentage)}% to your next free track
              </p>
            </div>
          )}

          <div className="border-t border-white/20 pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-90">Earn rate</span>
              <span className="font-semibold">{POINTS_CONFIG.POINTS_PER_DOLLAR} pts / $1</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-90">Redemption</span>
              <span className="font-semibold">{POINTS_CONFIG.POINTS_PER_TRACK} pts / track</span>
            </div>
          </div>

          <div className="border-t border-white/20 pt-4">
            <Link href="/fan/points">
              <Button variant="ghost" className="w-full text-white hover:bg-white/10" size="sm">
                View History & Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
