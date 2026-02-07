'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LabelAuthProvider, useLabelAuth } from '@/lib/label-auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartProvider } from '@/lib/cart-context'

function SignupForm() {
  const router = useRouter()
  const { signUp } = useLabelAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (slug.length < 3) {
      setError('Label slug must be at least 3 characters')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error: signUpError } = await signUp(email, password, name, slug)

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      router.push('/label/dashboard')
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 bg-background">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-semibold mb-2">Create Label Account</h1>
            <p className="text-muted-foreground">
              Launch your label on artistrax
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
                <Label htmlFor="name">Label Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Siesta Records"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="slug">Label Slug</Label>
                <Input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="siesta-records"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your page: artistrax.com/labels/<strong>{slug || 'your-label'}</strong>
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="label@example.com"
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
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Label Account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/label/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Are you an artist? </span>
              <Link href="/artist/signup" className="text-primary hover:underline">
                Create artist account
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-card border border-border rounded-lg p-6">
            <h2 className="font-semibold mb-3">Label Features:</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Your own label page</li>
              <li>✅ Upload catalog for your artists</li>
              <li>✅ Manage releases & pricing</li>
              <li>✅ Track sales & downloads</li>
              <li>✅ Build your roster</li>
              <li>✅ Payments via Stripe</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function LabelSignupPage() {
  return (
    <LabelAuthProvider>
      <CartProvider>
        <SignupForm />
      </CartProvider>
    </LabelAuthProvider>
  )
}
