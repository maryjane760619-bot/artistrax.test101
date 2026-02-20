'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Loader2, Heart } from 'lucide-react'

export default function FanSignupPage() {
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

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (authError) throw authError

      // Create fan profile
      if (authData.user) {
        const { error: profileError } = await supabase.from('fans').insert({
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
            accountType: 'fan',
            name: displayName,
            email: email,
          }),
        }).catch(err => console.error('Failed to send welcome email:', err))
        
        router.push('/fan/dashboard')
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-4xl font-serif font-semibold">artistrax</h1>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Join as a Fan</h2>
          </div>
          <p className="text-muted-foreground">
            Discover music, support artists, build your collection
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground mt-1">
                At least 6 characters
              </p>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account?</span>
            {' '}
            <Link href="/fan/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Are you an artist or label?</p>
          <div className="flex gap-3 justify-center mt-2">
            <Link href="/artist/signup" className="text-primary hover:underline">
              Artist Signup
            </Link>
            <span>•</span>
            <Link href="/label/signup" className="text-primary hover:underline">
              Label Signup
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}