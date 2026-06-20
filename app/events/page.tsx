'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Music, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type EventTier = {
  id: string
  name: string
  description: string | null
  price: number
  quantity: number
  quantity_sold: number
  is_available: boolean
}

type EventItem = {
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
  status: string
  ticket_tiers: EventTier[]
  artists: { id: string; display_name: string; avatar_url: string | null; username: string } | null
  labels: { id: string; name: string; logo_url: string | null; slug: string } | null
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    loadEvents()
  }, [filter])

  const loadEvents = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]

    let query = supabase
      .from('events')
      .select(`
        *,
        artists:artist_id (id, display_name, avatar_url, username),
        labels:label_id (id, name, logo_url, slug),
        ticket_tiers (*)
      `)
      .eq('status', 'published')
      .order('event_date', { ascending: true })

    if (filter === 'upcoming') {
      query = query.gte('event_date', today)
    } else if (filter === 'past') {
      query = query.lt('event_date', today)
    }

    const { data, error } = await query
    if (!error && data) {
      setEvents(data as EventItem[])
    }
    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatPrice = (tiers: EventTier[]) => {
    if (!tiers || tiers.length === 0) return ''
    const prices = tiers.filter(t => t.is_available).map(t => Number(t.price))
    if (prices.length === 0) return ''
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    if (min === max) return `$${min.toFixed(2)}`
    return `$${min.toFixed(2)} – $${max.toFixed(2)}`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 md:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-serif font-bold">Events</h1>
              <p className="text-muted-foreground mt-1">
                Live shows, virtual performances, and community gatherings
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant={filter === 'upcoming' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'past' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('past')}
              >
                Past
              </Button>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-6">
                {filter === 'upcoming' ? 'No upcoming events scheduled.' : 'No events found.'}
              </p>
              <Link href="/events/create">
                <Button>Create an Event</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group block bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg"
                >
                  {/* Cover Image */}
                  <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                    {event.cover_url ? (
                      <img
                        src={event.cover_url}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                        <Calendar className="w-12 h-12 text-muted-foreground/40" />
                      </div>
                    )}
                    {event.is_virtual && (
                      <span className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                        Virtual
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-serif font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-1.5 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>{formatDate(event.event_date)}</span>
                        {event.start_time && (
                          <span>· {event.start_time.slice(0, 5)}</span>
                        )}
                      </div>
                      {event.venue_name && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>{event.venue_name}</span>
                        </div>
                      )}
                    </div>

                    {/* Creator */}
                    <div className="flex items-center gap-2 text-sm">
                      {event.artists ? (
                        <>
                          <Music className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{event.artists.display_name}</span>
                        </>
                      ) : event.labels ? (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">{event.labels.name}</span>
                        </>
                      ) : null}
                    </div>

                    {/* Price */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <span className="text-lg font-semibold">{formatPrice(event.ticket_tiers)}</span>
                      {event.ticket_tiers?.length > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">/ ticket</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
