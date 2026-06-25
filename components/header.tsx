'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, ArrowUpRight, Search, User, Heart, Music, Building2, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { CartButton } from '@/components/cart-button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/artists', label: 'Artists' },
  { href: '/releases', label: 'Releases' },
  { href: '/labels', label: 'Labels' },
  { href: '/live', label: 'Live' },
  { href: '/about', label: 'About' },
]

const TICKER_ITEMS = [
  'New: 24-bit lossless downloads on every release',
  'Independent artists keep 95% of every sale',
  'Own your music — forever, DRM-free',
  'New releases added daily — never miss a drop',
  'Direct-to-fan. No middlemen.',
]

export function Header() {
  const { user: artistUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [fanUser, setFanUser] = useState<any>(null)
  const [isLabel, setIsLabel] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Check for fan auth and label membership
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setFanUser(user)
      if (user) {
        supabase.from('labels').select('id').eq('id', user.id).maybeSingle()
          .then(({ data }) => {
            if (data) setIsLabel(true)
          })
      }
    })
  }, [artistUser])

  const user = artistUser || fanUser
  const isFan = !!fanUser && !artistUser
  const dashboardHref = isFan ? '/fan/dashboard' : isLabel ? '/label/dashboard' : '/artist/dashboard'

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const doubledTicker = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <>
      {/* Announcement ticker */}
      <div className="bg-primary text-primary-foreground overflow-hidden border-b border-primary">
        <div className="flex whitespace-nowrap animate-marquee py-2.5">
          {doubledTicker.map((item, i) => (
            <span
              key={i}
              className="px-6 text-xs uppercase tracking-[0.18em] inline-flex items-center gap-3"
            >
              <span className="h-1 w-1 rounded-full bg-accent" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Header bar */}
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-border'
            : 'bg-background border-b border-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="artistrax home">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-sm bg-primary">
              <span className="font-display text-base font-bold leading-none text-primary-foreground">a</span>
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">artistrax</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition rounded-sm relative',
                  isActive(link.href)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-accent" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>

            <CartButton />

            {user ? (
              <Link
                href={dashboardHref}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                <User className="h-4 w-4" />
                {isFan ? 'Fan' : isLabel ? 'Label' : 'Artist'}
              </Link>
            ) : (
              <Link
                href="/fan/login"
                className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                Login
              </Link>
            )}

            <Link
              href="/artist/login"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent/90"
            >
              Submit Music
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSubmit={(q) => {
          router.push(`/search?q=${encodeURIComponent(q)}`)
          setSearchOpen(false)
        }}
      />

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        navLinks={navLinks}
        isActive={isActive}
        user={user}
        dashboardHref={dashboardHref}
      />
    </>
  )
}

/* ============================ SEARCH OVERLAY ============================ */
function SearchOverlay({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (q: string) => void
}) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  if (!open) return null

  const submit = (q: string) => {
    if (q.trim()) onSubmit(q.trim())
  }

  return (
    <div className="animate-fade-up fixed inset-0 z-50 bg-background/95 backdrop-blur-md">
      <div className="mx-auto max-w-3xl px-6 pt-24">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit(query)
          }}
          className="flex items-center gap-3 border-b border-border pb-4"
        >
          <Search className="h-6 w-6 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artists, labels, releases, genres..."
            className="flex-1 bg-transparent font-display text-2xl sm:text-3xl font-medium outline-none placeholder:text-muted-foreground/60"
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Popular searches
          </div>
          <div className="flex flex-wrap gap-2">
            {['Electronic', 'Ambient', 'Indie Rock', 'R&B', 'Jazz', 'Techno', 'House'].map((term) => (
              <button
                key={term}
                onClick={() => submit(term)}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-sm transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================ MOBILE NAV ============================ */
function MobileNav({
  open,
  onClose,
  navLinks,
  isActive,
  user,
  dashboardHref,
}: {
  open: boolean
  onClose: () => void
  navLinks: { href: string; label: string }[]
  isActive: (href: string) => boolean
  user: any
  dashboardHref: string
}) {
  if (!open) return null

  return (
    <div className="animate-fade-up fixed inset-0 z-50 bg-background md:hidden">
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        <span className="font-display text-xl font-semibold">artistrax</span>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="px-6 py-8 space-y-1">
        {user && (
          <Link
            href={dashboardHref}
            onClick={onClose}
            className="flex w-full items-center justify-between font-display text-3xl font-semibold py-3 border-b border-border text-foreground"
          >
            Dashboard
            <LayoutDashboard className="h-6 w-6" />
          </Link>
        )}
        {navLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex w-full items-center justify-between font-display text-3xl font-semibold py-3 border-b border-border',
              isActive(item.href) ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {item.label}
            {isActive(item.href) && <span className="h-2 w-2 rounded-full bg-accent" />}
          </Link>
        ))}

        {!user && (
          <div className="pt-8 space-y-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Login</div>
            <Link href="/fan/login" onClick={onClose} className="flex items-center gap-3 text-lg text-foreground">
              <Heart className="h-5 w-5" /> Fan Login
            </Link>
            <Link href="/artist/login" onClick={onClose} className="flex items-center gap-3 text-lg text-foreground">
              <Music className="h-5 w-5" /> Artist Login
            </Link>
            <Link href="/label/login" onClick={onClose} className="flex items-center gap-3 text-lg text-foreground">
              <Building2 className="h-5 w-5" /> Label Login
            </Link>
          </div>
        )}

        <div className="pt-8">
          <Link
            href="/artist/login"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
          >
            Submit Music
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </nav>
    </div>
  )
}
