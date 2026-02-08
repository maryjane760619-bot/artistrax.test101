// Stripe Subscription Configuration

export const SUBSCRIPTION_PRICES = {
  artist: {
    monthly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_ARTIST_MONTHLY_PRICE || '',
      amount: 20.00,
      interval: 'month' as const,
      displayName: 'Artist Monthly',
      description: '$20/month',
      savings: null
    },
    annual: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_ARTIST_ANNUAL_PRICE || '',
      amount: 96.00,
      interval: 'year' as const,
      displayName: 'Artist Annual',
      description: '$96/year (Save $144)',
      savings: 144,
      monthlyEquivalent: 8.00 // $96/12 months
    }
  },
  label: {
    monthly: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_LABEL_MONTHLY_PRICE || '',
      amount: 25.00,
      interval: 'month' as const,
      displayName: 'Label Monthly',
      description: '$25/month',
      savings: null
    },
    annual: {
      priceId: process.env.NEXT_PUBLIC_STRIPE_LABEL_ANNUAL_PRICE || '',
      amount: 120.00,
      interval: 'year' as const,
      displayName: 'Label Annual',
      description: '$120/year (Save $180)',
      savings: 180,
      monthlyEquivalent: 10.00 // $120/12 months
    }
  }
} as const;

export const TRIAL_DAYS = 30;

export const SUBSCRIPTION_STATUS = {
  TRIALING: 'trialing',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
  UNPAID: 'unpaid'
} as const;

// Helper to check if subscription is valid
export function isSubscriptionValid(
  status: string,
  trialEndsAt?: string | null,
  subscriptionExpiresAt?: string | null
): boolean {
  // Active subscription
  if (status === SUBSCRIPTION_STATUS.ACTIVE) {
    return true;
  }

  // In trial period
  if (status === SUBSCRIPTION_STATUS.TRIALING && trialEndsAt) {
    return new Date(trialEndsAt) > new Date();
  }

  // Has valid subscription expiration
  if (subscriptionExpiresAt) {
    return new Date(subscriptionExpiresAt) > new Date();
  }

  return false;
}

// Get days remaining in trial
export function getDaysRemainingInTrial(trialEndsAt?: string | null): number {
  if (!trialEndsAt) return 0;
  
  const now = new Date();
  const trialEnd = new Date(trialEndsAt);
  const diffTime = trialEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

// Format subscription tier for display
export function formatSubscriptionTier(tier?: string | null): string {
  if (!tier) return 'Free Trial';
  return tier === 'monthly' ? 'Monthly Plan' : 'Annual Plan';
}
