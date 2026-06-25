'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Loader2, CalendarCheck, Plus, Calendar, MapPin, TrendingUp, DollarSign, Users, AlertCircle, ArrowUpRight } from 'lucide-react'

export default function PromoterDashboardPage() {
  const router = useRouter()
  const [promoter, setPromoter] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/promoter/login')
      return
    }

    // Load promoter profile
    const { data: promoterData } = await supabase
      .from('promoters')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (!promoterData) {
      setError('Promoter profile not found')
      setLoading(false)
      return
    }

    setPromoter(promoterData)

    // Load their events
    const { data: eventData } = await supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('promoter_id', session.user.id)
      .order('event_date', { ascending: false })

    setEvents(eventData || [])
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

  const totalTicketsSold = events.reduce((sum, e) => {
    return sum + (e.ticket_tiers || []).reduce((ts: number, t: any) => ts + (t.quantity_sold || 0), 0)
  }, 0)

  const totalRevenue = events.reduce((sum, e) => {
    return sum + (e.ticket_tiers || []).reduce((tr: number, t: any) => tr + (t.quantity_sold || 0) * Number(t.price), 0)
  }, 0)

  const upcomingEvents = events.filter(e => e.event_date >= new Date().toISOString().split('T')[0] && e.status !== 'cancelled').length

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive/40 mb-4" />
            <h2 className="text-2xl font-serif font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/promoter/signup')}>Create Promoter Account</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pt-24 md:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Promoter Dashboard
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
                {promoter.display_name || 'My Dashboard'}
              </h1>
            </div>
            <Link href="/events/create">
              <Button className="h-auto rounded-sm bg-primary px-4 py-2 text-sm font-medium">
                <Plus className="w-4 h-4 mr-1.5" />
                Create Event
              </Button>
            </Link>
          </div>

          {/* Stripe Warning */}
          {!promoter.stripe_charges_enabled && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-500">Stripe onboarding required</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete your Stripe Connect setup to sell tickets for events.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                onClick={() => router.push('/promoter/billing')}
              >
                Set Up Payouts
                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4">
              <Calendar className="w-5 h-5 text-primary mb-2" />
              <p className="text-2xl font-semibold">{events.length}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <Calendar className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-2xl font-semibold">{upcomingEvents}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <Users className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-2xl font-semibold">{totalTicketsSold}</p>
              <p className="text-xs text-muted-foreground">Tickets Sold</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <DollarSign className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-2xl font-semibold">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Gross Revenue</p>
            </div>
          </div>

          {/* Events List */}
          <div className="bg-card border border-border rounded-xl">
            <div className="p-4 sm:p-6 border-b border-border">
              <h2 className="font-display text-lg font-semibold">Your Events</h2>
            </div>
            {events.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                <h3 className="font-display text-lg font-semibold mb-1">No events yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first event to start selling tickets</p>
                <Link href="/events/create">
                  <Button size="sm" className="rounded-sm">
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create Event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {events.map(event => (
                  <Link
                    key={event.id}
                    href={`/events/${event.slug}`}
                    className="flex items-center justify-between p-4 sm:p-6 hover:bg-muted/30 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{event.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(event.event_date)}
                        </span>
                        {event.venue_name && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            {event.venue_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-medium text-foreground">
                        {event.ticket_tiers?.length || 0} tier{(event.ticket_tiers?.length || 0) !== 1 ? 's' : ''}
                      </p>
                      <p className={`text-xs mt-0.5 ${
                        event.status === 'published' ? 'text-green-500' :
                        event.status === 'draft' ? 'text-amber-500' :
                        event.status === 'cancelled' ? 'text-red-500' : 'text-muted-foreground'
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}