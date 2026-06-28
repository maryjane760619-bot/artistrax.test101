import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BundleBuyButton } from '@/components/bundle-buy-button'
import { ArrowLeft, Music, Package } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function BundleDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = createClient()

  const { data: bundle, error } = await supabase
    .from('bundles')
    .select(`
      id, title, slug, description, cover_url, discount_percent,
      artists (display_name, username),
      labels (name, slug),
      bundle_tracks (
        tracks (id, title, price, cover_url, duration)
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !bundle) {
    notFound()
  }

  const tracks = (bundle.bundle_tracks || []).map((bt: any) => bt.tracks).filter(Boolean)
  const fullPrice = tracks.reduce((sum: number, t: any) => sum + Number(t.price), 0)
  const discountedPrice = fullPrice * (1 - bundle.discount_percent / 100)
  const sellerName = (bundle.artists as any)?.display_name || (bundle.labels as any)?.name || 'Unknown'
  const sellerHref = bundle.artists
    ? `/${(bundle.artists as any).username}`
    : bundle.labels
    ? `/labels/${(bundle.labels as any).slug}`
    : undefined

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pb-16">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
          <Link href="/bundles" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            All Bundles
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square rounded-sm overflow-hidden border border-border bg-muted">
              {bundle.cover_url ? (
                <img src={bundle.cover_url} alt={bundle.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="w-20 h-20 text-muted-foreground/40" />
                </div>
              )}
            </div>

            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-accent">
                Bundle · {tracks.length} Tracks
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mt-2">
                {bundle.title}
              </h1>
              {sellerHref ? (
                <Link href={sellerHref} className="text-sm text-muted-foreground hover:text-accent hover:underline">
                  by {sellerName}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">by {sellerName}</p>
              )}
              {bundle.description && (
                <p className="text-muted-foreground mt-4 leading-relaxed">{bundle.description}</p>
              )}

              <div className="mt-6 flex items-center gap-3 rounded-sm border border-border bg-card p-4">
                <span className="font-mono text-2xl font-semibold">${discountedPrice.toFixed(2)}</span>
                <span className="font-mono text-base text-muted-foreground line-through">${fullPrice.toFixed(2)}</span>
                <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent-foreground">
                  Save ${(fullPrice - discountedPrice).toFixed(2)}
                </span>
              </div>

              <BundleBuyButton bundleId={bundle.id} />

              <div className="mt-8">
                <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
                  Included Tracks
                </h3>
                <div className="space-y-1">
                  {tracks.map((track: any) => (
                    <div key={track.id} className="flex items-center gap-3 py-2.5 border-b border-border">
                      <div className="w-10 h-10 rounded-sm overflow-hidden bg-muted shrink-0">
                        {track.cover_url ? (
                          <img src={track.cover_url} alt={track.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Music className="w-4 h-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <span className="flex-1 text-sm font-medium truncate">{track.title}</span>
                      <span className="font-mono text-xs text-muted-foreground">${Number(track.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
