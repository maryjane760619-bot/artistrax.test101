'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FanAuthProvider, useFanAuth } from '@/lib/fan-auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { PointsBalanceCard } from '@/components/points-balance-card';
import { POINTS_CONFIG } from '@/lib/points-config';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import Link from 'next/link';

function PointsHistoryContent() {
  const router = useRouter();
  const { user, loading } = useFanAuth();
  const [fanData, setFanData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/fan/login');
    }

    if (user) {
      loadFanData();
      loadTransactions();
    }
  }, [user, loading]);

  const loadFanData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('fans')
      .select('*, points_balance')
      .eq('id', user.id)
      .single();

    setFanData(data);
  };

  const loadTransactions = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('fan_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    setTransactions(data || []);
    setLoadingTransactions(false);
  };

  if (loading || !user || !fanData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/fan/dashboard" className="text-2xl font-serif font-semibold">
              artistrax
            </Link>
            <Link href="/fan/dashboard">
              <Button variant="ghost" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-2">Rewards Points</h1>
          <p className="text-muted-foreground">
            Earn points with every purchase and redeem for free tracks
          </p>
        </div>

        {/* Points Balance */}
        <div className="mb-8">
          <PointsBalanceCard pointsBalance={fanData.points_balance || 0} />
        </div>

        {/* How It Works */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="bg-[#F59E0B] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
                1
              </div>
              <h3 className="font-semibold mb-2">Earn Points</h3>
              <p className="text-sm text-muted-foreground">
                Get {POINTS_CONFIG.POINTS_PER_DOLLAR} points for every $1 you spend on tracks
              </p>
            </div>
            <div>
              <div className="bg-[#F59E0B] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
                2
              </div>
              <h3 className="font-semibold mb-2">Save Up</h3>
              <p className="text-sm text-muted-foreground">
                Collect {POINTS_CONFIG.POINTS_PER_TRACK} points to unlock a free track download
              </p>
            </div>
            <div>
              <div className="bg-[#F59E0B] text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mb-3">
                3
              </div>
              <h3 className="font-semibold mb-2">Redeem</h3>
              <p className="text-sm text-muted-foreground">
                Use points on any paid track—your choice!
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
          
          {loadingTransactions ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">No transactions yet</p>
              <Link href="/">
                <Button>Browse Tracks</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${
                      tx.amount > 0 ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      {tx.amount > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {tx.description || (tx.amount > 0 ? 'Points earned' : 'Points redeemed')}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(tx.created_at).toLocaleDateString()} at{' '}
                        {new Date(tx.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      tx.amount > 0 ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Balance: {tx.balance_after}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PointsHistoryPage() {
  return (
    <FanAuthProvider>
      <PointsHistoryContent />
    </FanAuthProvider>
  );
}
