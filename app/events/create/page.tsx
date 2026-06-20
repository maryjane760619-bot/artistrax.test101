'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'

type TicketTierInput = {
  name: string
  description: string
  price: string
  quantity: string
}

export default function CreateEventPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<'artist' | 'label' | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [stripeComplete, setStripeComplete] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    venue_name: '',
    venue_address: '',
    event_date: '',
    start_time: '',
    end_time: '',
    is_virtual: false,
    streaming_url: '',
    cover_url: '',
  })

  const [ticketTiers, setTicketTiers] = useState<TicketTierInput[]>([
    { name: 'General Admission', description: 'Standard entry', price: '20.00', quantity: '100' },
  ])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/fan/login?redirect=/events/create')
      return
    }

    setUser(session.user)

    // Check if user is artist or label
    const { data: artist } = await supabase
      .from('artists')
      .select('id, stripe_charges_enabled')
      .eq('id', session.user.id)
      .single()

    if (artist) {
      setUserType('artist')
      setStripeComplete(!!artist.stripe_charges_enabled)
      setLoading(false)
      return
    }

    const { data: label } = await supabase
      .from('labels')
      .select('id, stripe_charges_enabled')
      .eq('id', session.user.id)
      .single()

    if (label) {
      setUserType('label')
      setStripeComplete(!!label.stripe_charges_enabled)
      setLoading(false)
      return
    }

    setError('Only artists and labels can create events')
    setLoading(false)
  }

  const addTier = () => {
    setTicketTiers(prev => [...prev, { name: '', description: '', price: '0.00', quantity: '50' }])
  }

  const removeTier = (index: number) => {
    if (ticketTiers.length <= 1) return
    setTicketTiers(prev => prev.filter((_, i) => i !== index))
  }

  const updateTier = (index: number, field: keyof TicketTierInput, value: string) => {
    setTicketTiers(prev => prev.map((tier, i) =>
      i === index ? { ...tier, [field]: value } : tier
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    if (!form.title || !form.event_date) {
      setError('Title and event date are required')
      setSubmitting(false)
      return
    }

    // Get auth token
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setError('Please log in')
      setSubmitting(false)
      return
    }

    const slug = form.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '')

    const body: any = {
      title: form.title,
      slug,
      description: form.description || undefined,
      cover_url: form.cover_url || undefined,
      venue_name: form.venue_name || undefined,
      venue_address: form.venue_address || undefined,
      event_date: form.event_date,
      start_time: form.start_time || undefined,
      end_time: form.end_time || undefined,
      is_virtual: form.is_virtual,
      streaming_url: form.streaming_url || undefined,
      ticket_tiers: ticketTiers.filter(t => t.name && Number(t.price) >= 0).map(t => ({
        name: t.name,
        description: t.description || undefined,
        price: Number(t.price),
        quantity: Number(t.quantity) || 0,
      })),
    }

    const res = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to create event')
      setSubmitting(false)
      return
    }

    // Redirect to the event page
    router.push(`/events/${data.event.slug}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user || !userType) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only artists and labels can create events.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 md:pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <Link href="/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Events
          </Link>

          <h1 className="text-4xl font-serif font-bold mb-2">Create Event</h1>
          <p className="text-muted-foreground mb-8">List your live show, virtual performance, or community event</p>

          {/* Stripe Warning */}
          {!stripeComplete && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-600 dark:text-amber-400">Stripe onboarding required</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete your Stripe Connect setup to sell tickets. 
                  <Link href={userType === 'label' ? '/label/dashboard' : '/artist/dashboard'} 
                    className="text-primary hover:underline ml-1">
                    Go to Dashboard
                  </Link>
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Event Details */}
            <section className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-serif font-semibold">Event Details</h2>

              <div>
                <label className="text-sm font-medium block mb-1.5">Event Title *</label>
                <Input
                  placeholder="e.g., Summer Breeze Festival"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Description</label>
                <textarea
                  placeholder="Tell attendees what to expect..."
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-y"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1.5">Cover Image URL</label>
                <Input
                  placeholder="https://your-image.com/event-cover.jpg"
                  value={form.cover_url}
                  onChange={e => setForm(prev => ({ ...prev, cover_url: e.target.value }))}
                />
              </div>
            </section>

            {/* Date & Time */}
            <section className="bg-card border border-border rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-serif font-semibold">Date & Time</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Event Date *</label>
                  <Input
                    type="date"
                    value={form.event_date}
                    onChange={e => setForm(prev => ({ ...prev, event_date: e.target.value }))}
                    required
                  />
                </div>
                <div />
                <div>
                  <label className="text-sm font-medium block mb-1.5">Start Time</label>
                  <Input
                    type="time"
                    value={form.start_time}
                    onChange={e => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">End Time</label>
                  <Input
                    type="time"
                    value={form.end_time}
                    onChange={e => setForm(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>
            </section>

            {/* Location */}
            <section className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-serif font-semibold">Location</h2>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.is_virtual}
                    onChange={e => setForm(prev => ({ ...prev, is_virtual: e.target.checked }))}
                    className="rounded border-border"
                  />
                  Virtual Event
                </label>
              </div>

              {form.is_virtual ? (
                <div>
                  <label className="text-sm font-medium block mb-1.5">Streaming URL</label>
                  <Input
                    placeholder="https://twitch.tv/yourstream or https://zoom.us/j/..."
                    value={form.streaming_url}
                    onChange={e => setForm(prev => ({ ...prev, streaming_url: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Venue Name</label>
                    <Input
                      placeholder="e.g., The Fillmore"
                      value={form.venue_name}
                      onChange={e => setForm(prev => ({ ...prev, venue_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5">Address</label>
                    <Input
                      placeholder="123 Main St, City, State"
                      value={form.venue_address}
                      onChange={e => setForm(prev => ({ ...prev, venue_address: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Ticket Tiers */}
            <section className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-serif font-semibold">Ticket Tiers</h2>
                <Button type="button" variant="outline" size="sm" onClick={addTier}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Tier
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Create different ticket types (GA, VIP, Early Bird, etc.)
              </p>

              {ticketTiers.map((tier, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tier {index + 1}</span>
                    {ticketTiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTier(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium block mb-1">Name</label>
                      <Input
                        placeholder="General Admission"
                        value={tier.name}
                        onChange={e => updateTier(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">Price ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="20.00"
                        value={tier.price}
                        onChange={e => updateTier(index, 'price', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">Quantity (0 = unlimited)</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="100"
                        value={tier.quantity}
                        onChange={e => updateTier(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium block mb-1">Description</label>
                      <Input
                        placeholder="Standard entry with full access"
                        value={tier.description}
                        onChange={e => updateTier(index, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* Error */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-4">
              <Button type="submit" size="lg" disabled={submitting || !stripeComplete}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
              <Link href="/events">
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
