import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/**
 * Shared editorial layout primitives for the public-facing redesign.
 * SectionHeader — eyebrow + serif title + optional subtitle/action.
 * MiniStat — bordered stat cell used in hero/detail stat grids.
 */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && (
          <div className="text-xs uppercase tracking-[0.2em] text-foreground/60">{eyebrow}</div>
        )}
        <h2 className="font-display mt-2 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function ViewAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition group"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </Link>
  )
}

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card px-3 py-4">
      <div className="font-display text-xl font-semibold tabular-nums leading-none">{value}</div>
      <div className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  )
}

/** Format an integer with thousands separators / k-m suffix for editorial stats. */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
