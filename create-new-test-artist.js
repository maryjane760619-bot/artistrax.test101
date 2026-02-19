// Create a new test Connect account with instant approval
require('dotenv').config({ path: '.env.local' })
const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createInstantAccount() {
  const artistId = 'd63762e2-dca0-4e65-bdbe-2c98c09cfbca' // DJ Mary
  
  console.log('🆕 Creating Connect account with instant verification...\n')
  
  // Create account with test data that auto-verifies
  const account = await stripe.accounts.create({
    type: 'custom', // Use custom instead of express for more control
    country: 'US',
    email: 'maryjane760619+test@gmail.com',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    },
    business_type: 'individual',
    individual: {
      first_name: 'Test',
      last_name: 'Artist',
      email: 'maryjane760619+test@gmail.com',
      ssn_last_4: '0000',
      address: {
        line1: '123 Test St',
        city: 'Test City',
        state: 'CA',
        postal_code: '90210'
      },
      dob: {
        day: 1,
        month: 1,
        year: 1990
      }
    },
    business_profile: {
      mcc: '5734', // Computer software stores
      url: 'https://artistrax.com'
    },
    tos_acceptance: {
      date: Math.floor(Date.now() / 1000),
      ip: '8.8.8.8'
    },
    external_account: {
      object: 'bank_account',
      country: 'US',
      currency: 'usd',
      account_number: '000123456789',
      routing_number: '110000000'
    }
  })
  
  console.log('📋 New Account:', account.id)
  console.log('   Charges Enabled:', account.charges_enabled)
  console.log('   Payouts Enabled:', account.payouts_enabled)
  
  // Update database
  await supabase
    .from('artists')
    .update({
      stripe_account_id: account.id,
      stripe_onboarding_complete: true,
      stripe_charges_enabled: account.charges_enabled,
      stripe_details_submitted: true
    })
    .eq('id', artistId)
  
  console.log('\n✅ Database updated!')
  
  if (account.charges_enabled) {
    console.log('🎉 Ready to test payments!')
  } else {
    console.log('⚠️  Account created but charges not enabled yet')
  }
}

createInstantAccount().catch(console.error)
