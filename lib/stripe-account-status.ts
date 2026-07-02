import { stripe } from '@/lib/stripe'

interface AccountRow {
  stripe_account_id: string | null
  stripe_onboarding_complete?: boolean | null
  stripe_charges_enabled?: boolean | null
}

const NO_ACCOUNT_STATUS = {
  hasAccount: false,
  onboardingComplete: false,
  chargesEnabled: false,
  payoutsEnabled: false,
}

// DB values are the primary source of truth; the Stripe API enriches the
// response when reachable but must not fail the request (test/live key
// mismatches make retrieve() throw for otherwise-valid accounts).
export async function getAccountStatus(row: AccountRow) {
  if (!row.stripe_account_id) return NO_ACCOUNT_STATUS

  const dbResponse = {
    hasAccount: true,
    accountId: row.stripe_account_id,
    onboardingComplete: row.stripe_onboarding_complete ?? false,
    chargesEnabled: row.stripe_charges_enabled ?? false,
    payoutsEnabled: row.stripe_charges_enabled ?? false,
  }

  try {
    const account = await stripe.accounts.retrieve(row.stripe_account_id)
    return {
      ...dbResponse,
      onboardingComplete: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      email: account.email,
    }
  } catch {
    return dbResponse
  }
}
