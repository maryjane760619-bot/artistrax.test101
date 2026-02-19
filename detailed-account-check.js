// Get detailed account info from Stripe
require('dotenv').config({ path: '.env.local' })
const Stripe = require('stripe')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function checkAccount() {
  const accountId = 'acct_1T1Jy9KRmwHFAFvI'
  
  console.log('🔍 Checking account:', accountId)
  console.log('')
  
  const account = await stripe.accounts.retrieve(accountId)
  
  console.log('📋 Account Details:')
  console.log('   Type:', account.type)
  console.log('   Business Type:', account.business_type)
  console.log('   Email:', account.email)
  console.log('')
  
  console.log('📊 Status:')
  console.log('   Details Submitted:', account.details_submitted)
  console.log('   Charges Enabled:', account.charges_enabled)
  console.log('   Payouts Enabled:', account.payouts_enabled)
  console.log('')
  
  if (account.requirements) {
    console.log('⚠️  Requirements:')
    if (account.requirements.currently_due?.length > 0) {
      console.log('   Currently Due:', account.requirements.currently_due)
    }
    if (account.requirements.eventually_due?.length > 0) {
      console.log('   Eventually Due:', account.requirements.eventually_due)
    }
    if (account.requirements.pending_verification?.length > 0) {
      console.log('   Pending Verification:', account.requirements.pending_verification)
    }
    if (account.requirements.errors?.length > 0) {
      console.log('   Errors:', account.requirements.errors)
    }
  }
  
  console.log('')
  console.log('💡 Dashboard link:')
  console.log('   https://dashboard.stripe.com/test/connect/accounts/' + accountId)
}

checkAccount().catch(console.error)
