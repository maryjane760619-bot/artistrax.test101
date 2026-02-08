'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { SubscriptionPlans } from '@/components/subscription-plans';
import { getDaysRemainingInTrial } from '@/lib/stripe-config';

export default function ArtistSubscribePage() {
  const router = useRouter();
  const { artist } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  useEffect(() => {
    if (!artist) {
      router.push('/artist/login');
      return;
    }

    const fetchSubscriptionData = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('artists')
        .select('id, email, subscription_status, subscription_tier, trial_ends_at')
        .eq('id', artist.id)
        .single();

      setSubscriptionData(data);
      setLoading(false);
    };

    fetchSubscriptionData();
  }, [artist, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1F4E3D] to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const daysRemaining = getDaysRemainingInTrial(subscriptionData?.trial_ends_at);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1F4E3D] to-black py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {daysRemaining > 0 && (
          <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-8 text-center">
            <p className="text-orange-800">
              <strong>{daysRemaining} days</strong> remaining in your free trial
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg p-8">
          <SubscriptionPlans
            accountType="artist"
            accountId={subscriptionData?.id}
            email={subscriptionData?.email}
            currentTier={subscriptionData?.subscription_tier}
          />
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/artist/dashboard')}
            className="text-white hover:text-gray-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
