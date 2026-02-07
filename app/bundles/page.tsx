'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'
import { bundles, getReleaseById } from '@/lib/data'

export default function BundlesPage() {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-20 md:pt-24">
          <section className="py-12 md:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-12">
                <h1 className="font-serif text-4xl md:text-5xl mb-4">Bundles</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Save more with our curated collections. Hand-picked selections from our catalog at special prices.
                </p>
              </div>

              <div className="space-y-8">
                {bundles.map(bundle => {
                  const bundleReleases = bundle.releases
                    .map(id => getReleaseById(id))
                    .filter(Boolean)

                  return (
                    <Link
                      key={bundle.id}
                      href={`/bundles/${bundle.slug}`}
                      className="group block border border-border rounded-xl p-6 md:p-8 hover:border-muted-foreground/50 transition-all bg-card"
                    >
                      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* Bundle Image */}
                        <div className="w-full lg:w-48 h-48 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <div className="w-full h-full bg-gradient-to-br from-muted-foreground/30 to-muted" />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                            <div>
                              <h2 className="font-serif text-2xl md:text-3xl group-hover:text-muted-foreground transition-colors">
                                {bundle.title}
                              </h2>
                              <p className="text-muted-foreground mt-2">{bundle.description}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className="text-2xl font-medium">${bundle.discountedPrice.toFixed(2)}</span>
                              <span className="text-lg text-muted-foreground line-through">${bundle.originalPrice.toFixed(2)}</span>
                              <span className="text-sm bg-accent text-accent-foreground px-3 py-1 rounded-full">
                                Save ${(bundle.originalPrice - bundle.discountedPrice).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Included Releases */}
                          <div className="mt-6">
                            <h3 className="text-sm font-medium uppercase tracking-wider mb-3 text-muted-foreground">
                              Includes {bundleReleases.length} releases
                            </h3>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                              {bundleReleases.map(release => release && (
                                <div key={release.id} className="flex-shrink-0 w-20">
                                  <div className="w-20 h-20 rounded bg-muted overflow-hidden">
                                    <div className="w-full h-full bg-gradient-to-br from-muted-foreground/20 to-muted" />
                                  </div>
                                  <p className="text-xs truncate mt-1">{release.title}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </CartProvider>
  )
}
