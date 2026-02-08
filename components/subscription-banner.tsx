'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getDaysRemainingInTrial, isSubscriptionValid, formatSubscriptionTier } from '@/lib/stripe-config';
import { AlertCircle, Clock, CreditCard } from 'lucide-react';

interface SubscriptionBannerProps {
  accountType: 'artist' | 'label';
  subscriptionStatus?: string | null;
  subscriptionTier?: string | null;
  trialEndsAt?: string | null;
  subscriptionExpiresAt?: string | null;
}

export function SubscriptionBanner({
  accountType,
  subscriptionStatus,
  subscriptionTier,
  trialEndsAt,
  subscriptionExpiresAt,
}: SubscriptionBannerProps) {
  const router = useRouter();
  const daysRemaining = getDaysRemainingInTrial(trialEndsAt);
  const isValid = isSubscriptionValid(
    subscriptionStatus || 'trialing',
    trialEndsAt,
    subscriptionExpiresAt
  );

  // Active paid subscription - show minimal info
  if (subscriptionStatus === 'active' && subscriptionTier) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-semibold text-green-800">
              {formatSubscriptionTier(subscriptionTier)} Active
            </p>
            <p className="text-sm text-green-600">
              Full access to all features
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/${accountType}/billing`)}
          variant="outline"
          size="sm"
          className="border-green-300 text-green-700 hover:bg-green-50"
        >
          Manage Billing
        </Button>
      </div>
    );
  }

  // In trial period
  if (subscriptionStatus === 'trialing' && daysRemaining > 0) {
    const urgency = daysRemaining <= 7 ? 'urgent' : 'normal';
    const bgColor = urgency === 'urgent' ? 'bg-orange-50' : 'bg-blue-50';
    const borderColor = urgency === 'urgent' ? 'border-orange-200' : 'border-blue-200';
    const textColor = urgency === 'urgent' ? 'text-orange-800' : 'text-blue-800';
    const iconColor = urgency === 'urgent' ? 'text-orange-600' : 'text-blue-600';
    const buttonColor = urgency === 'urgent' ? 'bg-[#F59E0B] hover:bg-[#e08e00]' : 'bg-[#1F4E3D] hover:bg-[#2d7556]';

    return (
      <div className={`${bgColor} border ${borderColor} rounded-lg p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${iconColor}`} />
          <div>
            <p className={`font-semibold ${textColor}`}>
              Free Trial: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
            </p>
            <p className={`text-sm ${iconColor}`}>
              Subscribe now to continue after your trial ends
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/${accountType}/subscribe`)}
          className={buttonColor}
          size="sm"
        >
          Choose Plan
        </Button>
      </div>
    );
  }

  // Trial expired or subscription invalid
  if (!isValid) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-800 mb-1">
              Subscription Required
            </p>
            <p className="text-sm text-red-600 mb-3">
              {subscriptionStatus === 'trialing' 
                ? 'Your free trial has expired. Subscribe to continue uploading and accessing your content.'
                : subscriptionStatus === 'past_due'
                ? 'Your payment failed. Please update your payment method to restore access.'
                : subscriptionStatus === 'canceled'
                ? 'Your subscription was canceled. Reactivate to continue using Artistrax.'
                : 'Please subscribe to access all features.'}
            </p>
            <Button
              onClick={() => router.push(`/${accountType}/subscribe`)}
              className="bg-red-600 hover:bg-red-700"
              size="sm"
            >
              Subscribe Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Past due
  if (subscriptionStatus === 'past_due') {
    return (
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-semibold text-yellow-800">Payment Issue</p>
            <p className="text-sm text-yellow-600">
              Your payment failed. Please update your payment method.
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push(`/${accountType}/billing`)}
          className="bg-yellow-600 hover:bg-yellow-700"
          size="sm"
        >
          Update Payment
        </Button>
      </div>
    );
  }

  return null;
}
