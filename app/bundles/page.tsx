import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Package } from 'lucide-react'

export default async function BundlesPage() {
  const supabase = createClient()

  const { data: bundles } = await supabase
    .from('bundles')
    .select(`
      id, title, slug, description, cover_url, discount_percent,
      artists (display_name, username),
      labels (name, slug),
      bundle_tracks (
        tracks (price)
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pb-16 min-h-[70vh]">
        <section className="py-12 md:py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="mb-12 border-b border-border pb-8">
              <div className="text-xs uppercase tracking-[0.2em] text-foreground/60">Save More</div>
              <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground mt-3">
                Bundles
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-xl leading-relaxed mt-3">
                Discounted catalog packs, hand-picked by the artists and labels who made them.
              </p>
            </div>

            {!bundles || bundles.length === 0 ? (
              <div className="text-center py-24 border border-border rounded-sm max-w-md mx-auto">
                <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-foreground font-semibold mb-1">No bundles yet</p>
                <p className="text-muted-foreground text-xs">Check back soon for discounted catalog packs.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {bundles.map((bundle: any) => {
                  const trackCount = bundle.bundle_tracks?.length || 0
                  const fullPrice = (bundle.bundle_tracks || []).reduce(
                    (sum: number, bt: any) => sum + Number(bt.tracks?.price || 0),
                    0
                  )
                  const discountedPrice = fullPrice * (1 - bundle.discount_percent / 100)
                  const sellerName = bundle.artists?.display_name || bundle.labels?.name || 'Unknown'

                  return (
                    <Link
                      key={bundle.id}
                      href={`/bundles/${bundle.slug}`}
                      className="group rounded-sm border border-border bg-card overflow-hidden"
                    >
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        {bundle.cover_url ? (
                          <img src={bundle.cover_url} alt={bundle.title} className="img-zoom h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="w-16 h-16 text-muted-foreground/40" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-foreground">
                          {bundle.discount_percent}% off
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-lg font-semibold tracking-tight truncate">
                          {bundle.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{sellerName} · {trackCount} tracks</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="font-mono text-lg font-semibold">${discountedPrice.toFixed(2)}</span>
                          <span className="font-mono text-sm text-muted-foreground line-through">${fullPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
