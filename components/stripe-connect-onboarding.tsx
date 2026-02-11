'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react'

interface StripeAccountStatus {
  hasAccount: boolean
  accountId?: string
  onboardingComplete: boolean
  chargesEnabled: boolean
  payoutsEnabled: boolean
  requirements?: any
  email?: string
}

interface StripeConnectOnboardingProps {
  accountType?: 'artist' | 'label'
}

export default function StripeConnectOnboarding({ accountType = 'artist' }: StripeConnectOnboardingProps) {
  const [status, setStatus] = useState<StripeAccountStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkStatus()
  }, [])

  const getApiPath = (endpoint: string) => {
    return accountType === 'label' 
      ? `/api/stripe/connect/label/${endpoint}`
      : `/api/stripe/connect/${endpoint}`
  }

  const checkStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(getApiPath('account-status'))
      
      if (!response.ok) {
        throw new Error('Failed to check account status')
      }

      const data = await response.json()
      setStatus(data)
    } catch (err: any) {
      console.error('Error checking status:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createAccount = async () => {
    try {
      setCreating(true)
      setError('')

      const response = await fetch(getApiPath('create-account'), {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create account')
      }

      const data = await response.json()
      
      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl

    } catch (err: any) {
      console.error('Error creating account:', err)
      setError(err.message)
      setCreating(false)
    }
  }

  const continueOnboarding = async () => {
    try {
      setCreating(true)
      setError('')

      const response = await fetch(getApiPath('create-link'), {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to create onboarding link')
      }

      const data = await response.json()
      
      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl

    } catch (err: any) {
      console.error('Error creating link:', err)
      setError(err.message)
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-800"></div>
          <p className="text-gray-600">Checking payment status...</p>
        </div>
      </div>
    )
  }

  // No account yet - show create button
  if (!status?.hasAccount) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-orange-50 rounded-lg shadow-md p-6 border-2 border-green-200">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Connect Your Stripe Account
            </h3>
            <p className="text-gray-600 mb-4">
              To receive payments and get paid instantly, you need to connect a Stripe account.
              This takes 2-3 minutes.
            </p>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">What you'll need:</p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Bank account information</li>
                <li>• Tax ID (SSN or EIN)</li>
                <li>• Date of birth</li>
                <li>• Contact information</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                <strong>You keep 95% of every sale.</strong> Instant payouts. No hidden fees.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <Button
              onClick={createAccount}
              disabled={creating}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold px-6 py-3 flex items-center gap-2"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Setting up...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Connect Stripe Account
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Account exists but onboarding incomplete
  if (!status.onboardingComplete) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg shadow-md p-6 border-2 border-yellow-300">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Complete Your Stripe Onboarding
            </h3>
            <p className="text-gray-600 mb-4">
              You started setting up your Stripe account, but it's not complete yet.
              Finish onboarding to start receiving payments.
            </p>

            {status.requirements && status.requirements.currently_due?.length > 0 && (
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="font-semibold text-gray-800 mb-2">Still needed:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  {status.requirements.currently_due.map((req: string) => (
                    <li key={req}>• {req.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <Button
              onClick={continueOnboarding}
              disabled={creating}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-3 flex items-center gap-2"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Continue Onboarding
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Account fully set up!
  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6 border-2 border-green-300">
      <div className="flex items-start gap-4">
        <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0 mt-1" />
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            ✅ Payment Setup Complete
          </h3>
          <p className="text-gray-600 mb-4">
            Your Stripe account is fully connected. You're ready to receive payments!
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                {status.chargesEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold text-gray-800">Accept Payments</span>
              </div>
              <p className="text-sm text-gray-600">
                {status.chargesEnabled ? 'Enabled' : 'Not enabled'}
              </p>
            </div>

            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                {status.payoutsEnabled ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold text-gray-800">Receive Payouts</span>
              </div>
              <p className="text-sm text-gray-600">
                {status.payoutsEnabled ? 'Enabled' : 'Not enabled'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Account Email:</strong> {status.email}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>Account ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{status.accountId}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
