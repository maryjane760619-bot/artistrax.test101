'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { Loader2, Star } from 'lucide-react'

interface Settings {
  is_enabled: boolean
  monthly_price: number
  description: string
  benefits_discount_percent: number
  benefits_early_access_hours: number
  benefits_exclusive_streams: boolean
  benefits_subscriber_badge: boolean
}

const DEFAULTS: Settings = {
  is_enabled: false,
  monthly_price: 5,
  description: 'Support my music and get exclusive perks',
  benefits_discount_percent: 10,
  benefits_early_access_hours: 24,
  benefits_exclusive_streams: true,
  benefits_subscriber_badge: true,
}

export function SubscriptionSettingsEditor() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/creator/subscription-settings', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      })
      const json = await res.json()
      if (json.settings) setSettings({ ...DEFAULTS, ...json.settings })
    } catch {
      // fall back to defaults silently
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/creator/subscription-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(settings),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="pt-6 flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardContent className="pt-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Star className="w-4 h-4 text-pink-500" />
              Fan Subscription
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Not every artist or label needs this — leave it off if you have nothing to offer fans right now.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.is_enabled}
            onClick={() => setSettings(s => ({ ...s, is_enabled: !s.is_enabled }))}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${settings.is_enabled ? 'bg-accent' : 'bg-muted'}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${settings.is_enabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {settings.is_enabled && (
          <div className="space-y-4 pt-2 border-t border-border">
            <div>
              <Label htmlFor="monthly_price">Monthly price (USD)</Label>
              <Input
                id="monthly_price"
                type="number"
                min={1}
                max={50}
                step="0.5"
                value={settings.monthly_price}
                onChange={e => setSettings(s => ({ ...s, monthly_price: parseFloat(e.target.value) || 0 }))}
                className="mt-1 w-32"
              />
              <p className="text-xs text-muted-foreground mt-1">Between $1 and $50.</p>
            </div>

            <div>
              <Label htmlFor="description">Pitch to fans</Label>
              <Textarea
                id="description"
                value={settings.description}
                onChange={e => setSettings(s => ({ ...s, description: e.target.value }))}
                className="mt-1"
                placeholder="What do subscribers get?"
              />
            </div>

            <div>
              <Label htmlFor="discount">Purchase discount for subscribers (%)</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                max={100}
                value={settings.benefits_discount_percent}
                onChange={e => setSettings(s => ({ ...s, benefits_discount_percent: parseInt(e.target.value) || 0 }))}
                className="mt-1 w-32"
              />
            </div>

            <div>
              <Label htmlFor="early_access">Early access window (hours before public release)</Label>
              <Input
                id="early_access"
                type="number"
                min={0}
                value={settings.benefits_early_access_hours}
                onChange={e => setSettings(s => ({ ...s, benefits_early_access_hours: parseInt(e.target.value) || 0 }))}
                className="mt-1 w-32"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="exclusive_streams"
                checked={settings.benefits_exclusive_streams}
                onChange={e => setSettings(s => ({ ...s, benefits_exclusive_streams: e.target.checked }))}
              />
              <Label htmlFor="exclusive_streams" className="!mb-0">Subscriber-only live streams</Label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="subscriber_badge"
                checked={settings.benefits_subscriber_badge}
                onChange={e => setSettings(s => ({ ...s, benefits_subscriber_badge: e.target.checked }))}
              />
              <Label htmlFor="subscriber_badge" className="!mb-0">Exclusive subscriber badge</Label>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save
          </Button>
          {saved && <span className="text-sm text-green-600">Saved.</span>}
        </div>
      </CardContent>
    </Card>
  )
}
