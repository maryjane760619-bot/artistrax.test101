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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 pt-24 md:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                Live calendar
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                Events
              </h1>
              <p className="text-muted-foreground mt-2">
                Live shows, virtual performances, and community gatherings
              </p>
            </div>
            <div className="inline-flex flex-wrap gap-2 mt-6">
              <Button
                variant="ghost"
                size="sm"
                className={filter === 'upcoming' ? 'h-auto rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : 'h-auto rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-foreground hover:border-foreground/40 hover:bg-background hover:text-foreground'}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={filter === 'all' ? 'h-auto rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : 'h-auto rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-foreground hover:border-foreground/40 hover:bg-background hover:text-foreground'}
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={filter === 'past' ? 'h-auto rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : 'h-auto rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-foreground hover:border-foreground/40 hover:bg-background hover:text-foreground'}
                onClick={() => setFilter('past')}
              >
                Past
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 text-muted-foreground">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-display text-2xl font-semibold mb-2 text-foreground">
                No events yet
              </h3>
              <p className="text-muted-foreground mb-6">
                {filter === 'upcoming' ? 'No upcoming events scheduled.' : 'No events found.'}
              </p>
              <Link href="/events/create">
                <Button className="h-auto rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/90">
                  Create an Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {events.map(event => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group block bg-card border border-border rounded-sm overflow-hidden transition hover:border-foreground/30"
                >
                  <div className="aspect-[16/9] bg-muted relative overflow-hidden">
                    {event.cover_url ? (
                      <img
                        src={event.cover_url}
                        alt={event.title}
                        className="img-zoom h-full w-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        <Calendar className="w-12 h-12 text-muted-foreground/40" />
                      </div>
                    )}
                    {event.is_virtual && (
                      <span className="absolute top-3 left-3 bg-background/95 backdrop-blur-md rounded-sm px-2 py-1 text-[10px] uppercase tracking-[0.18em]">
                        Virtual
                      </span>
                    )}
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        <span>{formatDate(event.event_date)}</span>
                        {event.start_time && (
                          <span>· {event.start_time.slice(0, 5)}</span>
                        )}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-semibold mt-1 mb-1 text-foreground">
                      {event.title}
                    </h3>

                    {event.venue_name && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{event.venue_name}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      {event.artists ? (
                        <>
                          <Music className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{event.artists.display_name}</span>
                        </>
                      ) : event.labels ? (
                        <>
                          <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{event.labels.name}</span>
                        </>
                      ) : null}
                    </div>

                    <div className="border-t border-border mt-3 pt-3">
                      <span className="text-foreground font-semibold">{formatPrice(event.ticket_tiers)}</span>
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
