'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { loadStripe } from '@stripe/stripe-js';
import { Check, Zap, Database, CreditCard } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function ArtistSubscribePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [artistData, setArtistData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadArtistData();
    }
  }, [user]);

  const loadArtistData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setArtistData(data);

      // If already subscribed, redirect to dashboard
      if (data.subscription_status === 'active' || data.subscription_status === 'trialing') {
        router.push('/artist/dashboard');
      }
    }
  };

  const handleSubscribe = async () => {
    if (!user || !artistData) {
      alert('Please log in first');
      return;
    }

    setLoading(true);

    try {
      // Create checkout session
      const response = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: 'artist',
          userId: artistData.id,
          plan: selectedPlan,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        alert(error);
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe!.redirectToCheckout({ sessionId });

      if (stripeError) {
        alert(stripeError.message);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      alert('Failed to create subscription. Please try again.');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in first</h2>
          <button
            onClick={() => router.push('/artist/login')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Start Your Free Trial
          </h1>
          <p className="text-xl text-purple-200 mb-2">
            Keep 95% of every sale · Upload unlimited tracks
          </p>
          <p className="text-lg text-purple-300">
            30 days free · Cancel anytime · No surprises
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Monthly Plan */}
          <div
            className={`bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-4 transition-all cursor-pointer ${
              selectedPlan === 'monthly'
                ? 'border-purple-500 shadow-2xl shadow-purple-500/50 scale-105'
                : 'border-white/20 hover:border-purple-400'
            }`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
                <p className="text-purple-200">Pay as you go</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === 'monthly' ? 'border-purple-500 bg-purple-500' : 'border-white/40'
              }`}>
                {selectedPlan === 'monthly' && <Check className="w-4 h-4 text-white" />}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$20</span>
                <span className="text-xl text-purple-200">/month</span>
              </div>
              <p className="text-purple-300 mt-2">Billed monthly</p>
            </div>

            <div className="space-y-3 mb-6">
              <Feature text="30-day free trial" />
              <Feature text="Keep 95% of sales" />
              <Feature text="Unlimited track uploads" />
              <Feature text="10GB storage included" />
              <Feature text="Custom artist page" />
              <Feature text="Analytics dashboard" />
            </div>
          </div>

          {/* Annual Plan (Recommended) */}
          <div
            className={`bg-gradient-to-br from-purple-600/30 to-blue-600/30 backdrop-blur-lg rounded-2xl p-8 border-4 transition-all cursor-pointer relative ${
              selectedPlan === 'annual'
                ? 'border-purple-400 shadow-2xl shadow-purple-400/50 scale-105'
                : 'border-purple-500/50 hover:border-purple-400'
            }`}
            onClick={() => setSelectedPlan('annual')}
          >
            {/* Best Value Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Zap className="w-4 h-4" />
                BEST VALUE · SAVE 60%
              </div>
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Annual</h3>
                <p className="text-purple-200">Save $144/year</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedPlan === 'annual' ? 'border-purple-400 bg-purple-500' : 'border-white/40'
              }`}>
                {selectedPlan === 'annual' && <Check className="w-4 h-4 text-white" />}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$96</span>
                <span className="text-xl text-purple-200">/year</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-purple-300 line-through">$240/year</span>
                <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                  60% OFF
                </span>
              </div>
              <p className="text-purple-200 mt-1">Just $8/month</p>
            </div>

            <div className="space-y-3 mb-6">
              <Feature text="30-day free trial" />
              <Feature text="Keep 95% of sales" />
              <Feature text="Unlimited track uploads" />
              <Feature text="10GB storage included" />
              <Feature text="Custom artist page" />
              <Feature text="Analytics dashboard" />
              <Feature text="Priority support" highlight />
            </div>
          </div>
        </div>

        {/* Storage Add-On Info */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/10">
          <div className="flex items-start gap-4">
            <Database className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-lg font-bold text-white mb-2">Need more storage?</h4>
              <p className="text-purple-200 mb-2">
                Upgrade to <span className="font-bold text-white">unlimited storage</span> for just <span className="font-bold text-white">$5/month</span> extra.
              </p>
              <p className="text-purple-300 text-sm">
                You can add this anytime from your dashboard.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="group relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-4 rounded-xl text-xl font-bold shadow-2xl shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            <CreditCard className="w-6 h-6" />
            {loading ? 'Processing...' : 'Start Free Trial'}
          </button>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 text-center space-y-3">
          <p className="text-purple-200 text-sm">
            <Check className="w-4 h-4 inline mr-1" />
            <strong>Credit card required</strong> but you won't be charged for 30 days
          </p>
          <p className="text-purple-200 text-sm">
            <Check className="w-4 h-4 inline mr-1" />
            <strong>Cancel anytime</strong> with one click · No questions asked
          </p>
          <p className="text-purple-200 text-sm">
            <Check className="w-4 h-4 inline mr-1" />
            <strong>Secure payment</strong> processed by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ text, highlight = false }: { text: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${highlight ? 'text-yellow-300 font-semibold' : 'text-purple-100'}`}>
      <Check className={`w-5 h-5 flex-shrink-0 ${highlight ? 'text-yellow-400' : 'text-green-400'}`} />
      <span>{text}</span>
    </div>
  );
}
