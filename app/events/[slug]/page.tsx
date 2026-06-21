'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, MapPin, Clock, Music, Building2, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type EventTier = {
  id: string
  name: string
  description: string | null
  price: number
  quantity: number
  quantity_sold: number
  max_per_order: number
  is_available: boolean
}

type EventDetail = {
  id: string
  title: string
  slug: string
  description: string | null
  cover_url: string | null
  venue_name: string | null
  venue_address: string | null
  event_date: string
  start_time: string | null
  end_time: string | null
  is_virtual: boolean
  streaming_url: string | null
  status: string
  ticket_tiers: EventTier[]
  artists: { id: string; display_name: string; avatar_url: string | null; username: string; bio: string | null } | null
  labels: { id: string; name: string; logo_url: string | null; slug: string; bio: string | null } | null
}

type CheckoutState = {
  tierId: string
  quantity: number
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  buyerAddress: { street: string; city: string; state: string; zip: string; country: string }
  notes: string
  referralSource: string
  emailOptIn: boolean
  attendees: { name: string; email: string; accommodations: string; dietary: string }[]
  loading: boolean
  error: string
  success: boolean
}

export default function EventDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const purchaseSuccess = searchParams.get('purchase') === 'success'

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checkout, setCheckout] = useState<CheckoutState>({
    tierId: '',
    quantity: 1,
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerAddress: { street: '', city: '', state: '', zip: '', country: 'US' },
    notes: '',
    referralSource: '',
    emailOptIn: true,
    attendees: [{ name: '', email: '', accommodations: '', dietary: '' }],
    loading: false,
    error: '',
    success: false,
  })

  useEffect(() => {
    if (slug) loadEvent()
  }, [slug])

  const loadEvent = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        artists:artist_id (id, display_name, avatar_url, username, bio),
        labels:label_id (id, name, logo_url, slug, bio),
        ticket_tiers (*)
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      setError('Event not found')
    } else {
      setEvent(data as EventDetail)
      // Auto-select first available tier
      const firstTier = (data as EventDetail).ticket_tiers?.find(t => t.is_available)
      if (firstTier) {
        setCheckout(prev => ({ ...prev, tierId: firstTier.id }))
      }
    }
    setLoading(false)
  }

  const handlePurchase = async () => {
    if (!checkout.tierId || !checkout.buyerName || !checkout.buyerEmail) {
      setCheckout(prev => ({ ...prev, error: 'Please fill in your name and email' }))
      return
    }

    setCheckout(prev => ({ ...prev, loading: true, error: '' }))

    const res = await fetch(`/api/events/${event!.id}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tierId: checkout.tierId,
        quantity: checkout.quantity,
        buyerName: checkout.buyerName,
        buyerEmail: checkout.buyerEmail,
        buyerPhone: checkout.buyerPhone || undefined,
        buyerAddress: checkout.buyerAddress.street
          ? checkout.buyerAddress
          : undefined,
        notes: checkout.notes || undefined,
        referralSource: checkout.referralSource || undefined,
        emailOptIn: checkout.emailOptIn,
        attendees: checkout.attendees.map(a => ({
          name: a.name,
          email: a.email || undefined,
          accommodations: a.accommodations || undefined,
          dietary: a.dietary || undefined,
        })),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setCheckout(prev => ({ ...prev, loading: false, error: data.error }))
      return
    }

    // Redirect to Stripe checkout
    window.location.href = data.url
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const selectedTier = event?.ticket_tiers?.find(t => t.id === checkout.tierId)
  const total = selectedTier ? (Number(selectedTier.price) * checkout.quantity).toFixed(2) : '0.00'

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex flex-col">
        <Header />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-[#8b8580]">Loading event...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-[#0b0b0c] flex flex-col">
        <Header />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-[#8b8580] mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-2 text-[#e5dfd0]">Event Not Found</h2>
            <p className="text-[#8b8580] mb-6">{error || 'This event does not exist.'}</p>
            <Link href="/events">
              <Button className="bg-[#155dfc] text-white rounded-full px-5 py-2 hover:bg-[#155dfc]/90">Browse Events</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b0c] flex flex-col text-[#faf7f1]">
      <Header />
      <main className="flex-1 pt-16 md:pt-20">
        {/* Purchase Success Banner */}
        {purchaseSuccess && (
          <div className="bg-[#00bb7f]/10 border border-[#00bb7f]/20 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#00bb7f] flex-shrink-0" />
              <p className="text-[#00bb7f] font-medium">
                Payment successful! Check your email for your ticket confirmation.
              </p>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="relative">
          <div className="aspect-[21/9] bg-[#1f1f21] overflow-hidden">
            {event.cover_url ? (
              <img src={event.cover_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#1f1f21]">
                <Calendar className="w-20 h-20 text-[#e5dfd0]/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0c] via-[#0b0b0c]/45 to-transparent" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Creator */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#e5dfd0]">{event.title}</h1>
                    <div className="flex items-center gap-3 mt-3">
                      {event.artists ? (
                        <Link href={`/artist/${event.artists.username}`} className="flex items-center gap-2 text-[#8b8580] hover:text-[#e5dfd0] transition-colors">
                          <Music className="w-4 h-4" />
                          <span>{event.artists.display_name}</span>
                        </Link>
                      ) : event.labels ? (
                        <Link href={`/labels/${event.labels.slug}`} className="flex items-center gap-2 text-[#8b8580] hover:text-[#e5dfd0] transition-colors">
                          <Building2 className="w-4 h-4" />
                          <span>{event.labels.name}</span>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                  {event.is_virtual && (
                    <span className="bg-[#00bb7f]/10 border border-[#00bb7f]/20 text-[#00bb7f] text-sm px-3 py-1 rounded-full font-medium">
                      Virtual Event
                    </span>
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#141415] border border-[#2a2a2d] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#e5dfd0]" />
                    <div>
                      <p className="text-sm text-[#8b8580]">Date</p>
                      <p className="font-medium text-[#00bb7f]">{formatDate(event.event_date)}</p>
                    </div>
                  </div>
                </div>
                {event.start_time && (
                  <div className="bg-[#141415] border border-[#2a2a2d] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-[#e5dfd0]" />
                      <div>
                        <p className="text-sm text-[#8b8580]">Time</p>
                        <p className="font-medium text-[#faf7f1]">
                          {event.start_time.slice(0, 5)}
                          {event.end_time ? ` — ${event.end_time.slice(0, 5)}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {event.venue_name && (
                  <div className="bg-[#141415] border border-[#2a2a2d] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-[#e5dfd0]" />
                      <div>
                        <p className="text-sm text-[#8b8580]">Venue</p>
                        <p className="font-medium text-[#faf7f1]">{event.venue_name}</p>
                        {event.venue_address && (
                          <p className="text-sm text-[#8b8580]">{event.venue_address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {event.streaming_url && (
                  <a href={event.streaming_url} target="_blank" rel="noopener noreferrer"
                    className="bg-[#141415] border border-[#2a2a2d] rounded-xl p-4 hover:border-[#e5dfd0]/50 transition-colors group">
                    <div className="flex items-center gap-3">
                      <ExternalLink className="w-5 h-5 text-[#e5dfd0]" />
                      <div>
                        <p className="text-sm text-[#8b8580]">Streaming Link</p>
                        <p className="font-medium text-[#faf7f1] group-hover:text-[#e5dfd0] transition-colors truncate">
                          Watch Live
                        </p>
                      </div>
                    </div>
                  </a>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <div>
                  <h2 className="text-xl font-serif font-semibold mb-3 text-[#e5dfd0]">About This Event</h2>
                  <p className="text-[#faf7f1] whitespace-pre-line leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Creator Bio */}
              {event.artists?.bio && (
                <div className="bg-[#141415] border border-[#2a2a2d] rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {event.artists.avatar_url ? (
                      <img src={event.artists.avatar_url} alt={event.artists.display_name}
                        className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#1f1f21] flex items-center justify-center">
                        <Music className="w-5 h-5 text-[#8b8580]" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-[#faf7f1]">{event.artists.display_name}</p>
                      <p className="text-sm text-[#8b8580]">Artist</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#faf7f1] leading-relaxed">{event.artists.bio}</p>
                </div>
              )}
            </div>

            {/* Sidebar — Ticket Purchase */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 bg-[#141415] border border-[#2a2a2d] rounded-xl p-6 space-y-5">
                <h2 className="text-xl font-serif font-semibold text-[#e5dfd0]">Get Tickets</h2>

                {/* Ticket Tier Selector */}
                {event.ticket_tiers && event.ticket_tiers.length > 0 ? (
                  <div className="space-y-3">
                    {event.ticket_tiers.map(tier => {
                      const available = tier.quantity > 0
                        ? tier.quantity - tier.quantity_sold
                        : 999
                      const isSoldOut = tier.quantity > 0 && available <= 0
                      const isSelected = checkout.tierId === tier.id

                      return (
                        <button
                          key={tier.id}
                          onClick={() => {
                            if (!isSoldOut && tier.is_available) {
                              setCheckout(prev => ({ ...prev, tierId: tier.id, error: '' }))
                            }
                          }}
                          disabled={isSoldOut || !tier.is_available}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-[#e5dfd0] bg-[#e5dfd0]/5'
                              : isSoldOut || !tier.is_available
                              ? 'border-[#2a2a2d] opacity-50 cursor-not-allowed'
                              : 'border-[#2a2a2d] hover:border-[#e5dfd0]/50'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-[#faf7f1]">{tier.name}</span>
                            <span className="text-[#e5dfd0] text-lg font-bold">${Number(tier.price).toFixed(2)}</span>
                          </div>
                          {tier.description && (
                            <p className="text-sm text-[#8b8580]">{tier.description}</p>
                          )}
                          {tier.quantity > 0 && (
                            <p className="text-xs text-[#8b8580] mt-1">
                              {isSoldOut ? 'Sold out' : `${available} remaining`}
                            </p>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[#8b8580]">Free entry</p>
                )}

                {/* Purchase Form */}
                {selectedTier && (
                  <div className="space-y-4 pt-4 border-t border-[#2a2a2d]">
                    {/* Quantity */}
                    <div>
                      <label className="text-sm font-medium block mb-1.5 text-[#faf7f1]">Quantity</label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#2a2a2d] bg-transparent text-[#faf7f1] hover:bg-[#e5dfd0]/5 hover:text-[#e5dfd0]"
                          onClick={() => {
                            const newQty = Math.max(1, checkout.quantity - 1)
                            setCheckout(prev => ({
                              ...prev,
                              quantity: newQty,
                              attendees: prev.attendees.slice(0, newQty),
                            }))
                          }}
                          disabled={checkout.quantity <= 1}
                        >-</Button>
                        <span className="w-8 text-center font-medium text-[#faf7f1]">{checkout.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#2a2a2d] bg-transparent text-[#faf7f1] hover:bg-[#e5dfd0]/5 hover:text-[#e5dfd0]"
                          onClick={() => {
                            const max = selectedTier.max_per_order || 10
                            const newQty = Math.min(max, checkout.quantity + 1)
                            setCheckout(prev => ({
                              ...prev,
                              quantity: newQty,
                              attendees: [
                                ...prev.attendees,
                                ...Array.from({ length: newQty - prev.attendees.length }, () => ({
                                  name: '', email: '', accommodations: '', dietary: '',
                                })),
                              ],
                            }))
                          }}
                          disabled={checkout.quantity >= (selectedTier.max_per_order || 10)}
                        >+</Button>
                      </div>
                    </div>

                    {/* ── Buyer Info ── */}
                    <div className="pt-4 border-t border-[#2a2a2d]">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b8580] mb-3">Your Contact Info</h3>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium block mb-1 text-[#faf7f1]">Full Name *</label>
                          <Input placeholder="Full name" value={checkout.buyerName}
                            className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                            onChange={e => setCheckout(prev => ({ ...prev, buyerName: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1 text-[#faf7f1]">Email *</label>
                          <Input type="email" placeholder="your@email.com" value={checkout.buyerEmail}
                            className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                            onChange={e => setCheckout(prev => ({ ...prev, buyerEmail: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1 text-[#faf7f1]">Phone</label>
                          <Input type="tel" placeholder="(555) 123-4567" value={checkout.buyerPhone}
                            className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                            onChange={e => setCheckout(prev => ({ ...prev, buyerPhone: e.target.value }))} />
                        </div>
                      </div>
                    </div>

                    {/* ── Billing Address ── */}
                    <div className="pt-4 border-t border-[#2a2a2d]">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b8580] mb-3">Billing Address</h3>
                      <div className="space-y-3">
                        <Input placeholder="Street address" value={checkout.buyerAddress.street}
                          className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                          onChange={e => setCheckout(prev => ({ ...prev, buyerAddress: { ...prev.buyerAddress, street: e.target.value } }))} />
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="City" value={checkout.buyerAddress.city}
                            className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                            onChange={e => setCheckout(prev => ({ ...prev, buyerAddress: { ...prev.buyerAddress, city: e.target.value } }))} />
                          <Input placeholder="State" value={checkout.buyerAddress.state}
                            className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                            onChange={e => setCheckout(prev => ({ ...prev, buyerAddress: { ...prev.buyerAddress, state: e.target.value } }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="ZIP code" value={checkout.buyerAddress.zip}
                            className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                            onChange={e => setCheckout(prev => ({ ...prev, buyerAddress: { ...prev.buyerAddress, zip: e.target.value } }))} />
                          <Input placeholder="Country" value={checkout.buyerAddress.country}
                            className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                            onChange={e => setCheckout(prev => ({ ...prev, buyerAddress: { ...prev.buyerAddress, country: e.target.value } }))} />
                        </div>
                      </div>
                    </div>

                    {/* ── Attendees ── */}
                    {checkout.quantity > 0 && (
                      <div className="pt-4 border-t border-[#2a2a2d]">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b8580] mb-3">
                          Attendees ({checkout.quantity} {checkout.quantity === 1 ? 'ticket' : 'tickets'})
                        </h3>
                        <p className="text-xs text-[#8b8580] mb-3">
                          Enter the name for each ticket holder
                        </p>
                        {checkout.attendees.map((attendee, i) => (
                          <div key={i} className="mb-4 p-3 bg-[#0b0b0c] rounded-lg border border-[#2a2a2d]">
                            <p className="text-xs font-medium text-[#8b8580] mb-2">Ticket #{i + 1}</p>
                            <div className="space-y-2">
                              <Input placeholder={`Attendee name`}
                                value={attendee.name}
                                className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                                onChange={e => {
                                  const updated = [...checkout.attendees]
                                  updated[i] = { ...updated[i], name: e.target.value }
                                  setCheckout(prev => ({ ...prev, attendees: updated }))
                                }} />
                              <Input placeholder="Attendee email (optional)"
                                value={attendee.email}
                                className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                                onChange={e => {
                                  const updated = [...checkout.attendees]
                                  updated[i] = { ...updated[i], email: e.target.value }
                                  setCheckout(prev => ({ ...prev, attendees: updated }))
                                }} />
                              <Input placeholder="Special accommodations (wheelchair, ASL, etc.)"
                                value={attendee.accommodations}
                                className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                                onChange={e => {
                                  const updated = [...checkout.attendees]
                                  updated[i] = { ...updated[i], accommodations: e.target.value }
                                  setCheckout(prev => ({ ...prev, attendees: updated }))
                                }} />
                              <Input placeholder="Dietary restrictions"
                                value={attendee.dietary}
                                className="bg-[#141415] border-[#2a2a2d] rounded-lg text-[#faf7f1] placeholder:text-[#8b8580]"
                                onChange={e => {
                                  const updated = [...checkout.attendees]
                                  updated[i] = { ...updated[i], dietary: e.target.value }
                                  setCheckout(prev => ({ ...prev, attendees: updated }))
                                }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Additional Info ── */}
                    <div className="pt-4 border-t border-[#2a2a2d] space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-[#8b8580] mb-3">Additional</h3>
                      <div>
                        <label className="text-sm font-medium block mb-1 text-[#faf7f1]">Special Requests / Notes</label>
                        <textarea
                          placeholder="Accessibility needs, seating preferences, anything else..."
                          rows={2}
                          value={checkout.notes}
                          onChange={e => setCheckout(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full bg-[#141415] border border-[#2a2a2d] rounded-lg px-3 py-2 text-sm text-[#faf7f1] placeholder:text-[#8b8580] focus:outline-none focus:ring-1 focus:ring-[#e5dfd0]/40 resize-y"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1 text-[#faf7f1]">How did you hear about this event?</label>
                        <select
                          value={checkout.referralSource}
                          onChange={e => setCheckout(prev => ({ ...prev, referralSource: e.target.value }))}
                          className="w-full bg-[#141415] border border-[#2a2a2d] rounded-lg px-3 py-2 text-sm text-[#faf7f1] focus:outline-none focus:ring-1 focus:ring-[#e5dfd0]/40"
                        >
                          <option value="">Select...</option>
                          <option value="social_media">Social Media</option>
                          <option value="email">Email Newsletter</option>
                          <option value="friend">Friend / Word of Mouth</option>
                          <option value="website">artistrax Website</option>
                          <option value="search">Search Engine</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-[#faf7f1] cursor-pointer">
                        <input type="checkbox"
                          checked={checkout.emailOptIn}
                          onChange={e => setCheckout(prev => ({ ...prev, emailOptIn: e.target.checked }))}
                          className="rounded border-[#2a2a2d] bg-[#141415] text-[#155dfc]" />
                        Send me event updates and artist news
                      </label>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-4 border-t border-[#2a2a2d]">
                      <span className="font-medium text-[#faf7f1]">Total</span>
                      <span className="text-[#e5dfd0] text-2xl font-bold">${total}</span>
                    </div>

                    {/* Error */}
                    {checkout.error && (
                      <p className="text-[#dc2626] text-sm">{checkout.error}</p>
                    )}

                    {/* Buy Button */}
                    <Button
                      className="w-full bg-[#155dfc] text-white rounded-full px-5 py-2 hover:bg-[#155dfc]/90"
                      size="lg"
                      onClick={handlePurchase}
                      disabled={checkout.loading}
                    >
                      {checkout.loading ? 'Processing...' : 'Get Tickets'}
                    </Button>

                    <p className="text-xs text-center text-[#8b8580]">
                      Secure checkout powered by Stripe · 95% goes to the artist
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
