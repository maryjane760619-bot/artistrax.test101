'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'

export default function ArtistSignupPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error: signUpError } = await signUp(email, password, username, displayName)

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      // Success! Redirect to dashboard
      router.push('/artist/dashboard')
    }
  }

  return (
    <CartProvider>
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-semibold mb-2">Join artistrax</h1>
            <p className="text-muted-foreground">
              Start selling your music directly to fans
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="displayName">Artist / Band Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="DJ Mary"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is how fans will see you
                </p>
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="djmary"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your page: artistrax.com/<strong>{username || 'username'}</strong>
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  At least 6 characters
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Artist Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/artist/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <h2 className="font-semibold mb-3">What you get:</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Your own artist page</li>
              <li>✅ Upload unlimited tracks</li>
              <li>✅ Set your own prices</li>
              <li>✅ Track downloads & plays</li>
              <li>✅ Direct payouts via Stripe</li>
              <li>✅ No monthly fees — we only take a small cut when you sell</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </CartProvider>
  )
}
