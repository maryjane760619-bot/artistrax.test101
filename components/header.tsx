'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingCart, Menu, LayoutDashboard, LogIn, ChevronDown, Heart, Music, Building2 } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/artists', label: 'Artists' },
  { href: '/releases', label: 'Releases' },
  { href: '/bundles', label: 'Bundles' },
]

export function Header() {
  const { totalItems } = useCart()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          <div className="flex items-center gap-4">
            {/* Login Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/fan/login" className="flex items-center gap-2 cursor-pointer">
                    <Heart className="w-4 h-4" />
                    Fan Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/artist/login" className="flex items-center gap-2 cursor-pointer">
                    <Music className="w-4 h-4" />
                    Artist Login
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/label/login" className="flex items-center gap-2 cursor-pointer">
                    <Building2 className="w-4 h-4" />
                    Label Login
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user && (
              <Link href="/artist/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
            )}
            <Link href="/cart" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Link>

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
