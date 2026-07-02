'use client'

import React, { useEffect, useState } from "react"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  LayoutDashboard, 
  Disc3, 
  Users, 
  Package, 
  ShoppingCart,
  Settings,
  Music,
  LogOut,
  Loader2
} from 'lucide-react'

function LeafLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <circle cx="50" cy="50" r="4" />
      <ellipse cx="50" cy="25" rx="6" ry="20" />
      <ellipse cx="50" cy="75" rx="6" ry="20" />
      <ellipse cx="25" cy="50" rx="20" ry="6" />
      <ellipse cx="75" cy="50" rx="20" ry="6" />
      <ellipse cx="32" cy="32" rx="6" ry="18" transform="rotate(-45 32 32)" />
      <ellipse cx="68" cy="32" rx="6" ry="18" transform="rotate(45 68 32)" />
      <ellipse cx="32" cy="68" rx="6" ry="18" transform="rotate(45 32 68)" />
      <ellipse cx="68" cy="68" rx="6" ry="18" transform="rotate(-45 68 68)" />
    </svg>
  )
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/releases', label: 'Releases', icon: Disc3 },
  { href: '/admin/artists', label: 'Artists', icon: Users },
  { href: '/admin/bundles', label: 'Bundles', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/fan/login')
      } else {
        setChecking(false)
      }
    })
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <LeafLogo className="w-8 h-8 text-foreground" />
            <div>
              <span className="font-serif text-lg">siesta life</span>
              <span className="text-xs text-muted-foreground block">Admin</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map(item => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? 'bg-secondary text-foreground' 
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Music className="w-4 h-4" />
            View Store
          </Link>
          <button
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden border-b border-border bg-card p-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <LeafLogo className="w-6 h-6 text-foreground" />
            <span className="font-serif">Admin</span>
          </Link>
        </header>

        {/* Mobile nav */}
        <nav className="lg:hidden border-b border-border bg-card overflow-x-auto">
          <div className="flex p-2 gap-1">
            {navItems.map(item => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors ${
                    isActive 
                      ? 'bg-secondary text-foreground' 
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
