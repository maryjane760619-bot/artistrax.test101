'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        setError('No session ID found');
        setLoading(false);
        return;
      }

      try {
        // In a real app, you'd verify the session with Stripe
        // For now, just mark as successful after a brief delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
      } catch (err) {
        console.error('Verification error:', err);
        setError('Failed to verify subscription');
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1F4E3D] to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1F4E3D] to-black flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <CheckCircle className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Verification Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/artist/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1F4E3D] to-black flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md text-center">
        <div className="text-[#1F4E3D] mb-4">
          <CheckCircle className="w-16 h-16 mx-auto" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Welcome to Artistrax! 🎉</h1>
        
        <p className="text-gray-600 mb-6">
          Your subscription has been activated and your <strong>30-day free trial</strong> has started.
        </p>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-sm text-left">
          <h3 className="font-semibold mb-2">What's next?</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Upload your first tracks</li>
            <li>✓ Customize your artist profile</li>
            <li>✓ Share your music with fans</li>
            <li>✓ Track your analytics</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          You won't be charged until {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}. 
          Cancel anytime from your dashboard.
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => router.push('/artist/upload')}
            className="w-full bg-[#1F4E3D] hover:bg-[#2d7556]"
          >
            Upload Your First Track
          </Button>
          <Button 
            onClick={() => router.push('/artist/dashboard')}
            variant="outline"
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-[#1F4E3D] to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
