import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-serif font-semibold tracking-tight">
                artistrax
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Premium digital music downloads. Direct from the artists you love.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Browse</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/releases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  All Releases
                </Link>
              </li>
              <li>
                <Link href="/artists" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Artists
                </Link>
              </li>
              <li>
                <Link href="/bundles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Bundles
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Download Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Get notified about new releases and exclusive offers.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <button
                type="submit"
                className="bg-foreground text-background px-4 py-2 rounded-md text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} artistrax. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Founded by <span className="font-semibold text-foreground">Bertin Porcayo</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
