'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { formatSubscriptionTier, getDaysRemainingInTrial, SUBSCRIPTION_PRICES } from '@/lib/stripe-config';

export default function ArtistBillingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [artistData, setArtistData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/artist/login');
      return;
    }

    if (user) {
      fetchArtistData();
    }
  }, [user, authLoading]);

  const fetchArtistData = async () => {
    if (!user) return;

    const supabase = createClient();
    const { data } = await supabase
      .from('artists')
      .select('*')
      .eq('id', user.id)
      .single();

    setArtistData(data);
    setLoading(false);
  };

  const handleManageBilling = async () => {
    // In production, create a Stripe billing portal session
    // For now, redirect to Stripe customer portal
    alert('This would open the Stripe billing portal where you can manage payment methods, view invoices, and cancel your subscription.');
  };

  const handleUpgrade = () => {
    router.push('/artist/subscribe');
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!artistData) return null;

  const daysRemaining = getDaysRemainingInTrial(artistData.trial_ends_at);
  const isInTrial = artistData.subscription_status === 'trialing' && daysRemaining > 0;
  const isActive = artistData.subscription_status === 'active';
  const isPastDue = artistData.subscription_status === 'past_due';
  const isCanceled = artistData.subscription_status === 'canceled';

  const currentPlan = artistData.subscription_tier 
    ? SUBSCRIPTION_PRICES.artist[artistData.subscription_tier as 'monthly' | 'annual']
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/artist/dashboard" className="text-2xl font-serif font-semibold">
              artistrax
            </Link>
            <Link href="/artist/dashboard">
              <Button variant="ghost" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-2">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your plan and payment methods
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Current Plan</h2>
              {isInTrial && (
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Free Trial • {daysRemaining} days remaining
                  </span>
                </div>
              )}
              {isActive && currentPlan && (
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {formatSubscriptionTier(artistData.subscription_tier)} • Active
                  </span>
                </div>
              )}
              {isPastDue && (
                <div className="flex items-center gap-2 text-yellow-600 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Payment Failed
                  </span>
                </div>
              )}
              {isCanceled && (
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Subscription Canceled
                  </span>
                </div>
              )}
            </div>
            {currentPlan && (
              <div className="text-right">
                <div className="text-3xl font-bold">${currentPlan.amount}</div>
                <div className="text-sm text-muted-foreground">
                  per {currentPlan.interval}
                </div>
              </div>
            )}
          </div>

          {artistData.subscription_expires_at && (
            <div className="text-sm text-muted-foreground mb-4">
              {isCanceled ? 'Subscription ends' : 'Next billing date'}:{' '}
              <strong>{new Date(artistData.subscription_expires_at).toLocaleDateString()}</strong>
            </div>
          )}

          {isInTrial && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 mb-3">
                Your free trial will end on{' '}
                <strong>{new Date(artistData.trial_ends_at).toLocaleDateString()}</strong>.
                Choose a plan to continue after your trial.
              </p>
              <Button onClick={handleUpgrade} className="bg-[#1F4E3D] hover:bg-[#2d7556]">
                Choose Plan
              </Button>
            </div>
          )}

          {(isActive || isPastDue) && (
            <div className="flex gap-3">
              <Button onClick={handleManageBilling} variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Payment Method
              </Button>
              <Button onClick={handleUpgrade} variant="outline">
                Change Plan
              </Button>
            </div>
          )}

          {isCanceled && (
            <Button onClick={handleUpgrade} className="bg-[#1F4E3D] hover:bg-[#2d7556]">
              Reactivate Subscription
            </Button>
          )}
        </div>

        {/* Available Plans */}
        {!isActive && (
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-2">Monthly</h3>
                <div className="text-2xl font-bold mb-2">$20/month</div>
                <p className="text-sm text-muted-foreground mb-4">
                  Billed monthly
                </p>
                <Button 
                  onClick={handleUpgrade} 
                  variant="outline" 
                  className="w-full"
                >
                  Select Monthly
                </Button>
              </div>
              <div className="border-2 border-[#F59E0B] rounded-lg p-4 relative bg-gradient-to-b from-orange-50 to-white">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#F59E0B] text-white px-3 py-1 rounded-full text-xs font-semibold">
                    SAVE $144
                  </span>
                </div>
                <h3 className="font-semibold mb-2">Annual</h3>
                <div className="text-2xl font-bold mb-1">$96/year</div>
                <div className="text-sm text-[#F59E0B] font-semibold mb-2">
                  Only $8/month
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Billed annually
                </p>
                <Button 
                  onClick={handleUpgrade} 
                  className="w-full bg-[#F59E0B] hover:bg-[#e08e00]"
                >
                  Select Annual
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Billing History */}
        {isActive && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Billing History</h2>
            <p className="text-sm text-muted-foreground mb-4">
              View your invoices and payment history in the Stripe customer portal.
            </p>
            <Button onClick={handleManageBilling} variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Invoices
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
