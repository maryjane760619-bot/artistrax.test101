'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SUBSCRIPTION_PRICES } from '@/lib/stripe-config';
import { Check } from 'lucide-react';

type AccountType = 'artist' | 'label';

interface SubscriptionPlansProps {
  accountType: AccountType;
  accountId: string;
  email: string;
  currentTier?: string | null;
  onSuccess?: () => void;
}

export function SubscriptionPlans({
  accountType,
  accountId,
  email,
  currentTier,
  onSuccess,
}: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const plans = SUBSCRIPTION_PRICES[accountType];

  const handleSubscribe = async (interval: 'monthly' | 'annual') => {
    setLoading(interval);
    try {
      const priceId = plans[interval].priceId;

      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          accountType,
          accountId,
          email,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(`Error: ${data.error}`);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const features = accountType === 'artist' ? [
    'Unlimited track uploads',
    'Advanced analytics dashboard',
    'Custom artist profile',
    'Direct fan engagement',
    'Download tracking',
    'Revenue insights',
  ] : [
    'Unlimited track uploads',
    'Manage multiple artists',
    'Label analytics dashboard',
    'Custom label profile',
    'Batch upload tools',
    'Revenue tracking',
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">
          Choose Your {accountType === 'artist' ? 'Artist' : 'Label'} Plan
        </h2>
        <p className="text-gray-600">
          Start your 30-day free trial. Cancel anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Monthly Plan */}
        <div className="border border-gray-200 rounded-lg p-8 hover:border-[#1F4E3D] transition-colors">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Monthly</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold">${plans.monthly.amount}</span>
              <span className="text-gray-600">/month</span>
            </div>
            <p className="text-sm text-gray-600">
              30-day free trial included
            </p>
          </div>

          <Button
            onClick={() => handleSubscribe('monthly')}
            disabled={loading !== null || currentTier === 'monthly'}
            className="w-full mb-6 bg-[#1F4E3D] hover:bg-[#2d7556]"
          >
            {loading === 'monthly' ? 'Loading...' : 
             currentTier === 'monthly' ? 'Current Plan' : 'Start Free Trial'}
          </Button>

          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#1F4E3D] flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Annual Plan */}
        <div className="border-2 border-[#F59E0B] rounded-lg p-8 relative bg-gradient-to-b from-orange-50 to-white">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-[#F59E0B] text-white px-4 py-1 rounded-full text-sm font-semibold">
              SAVE ${plans.annual.savings}
            </span>
          </div>

          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Annual</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">${plans.annual.amount}</span>
              <span className="text-gray-600">/year</span>
            </div>
            <p className="text-sm text-[#F59E0B] font-semibold mb-2">
              Only ${plans.annual.monthlyEquivalent}/month
            </p>
            <p className="text-sm text-gray-600">
              30-day free trial included
            </p>
          </div>

          <Button
            onClick={() => handleSubscribe('annual')}
            disabled={loading !== null || currentTier === 'annual'}
            className="w-full mb-6 bg-[#F59E0B] hover:bg-[#e08e00] text-white"
          >
            {loading === 'annual' ? 'Loading...' : 
             currentTier === 'annual' ? 'Current Plan' : 'Start Free Trial'}
          </Button>

          <ul className="space-y-3">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center mt-8 text-sm text-gray-500">
        <p>
          Your free trial starts today. You won't be charged until after 30 days.
        </p>
        <p className="mt-2">
          Cancel anytime with one click from your dashboard.
        </p>
      </div>
    </div>
  );
}
