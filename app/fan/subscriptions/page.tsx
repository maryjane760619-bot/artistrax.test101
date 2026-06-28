'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Calendar, DollarSign, ExternalLink } from 'lucide-react'

interface Subscription {
  id: string
  status: string
  monthly_price: number
  current_period_end: string
  created_at: string
  artists?: { display_name: string; username: string; avatar_url: string }
  labels?: { name: string; slug: string; logo_url: string }
}

export default function FanSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const authHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
  }

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions', { headers: await authHeader() })
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelSubscription = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return

    try {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
        headers: await authHeader(),
      })

      if (response.ok) {
        setSubscriptions(subs => subs.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error('Cancel error:', error)
    }
  }

  const totalMonthly = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.monthly_price, 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500" />
            My Subscriptions
          </h1>
          <p className="text-gray-600 mt-2">
            Supporting {subscriptions.length} {subscriptions.length === 1 ? 'creator' : 'creators'}
          </p>
        </div>

        {subscriptions.length > 0 && (
          <Card className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600">Total monthly</p>
                  <p className="text-3xl font-bold">${totalMonthly.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-600">Next billing</p>
                  <p className="text-lg font-semibold">
                    {subscriptions[0]?.current_period_end 
                      ? new Date(subscriptions[0].current_period_end).toLocaleDateString()
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {subscriptions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">No Subscriptions Yet</h2>
              <p className="text-gray-500 mb-6">Subscribe to your favorite artists and labels to support them directly.</p>
              <Link href="/artists">
                <Button>Browse Artists</Button>
              </Link>
            </div>
          ) : (
            subscriptions.map((sub) => {
              const creator = sub.artists || sub.labels
              const creatorName = sub.artists?.display_name || sub.labels?.name
              const creatorLink = sub.artists 
                ? `/${sub.artists.username}` 
                : `/labels/${sub.labels?.slug}`

              return (
                <Card key={sub.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                          {creator?.avatar_url || creator?.logo_url ? (
                            <img 
                              src={creator.avatar_url || creator.logo_url} 
                              alt={creatorName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">
                            <Link href={creatorLink} className="hover:text-pink-600">
                              {creatorName}
                            </Link>
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ${sub.monthly_price}/month
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Renews {new Date(sub.current_period_end).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                            sub.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={creatorLink}>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        {sub.status === 'active' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => cancelSubscription(sub.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {subscriptions.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/artists">
              <Button variant="outline">Discover More Artists</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}