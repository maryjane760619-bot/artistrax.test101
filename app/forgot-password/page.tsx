'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
    } else {
      setSent(true)
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
            <Mail className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Reset your password</h2>
          </div>
          <p className="text-muted-foreground">
            Enter the email on your account and we'll send you a reset link
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-foreground">
                If an account exists for <span className="font-medium">{email}</span>, a password
                reset link is on its way.
              </p>
              <p className="text-sm text-muted-foreground">
                Check your spam folder if it doesn't show up in a couple of minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
