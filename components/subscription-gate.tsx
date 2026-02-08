'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isSubscriptionValid } from '@/lib/stripe-config';
import { Lock } from 'lucide-react';
import { ReactNode } from 'react';

interface SubscriptionGateProps {
  accountType: 'artist' | 'label';
  subscriptionStatus?: string | null;
  trialEndsAt?: string | null;
  subscriptionExpiresAt?: string | null;
  children: ReactNode;
  message?: string;
}

export function SubscriptionGate({
  accountType,
  subscriptionStatus,
  trialEndsAt,
  subscriptionExpiresAt,
  children,
  message,
}: SubscriptionGateProps) {
  const router = useRouter();
  const isValid = isSubscriptionValid(
    subscriptionStatus || 'trialing',
    trialEndsAt,
    subscriptionExpiresAt
  );

  // If subscription is valid, render children
  if (isValid) {
    return <>{children}</>;
  }

  // Otherwise, show locked message
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-12 text-center">
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-full p-6">
          <Lock className="w-12 h-12 text-gray-400" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-3">Subscription Required</h2>
      
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        {message || 'Your free trial has ended. Subscribe to continue uploading tracks and accessing all features.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => router.push(`/${accountType}/subscribe`)}
          className="bg-[#1F4E3D] hover:bg-[#2d7556]"
          size="lg"
        >
          View Plans & Subscribe
        </Button>
        <Button
          onClick={() => router.push(`/${accountType}/dashboard`)}
          variant="outline"
          size="lg"
        >
          Back to Dashboard
        </Button>
      </div>

      <p className="text-sm text-gray-500 mt-6">
        Questions? Contact support@artistrax.com
      </p>
    </div>
  );
}
