// Check if artist onboarding completed
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkStatus() {
  const artistId = 'd63762e2-dca0-4e65-bdbe-2c98c09cfbca' // DJ Mary
  
  const { data, error } = await supabase
    .from('artists')
    .select('display_name, stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled')
    .eq('id', artistId)
    .single()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('🎯 Artist:', data.display_name)
  console.log('📋 Stripe Account ID:', data.stripe_account_id)
  console.log('✅ Onboarding Complete:', data.stripe_onboarding_complete)
  console.log('💳 Charges Enabled:', data.stripe_charges_enabled)
  
  if (data.stripe_charges_enabled) {
    console.log('\n🎉 Ready to receive payments!')
  } else {
    console.log('\n⚠️  Onboarding may still be pending. Wait a moment and check again.')
  }
}

checkStatus()
