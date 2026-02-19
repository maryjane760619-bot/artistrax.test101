'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Menu, LayoutDashboard, LogIn, Heart, Music, Building2, Search, X } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CartButton } from '@/components/cart-button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/artists', label: 'Artists' },
  { href: '/labels/siestarecords', label: 'Labels' },
  { href: '/about', label: 'About' },
]

export function Header() {
  const { user } = useAuth()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-serif font-semibold tracking-tight">
              artistrax
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-40 sm:w-56 h-8 text-sm"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => { setSearchOpen(false); setSearchQuery('') }}>
                  <X className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                <Search className="w-4 h-4" />
              </Button>
            )}

            {/* Cart Button */}
            <CartButton />
            
            {/* Login Button - Opens to Fan Login (most common) */}
            <Link href="/fan/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Button>
            </Link>

            {user && (
              <Link href="/artist/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80 bg-background border-border">
                <div className="flex flex-col gap-6 mt-8">
                  {user && (
                    <Link
                      href="/artist/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-2xl font-serif flex items-center gap-3"
                    >
                      <LayoutDashboard className="w-6 h-6" />
                      Dashboard
                    </Link>
                  )}
                  {navLinks.map(link => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-2xl font-serif"
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {/* Login Options in Mobile Menu */}
                  <div className="pt-6 border-t border-border">
                    <div className="text-sm text-muted-foreground mb-3">Login</div>
                    <div className="flex flex-col gap-3">
                      <Link
                        href="/fan/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-lg"
                      >
                        <Heart className="w-5 h-5" />
                        Fan Login
                      </Link>
                      <Link
                        href="/artist/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-lg"
                      >
                        <Music className="w-5 h-5" />
                        Artist Login
                      </Link>
                      <Link
                        href="/label/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-lg"
                      >
                        <Building2 className="w-5 h-5" />
                        Label Login
                      </Link>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
