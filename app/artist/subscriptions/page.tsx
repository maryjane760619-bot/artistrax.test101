'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Heart, Users, DollarSign, Settings, Loader2 } from 'lucide-react'

interface Subscriber {
  id: string
  status: string
  monthly_price: number
  created_at: string
  fans: {
    display_name: string
    email: string
    avatar_url: string
  }
}

export default function CreatorSubscriptionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [stats, setStats] = useState({ total: 0, monthlyRevenue: 0, averagePrice: 0 })
  
  const [settings, setSettings] = useState({
    is_enabled: false,
    monthly_price: 5,
    description: 'Support my music and get exclusive perks',
    welcome_message: 'Thanks for subscribing!',
    benefits_discount_percent: 10,
    benefits_early_access_hours: 24,
    benefits_exclusive_streams: true,
    benefits_subscriber_badge: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {}

      // Fetch settings
      const settingsRes = await fetch('/api/creator/subscription-settings', { headers })
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        setSettings(data.settings)
      }

      // Fetch subscribers
      const subscribersRes = await fetch('/api/creator/subscribers', { headers })
      if (subscribersRes.ok) {
        const data = await subscribersRes.json()
        setSubscribers(data.subscribers)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/creator/subscription-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-500" />
            Fan Subscriptions
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.monthlyRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Avg Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.averagePrice.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Subscription Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Enable Fan Subscriptions</p>
                  <p className="text-sm text-gray-500">Allow fans to subscribe to you</p>
                </div>
                <Switch
                  checked={settings.is_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, is_enabled: checked })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Monthly Price ($)</label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.monthly_price}
                  onChange={(e) => setSettings({ ...settings, monthly_price: parseFloat(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">You keep 95% (minus Stripe fees)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Welcome Message</label>
                <Textarea
                  value={settings.welcome_message}
                  onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                  rows={2}
                  placeholder="Message shown to new subscribers"
                />
              </div>

              <div className="space-y-3">
                <p className="font-medium">Subscriber Benefits</p>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm">Purchase discount (%)</p>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={settings.benefits_discount_percent}
                    onChange={(e) => setSettings({ ...settings, benefits_discount_percent: parseInt(e.target.value) })}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm">Early access (hours)</p>
                  <Input
                    type="number"
                    min={0}
                    max={168}
                    value={settings.benefits_early_access_hours}
                    onChange={(e) => setSettings({ ...settings, benefits_early_access_hours: parseInt(e.target.value) })}
                    className="w-24"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm">Exclusive live streams</p>
                  <Switch
                    checked={settings.benefits_exclusive_streams}
                    onCheckedChange={(checked) => setSettings({ ...settings, benefits_exclusive_streams: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm">Subscriber badge</p>
                  <Switch
                    checked={settings.benefits_subscriber_badge}
                    onCheckedChange={(checked) => setSettings({ ...settings, benefits_subscriber_badge: checked })}
                  />
                </div>
              </div>

              <Button 
                onClick={saveSettings} 
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Subscribers List */}
          <Card>
            <CardHeader>
              <CardTitle>Subscribers</CardTitle>
            </CardHeader>
            <CardContent>
              {subscribers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No subscribers yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {subscribers.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 overflow-hidden">
                        {sub.fans.avatar_url ? (
                          <img src={sub.fans.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-bold">
                            {sub.fans.display_name[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{sub.fans.display_name}</p>
                        <p className="text-sm text-gray-500">${sub.monthly_price}/month</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}