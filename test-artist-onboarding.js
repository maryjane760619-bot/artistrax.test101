// Test Stripe Connect artist onboarding
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testOnboarding() {
  console.log('🔍 Checking for test artists...\n')
  
  // Get a test artist
  const { data: artists, error } = await supabase
    .from('artists')
    .select('id, display_name, email, stripe_account_id, stripe_onboarding_complete')
    .limit(5)
  
  if (error) {
    console.error('❌ Error fetching artists:', error.message)
    return
  }
  
  if (!artists || artists.length === 0) {
    console.log('❌ No artists found in database.')
    console.log('   You need to create a test artist first.')
    return
  }
  
  console.log('📋 Available artists:\n')
  artists.forEach((artist, i) => {
    console.log(`${i + 1}. ${artist.display_name} (${artist.email})`)
    console.log(`   ID: ${artist.id}`)
    console.log(`   Stripe Connected: ${artist.stripe_onboarding_complete ? '✅ Yes' : '❌ No'}`)
    console.log('')
  })
  
  // Pick first artist without Stripe setup
  const testArtist = artists.find(a => !a.stripe_account_id) || artists[0]
  
  console.log(`\n🎯 Testing onboarding for: ${testArtist.display_name}`)
  console.log(`   Email: ${testArtist.email}`)
  console.log(`   ID: ${testArtist.id}\n`)
  
  // Step 1: Create Stripe Connect account
  console.log('📝 Step 1: Creating Stripe Connect account...')
  
  const createResponse = await fetch('http://localhost:3000/api/stripe/connect/create-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testArtist.id,
      userType: 'artist',
      email: testArtist.email
    })
  })
  
  const createData = await createResponse.json()
  
  if (!createResponse.ok) {
    console.error('❌ Failed to create account:', createData)
    return
  }
  
  console.log('✅ Stripe account created:', createData.accountId)
  
  // Step 2: Get onboarding link
  console.log('\n📝 Step 2: Generating onboarding link...')
  
  const linkResponse = await fetch('http://localhost:3000/api/stripe/connect/onboarding-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      accountId: createData.accountId,
      userType: 'artist'
    })
  })
  
  const linkData = await linkResponse.json()
  
  if (!linkResponse.ok) {
    console.error('❌ Failed to create onboarding link:', linkData)
    return
  }
  
  console.log('✅ Onboarding link generated!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔗 ONBOARDING LINK (open in browser):')
  console.log(linkData.url)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  console.log('📋 Next steps:')
  console.log('1. Open the link above in your browser')
  console.log('2. Complete the Stripe onboarding form')
  console.log('3. Use test data from: https://stripe.com/docs/connect/testing')
  console.log('4. Test SSN: 000-00-0000')
  console.log('5. Test Bank Account: 000123456789')
  console.log('6. After completion, run: node test-purchase.js')
}

testOnboarding().catch(console.error)
