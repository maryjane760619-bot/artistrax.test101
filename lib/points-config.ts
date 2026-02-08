// Fan Rewards Points System Configuration

export const POINTS_CONFIG = {
  // How many points earned per $1 spent
  POINTS_PER_DOLLAR: 10,
  
  // How many points needed to redeem 1 free track
  POINTS_PER_TRACK: 500,
  
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
  },
  
  // Calculate reward percentage (for display)
  rewardPercentage: (): number => {
    // If you spend enough to redeem a track, what % of that is the free track worth?
    // Points needed / Points per dollar = dollars needed
    const dollarsNeeded = POINTS_CONFIG.POINTS_PER_TRACK / POINTS_CONFIG.POINTS_PER_DOLLAR;
    // Assuming average track price around $2, but this is a rough estimate
    // Real calculation: (1 track value / dollars spent) * 100
    return (1 / dollarsNeeded) * 100; // ~5%
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
