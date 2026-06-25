'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'
import { Loader2, CalendarCheck } from 'lucide-react'

export default function PromoterSignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // Create promoter profile
      if (authData.user) {
        const { error: profileError } = await supabase.from('promoters').insert({
          id: authData.user.id,
          email,
          display_name: displayName,
        })

        if (profileError) throw profileError

        // Send welcome email (non-blocking)
        fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountType: 'promoter',
            name: displayName,
            email: email,
          }),
        }).catch(err => console.error('Failed to send welcome email:', err))

        router.push('/promoter/dashboard')
      }
    } catch (err: any) {
      console.error('Promoter signup error:', err)
      setError(err.message || 'Failed to create account')
      setLoading(false)
    }
  }

  return (
    <CartProvider>
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <CalendarCheck className="w-10 h-10 mx-auto text-primary mb-3" />
            <h1 className="text-4xl font-serif font-semibold mb-2">Join as Promoter</h1>
            <p className="text-muted-foreground">
              Create events, sell tickets, keep 95% of revenue
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
                <Label htmlFor="displayName">Promoter / Business Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Promotions Co."
                  required
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is how attendees will see you
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
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Promoter Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/promoter/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <h2 className="font-semibold mb-3">What you get:</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Create events with ticket tiers</li>
              <li>✅ Keep 95% of ticket revenue</li>
              <li>✅ Only 5% platform fee added on top</li>
              <li>✅ Stripe Connect direct payouts</li>
              <li>✅ Promote shows for any artist</li>
              <li>✅ No monthly fees</li>
            </ul>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Are you an artist or label?</p>
            <div className="flex gap-3 justify-center mt-2">
              <Link href="/artist/signup" className="text-primary hover:underline">Artist Signup</Link>
              <span>•</span>
              <Link href="/label/signup" className="text-primary hover:underline">Label Signup</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </CartProvider>
  )
}