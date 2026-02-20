// Fan Rewards Points System Configuration
// 2% rewards = 2 points per $1 spent

export const POINTS_CONFIG = {
  // How many points earned per $1 spent (2% = 2 points)
  POINTS_PER_DOLLAR: 2,
  
  // How many points needed to redeem 1 free track
  POINTS_PER_TRACK: 100,
  
  // Reward percentage for display
  REWARD_PERCENTAGE: 2,
  
  // Calculate points earned from purchase amount
  calculatePointsEarned: (amountInDollars: number): number => {
    return Math.floor(amountInDollars * POINTS_CONFIG.POINTS_PER_DOLLAR);
  },
  
  // Check if fan has enough points for redemption
  canRedeem: (pointsBalance: number): boolean => {
    return pointsBalance >= POINTS_CONFIG.POINTS_PER_TRACK;
  },
  
  // Get number of free tracks fan can redeem
  availableRedemptions: (pointsBalance: number): number => {
    return Math.floor(pointsBalance / POINTS_CONFIG.POINTS_PER_TRACK);
  },
  
  // Calculate points needed for next reward
  pointsToNextReward: (pointsBalance: number): number => {
    const remainder = pointsBalance % POINTS_CONFIG.POINTS_PER_TRACK;
    return POINTS_CONFIG.POINTS_PER_TRACK - remainder;
  },
  
  // Format points display
  formatPoints: (points: number): string => {
    return points.toLocaleString();
  }
} as const;

export const POINTS_TRANSACTION_TYPES = {
  EARN: 'earn',
  REDEEM: 'redeem',
  ADJUSTMENT: 'adjustment'
} as const;

export const POINTS_SOURCE_TYPES = {
  PURCHASE: 'purchase',
  REDEMPTION: 'track_redemption',
  ADMIN: 'admin_adjustment',
  BONUS: 'bonus'
} as const;
