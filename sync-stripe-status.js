// Manually sync Stripe account status
require('dotenv').config({ path: '.env.local' })
const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function syncStatus() {
  const artistId = 'd63762e2-dca0-4e65-bdbe-2c98c09cfbca' // DJ Mary
  const accountId = 'acct_1T1Jy9KRmwHFAFvI'
  
  console.log('🔄 Fetching latest status from Stripe...\n')
  
  const account = await stripe.accounts.retrieve(accountId)
  
  console.log('📋 Stripe Account Status:')
  console.log('   Details Submitted:', account.details_submitted)
  console.log('   Charges Enabled:', account.charges_enabled)
  console.log('   Payouts Enabled:', account.payouts_enabled)
  console.log('')
  
  // Update database
  const { error } = await supabase
    .from('artists')
    .update({
      stripe_onboarding_complete: account.details_submitted,
      stripe_charges_enabled: account.charges_enabled,
      stripe_details_submitted: account.details_submitted
    })
    .eq('id', artistId)
  
  if (error) {
    console.error('❌ Database update failed:', error)
    return
  }
  
  console.log('✅ Database updated!')
  
  if (account.charges_enabled) {
    console.log('\n🎉 DJ Mary is ready to receive payments!')
    console.log('   Next: Test a purchase with 95/5 split')
  } else {
    console.log('\n⚠️  Account not fully activated yet.')
    console.log('   Possible reasons:')
    console.log('   - Stripe is still reviewing')
    console.log('   - Onboarding not completed')
    console.log('   - Check: https://dashboard.stripe.com/test/connect/accounts/' + accountId)
  }
}

syncStatus().catch(console.error)
