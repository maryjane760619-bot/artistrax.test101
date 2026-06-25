'use client'

import Link from 'next/link'

const BROWSE = [
  { l: 'All Releases', href: '/releases' },
  { l: 'Artists', href: '/artists' },
  { l: 'Labels', href: '/labels' },
  { l: 'Bundles', href: '/bundles' },
  { l: 'Events', href: '/events' },
  { l: 'Live', href: '/live' },
]

const FOR_ARTISTS = [
  { l: 'Submit Music', href: '/artist/login' },
  { l: 'Artist Dashboard', href: '/artist/dashboard' },
  { l: 'Mastering', href: '/mastering' },
  { l: 'Pricing & Royalties', href: '/about' },
]

const SUPPORT = [
  { l: 'FAQ', href: '/faq' },
  { l: 'Download Help', href: '/downloads' },
  { l: 'Contact', href: '/contact' },
  { l: 'Terms of Service', href: '/terms' },
  { l: 'Privacy Policy', href: '/privacy' },
]

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-5">
            <Link href="/" className="flex items-center gap-2">
              <span className="relative flex h-7 w-7 items-center justify-center rounded-sm bg-primary-foreground">
                <span className="font-display text-base font-bold leading-none text-primary">a</span>
                <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="font-display text-xl font-semibold tracking-tight">artistrax</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-primary-foreground/70 leading-relaxed">
              A direct-to-fan music platform where independent artists own their masters, set their
              prices, and keep 95% of every sale.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-6 flex max-w-sm gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-sm border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-2 text-sm text-primary-foreground outline-none placeholder:text-primary-foreground/40 focus:border-accent"
              />
              <button
                type="submit"
                className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:bg-accent/90"
              >
                Join
              </button>
            </form>
            <p className="mt-2 text-xs text-primary-foreground/50">
              Monthly dispatch — new releases, artist spotlights, no spam.
            </p>
          </div>

          <div className="md:col-span-2 md:col-start-7">
            <h4 className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">Browse</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {BROWSE.map((item) => (
                <li key={item.l}>
                  <Link href={item.href} className="link-underline text-primary-foreground/80 hover:text-primary-foreground">
                    {item.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">For Artists</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {FOR_ARTISTS.map((item) => (
                <li key={item.l}>
                  <Link href={item.href} className="link-underline text-primary-foreground/80 hover:text-primary-foreground">
                    {item.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.2em] text-primary-foreground/60">Support</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SUPPORT.map((item) => (
                <li key={item.l}>
                  <Link href={item.href} className="link-underline text-primary-foreground/80 hover:text-primary-foreground">
                    {item.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} artistrax. Where an artist can be an artist. Founded by{' '}
            <span className="text-primary-foreground">Bertin Porcayo</span>.
          </div>
          <div className="flex items-center gap-5 text-xs text-primary-foreground/60">
            <span>English</span>
            <span>USD</span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
