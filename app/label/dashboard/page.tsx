'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LabelAuthProvider, useLabelAuth } from '@/lib/label-auth-context'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, Music, TrendingUp, DollarSign, Download, Users, Link as LinkIcon, CreditCard, ShoppingBag, Activity, Clock, ArrowUpRight, Wallet, Banknote, Video } from 'lucide-react'
import Link from 'next/link'
import { SubscriptionBanner } from '@/components/subscription-banner'
import StripeConnectOnboarding from '@/components/stripe-connect-onboarding-v2'

interface Payout {
  id: string
  amount: number
  status: string
  created_at: string
  description: string
}

interface ActivityItem {
  id: string
  type: 'download' | 'purchase' | 'upload' | 'payout'
  title: string
  description: string
  amount?: number
  created_at: string
}

function DashboardContent() {
  const router = useRouter()
  const { user, loading, signOut } = useLabelAuth()
  const [labelData, setLabelData] = useState<any>(null)
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalDownloads: 0,
    totalPlays: 0,
    totalRevenue: 0,
    pendingPayout: 0,
    totalOrders: 0,
  })
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [recentTracks, setRecentTracks] = useState<any[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/label/login')
    }

    if (user) {
      loadLabelData()
      loadStats()
      loadPayouts()
      loadRecentActivity()
      loadRecentTracks()
    }
  }, [user, loading])

  const loadLabelData = async () => {
    if (!user) return

    const { data } = await supabase
      .from('labels')
      .select('*, subscription_status, subscription_tier, trial_ends_at, subscription_expires_at')
      .eq('id', user.id)
      .single()

    setLabelData(data)
  }

  const loadStats = async () => {
    if (!user) return

    // Count tracks in catalog
    const { count: trackCount } = await supabase
      .from('tracks')
      .select('*', { count: 'exact', head: true })
      .eq('label_id', user.id)

    // Count downloads for label's tracks
    const { count: downloadCount } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .eq('label_id', user.id)

    // Count orders for label's products
    const { count: orderCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('label_id', user.id)
      .eq('status', 'completed')

    // Sum revenue from orders
    const { data: orderData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('label_id', user.id)
      .eq('status', 'completed')

    const totalRevenue = orderData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0

    // Calculate pending payout (90% for labels)
    const { data: payoutData } = await supabase
      .from('payouts')
      .select('amount')
      .eq('label_id', user.id)
      .eq('status', 'paid')

    const totalPaidOut = payoutData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
    const pendingPayout = (totalRevenue * 0.90) - totalPaidOut

    setStats({
      totalTracks: trackCount || 0,
      totalDownloads: downloadCount || 0,
      totalPlays: 0,
      totalRevenue,
      pendingPayout: Math.max(0, pendingPayout),
      totalOrders: orderCount || 0,
    })
  }

  const loadPayouts = async () => {
    if (!user) return

    const { data } = await supabase
      .from('payouts')
      .select('*')
      .eq('label_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    setPayouts(data || [])
  }

  const loadRecentActivity = async () => {
    if (!user) return

    // Get recent orders as activity
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('label_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)

    // Get recent uploads as activity
    const { data: recentUploads } = await supabase
      .from('tracks')
      .select('id, title, created_at')
      .eq('label_id', user.id)
      .order('created_at', { ascending: false })
      .limit(2)

    const activity: ActivityItem[] = [
      ...(recentOrders?.map(order => ({
        id: order.id,
        type: 'purchase' as const,
        title: 'New sale',
        description: `Order #${order.id.slice(-6)}`,
        amount: order.total_amount,
        created_at: order.created_at,
      })) || []),
      ...(recentUploads?.map(track => ({
        id: track.id,
        type: 'upload' as const,
        title: 'Track uploaded',
        description: track.title,
        created_at: track.created_at,
      })) || []),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

    setRecentActivity(activity)
  }

  const loadRecentTracks = async () => {
    if (!user) return

    const { data } = await supabase
      .from('tracks')
      .select('id, title, artist_name, created_at, cover_url')
      .eq('label_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3)

    setRecentTracks(data || [])
  }

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user || !labelData) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-serif font-semibold">
                artistrax
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-lg">{labelData.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/labels/${labelData.slug}`}>
                <Button variant="outline" size="sm">
                  View Public Page
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold mb-2">Label Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your catalog and artists
          </p>
        </div>

        {/* Subscription Banner */}
        <div className="mb-8">
          <SubscriptionBanner
            accountType="label"
            subscriptionStatus={labelData.subscription_status}
            subscriptionTier={labelData.subscription_tier}
            trialEndsAt={labelData.trial_ends_at}
            subscriptionExpiresAt={labelData.subscription_expires_at}
          />
        </div>

        {/* Stripe Connect Onboarding */}
        <div className="mb-8">
          <StripeConnectOnboarding accountType="label" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <Link href="/label/upload">
            <Button className="w-full h-auto py-4 flex-col gap-1 text-sm">
              <Upload className="w-5 h-5" />
              <span>Upload</span>
            </Button>
          </Link>
          <Link href="/label/batch-upload">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1 text-sm">
              <Upload className="w-5 h-5" />
              <span>Batch</span>
            </Button>
          </Link>
          <Link href="/label/merch">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1 text-sm">
              <ShoppingBag className="w-5 h-5" />
              <span>Merch</span>
            </Button>
          </Link>
          <Link href="/label/orders">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1 text-sm">
              <CreditCard className="w-5 h-5" />
              <span>Orders</span>
            </Button>
          </Link>
          <Link href="/label/videos">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1 text-sm">
              <Video className="w-5 h-5" />
              <span>Videos</span>
            </Button>
          </Link>
          <Link href="/label/links">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1 text-sm">
              <LinkIcon className="w-5 h-5" />
              <span>Links</span>
            </Button>
          </Link>
          <Link href="/label/profile">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1 text-sm">
              <Users className="w-5 h-5" />
              <span>Profile</span>
            </Button>
          </Link>
          <Link href="/label/analytics">
            <Button variant="outline" className="w-full h-auto py-4 flex-col gap-1 text-sm">
              <TrendingUp className="w-5 h-5" />
              <span>Analytics</span>
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Catalog</CardTitle>
              <Music className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTracks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Downloads</CardTitle>
              <Download className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Plays</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPlays}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-primary">Pending Payout</CardTitle>
              <Wallet className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${stats.pendingPayout.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Available to withdraw</p>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <Link href="/label/analytics" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  View all <ArrowUpRight className="w-4 h-4" />
                </Link>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((item) => (
                      <div key={item.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          item.type === 'purchase' ? 'bg-green-100 text-green-600' :
                          item.type === 'upload' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {item.type === 'purchase' ? <DollarSign className="w-5 h-5" /> :
                           item.type === 'upload' ? <Upload className="w-5 h-5" /> :
                           <Activity className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                        </div>
                        <div className="text-right">
                          {item.amount && (
                            <p className="font-semibold text-green-600">+${Number(item.amount).toFixed(2)}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(item.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No recent activity</p>
                    <p className="text-sm mt-1">Upload your first track to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Uploads */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent Uploads</CardTitle>
                <Link href="/label/upload" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                  Upload new <ArrowUpRight className="w-4 h-4" />
                </Link>
              </CardHeader>
              <CardContent>
                {recentTracks.length > 0 ? (
                  <div className="space-y-3">
                    {recentTracks.map((track) => (
                      <div key={track.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden">
                          {track.cover_url ? (
                            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Music className="w-5 h-5 text-primary/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{track.title}</p>
                          <p className="text-xs text-muted-foreground">{track.artist_name || 'Unknown Artist'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{formatTimeAgo(track.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No uploads yet</p>
                    <Link href="/label/upload">
                      <Button variant="outline" size="sm" className="mt-3">Upload your first track</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payouts & Info */}
          <div className="space-y-8">
            {/* Payouts Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Banknote className="w-5 h-5 text-accent" />
                  Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <p className="text-sm text-muted-foreground mb-1">Available to withdraw</p>
                    <p className="text-3xl font-bold text-accent">${stats.pendingPayout.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      You keep 90% of every sale. Payouts process within 2-3 business days.
                    </p>
                    {stats.pendingPayout > 0 && (
                      <Button className="w-full mt-4" size="sm">
                        Request Payout
                      </Button>
                    )}
                  </div>

                  {payouts.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recent Payouts</p>
                      {payouts.map((payout) => (
                        <div key={payout.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div>
                            <p className="text-sm font-medium">${Number(payout.amount).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{formatTimeAgo(payout.created_at)}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            payout.status === 'paid' ? 'bg-green-100 text-green-700' :
                            payout.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {payout.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      <p>No payouts yet</p>
                      <p className="text-xs mt-1">Sales will appear here once processed</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Getting Started Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`flex items-start gap-3 p-3 rounded-lg ${stats.totalTracks > 0 ? 'bg-green-50' : 'bg-muted/50'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                      stats.totalTracks > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {stats.totalTracks > 0 ? '✓' : '1'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${stats.totalTracks > 0 ? 'text-green-700' : ''}`}>
                        Upload your first release
                      </p>
                      {stats.totalTracks === 0 && (
                        <Link href="/label/upload">
                          <Button size="sm" variant="outline" className="mt-2">Upload Now</Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium">Customize your label page</p>
                      <p className="text-xs text-muted-foreground mt-1">Add logo, bio, and social links</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium">Connect Stripe for payouts</p>
                      <p className="text-xs text-muted-foreground mt-1">Start earning from releases</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href={`/labels/${labelData.slug}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm">View Public Page</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                  <Link href="/label/orders" className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm">Manage Orders</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                  <Link href="/label/billing" className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <span className="text-sm">Billing & Subscription</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function LabelDashboardPage() {
  return (
    <LabelAuthProvider>
      <DashboardContent />
    </LabelAuthProvider>
  )
}
