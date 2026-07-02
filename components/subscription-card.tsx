'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CreditCard, Calendar, Database, AlertCircle, Check, X, Zap } from 'lucide-react';

interface SubscriptionCardProps {
  userId: string;
  userType: 'artist' | 'label';
}

export default function SubscriptionCard({ userId, userType }: SubscriptionCardProps) {
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [userId]);

  const loadSubscription = async () => {
    const tableName = userType === 'artist' ? 'artists' : 'labels';
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setSubscription(data);
    }
    setLoading(false);
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);

    try {
      const response = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userType,
          subscriptionId: subscription.stripe_subscription_id,
        }),
      });

      const result = await response.json();

      if (result.error) {
        alert(result.error);
      } else {
        alert('Subscription canceled. You can continue using artistrax until your current period ends.');
        loadSubscription();
        setShowCancelModal(false);
      }
    } catch (error) {
      alert('Failed to cancel subscription. Please try again.');
    }

    setCanceling(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 GB';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trialing':
        return 'bg-blue-500';
      case 'active':
        return 'bg-green-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'trialing':
        return 'Free Trial';
      case 'active':
        return 'Active';
      case 'past_due':
        return 'Payment Due';
      case 'canceled':
        return 'Canceled';
      default:
        return status;
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <p className="text-white">Loading subscription...</p>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const isTrialing = subscription.subscription_status === 'trialing';
  const trialDaysLeft = isTrialing && subscription.trial_ends_at
    ? getDaysRemaining(subscription.trial_ends_at)
    : 0;

  const storagePercentage = subscription.has_unlimited_storage
    ? 0
    : Math.min(100, (subscription.storage_used_bytes / subscription.storage_limit_bytes) * 100);

  return (
    <>
      <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-bold text-white ${getStatusColor(subscription.subscription_status)}`}>
            {getStatusText(subscription.subscription_status)}
          </div>
        </div>

        {/* Trial Warning */}
        {isTrialing && trialDaysLeft <= 7 && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-100 font-semibold mb-1">
                  Trial ending in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}
                </p>
                <p className="text-yellow-200 text-sm">
                  You'll be charged on {formatDate(subscription.trial_ends_at)}. Cancel anytime before then.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plan Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-purple-200">Plan</span>
            <span className="text-white font-semibold capitalize">
              {subscription.subscription_tier} · ${userType === 'artist' ? '20' : '25'}{subscription.subscription_tier === 'monthly' ? '/mo' : '/yr'}
            </span>
          </div>

          {subscription.trial_ends_at && isTrialing && (
            <div className="flex items-center justify-between">
              <span className="text-purple-200 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Trial Ends
              </span>
              <span className="text-white font-semibold">
                {formatDate(subscription.trial_ends_at)}
              </span>
            </div>
          )}

          {subscription.subscription_expires_at && !isTrialing && (
            <div className="flex items-center justify-between">
              <span className="text-purple-200 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Next Billing
              </span>
              <span className="text-white font-semibold">
                {formatDate(subscription.subscription_expires_at)}
              </span>
            </div>
          )}
        </div>

        {/* Storage Usage */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-200 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Storage
            </span>
            {subscription.has_unlimited_storage ? (
              <span className="text-green-400 font-semibold flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Unlimited
              </span>
            ) : (
              <span className="text-white font-semibold">
                {formatBytes(subscription.storage_used_bytes)} / {formatBytes(subscription.storage_limit_bytes)}
              </span>
            )}
          </div>

          {!subscription.has_unlimited_storage && (
            <>
              <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    storagePercentage > 90 ? 'bg-red-500' : storagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${storagePercentage}%` }}
                />
              </div>
              <p className="text-purple-300 text-sm">
                {storagePercentage.toFixed(1)}% used
              </p>
            </>
          )}

          {!subscription.has_unlimited_storage && (
            <button
              onClick={() => alert('Upgrade to unlimited storage feature coming soon!')}
              className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-semibold transition-all"
            >
              Upgrade to Unlimited - $5/month
            </button>
          )}
        </div>

        {/* Actions */}
        {subscription.subscription_status !== 'canceled' && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 py-2 rounded-lg text-sm font-semibold transition-all"
          >
            Cancel Subscription
          </button>
        )}

        {subscription.subscription_status === 'canceled' && subscription.subscription_expires_at && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-100 text-sm">
              Your subscription will end on {formatDate(subscription.subscription_expires_at)}. 
              You can continue using artistrax until then.
            </p>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">Cancel Subscription?</h3>
            <p className="text-purple-200 mb-6">
              You'll continue to have access until {subscription.trial_ends_at ? formatDate(subscription.trial_ends_at) : formatDate(subscription.subscription_expires_at)}. 
              After that, your account will be downgraded.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-purple-200">
                <X className="w-5 h-5 text-red-400" />
                <span>You'll lose access to upload new content</span>
              </div>
              <div className="flex items-center gap-2 text-purple-200">
                <X className="w-5 h-5 text-red-400" />
                <span>Existing content will remain visible</span>
              </div>
              <div className="flex items-center gap-2 text-purple-200">
                <Check className="w-5 h-5 text-green-400" />
                <span>You can reactivate anytime</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={canceling}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-semibold transition-all"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={canceling}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-all disabled:opacity-50"
              >
                {canceling ? 'Canceling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
