// Test Stripe Connect label onboarding
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testLabelOnboarding() {
  console.log('🔍 Checking for test labels...\n')
  
  // Get a test label
  const { data: labels, error } = await supabase
    .from('labels')
    .select('id, name, email, stripe_account_id, stripe_onboarding_complete')
    .limit(5)
  
  if (error) {
    console.error('❌ Error fetching labels:', error.message)
    return
  }
  
  if (!labels || labels.length === 0) {
    console.log('❌ No labels found in database.')
    console.log('   You need to create a test label first.')
    return
  }
  
  console.log('📋 Available labels:\n')
  labels.forEach((label, i) => {
    console.log(`${i + 1}. ${label.name} (${label.email})`)
    console.log(`   ID: ${label.id}`)
    console.log(`   Stripe Connected: ${label.stripe_onboarding_complete ? '✅ Yes' : '❌ No'}`)
    console.log('')
  })
  
  // Pick first label without Stripe setup
  const testLabel = labels.find(l => !l.stripe_account_id) || labels[0]
  
  console.log(`\n🎯 Testing onboarding for: ${testLabel.name}`)
  console.log(`   Email: ${testLabel.email}`)
  console.log(`   ID: ${testLabel.id}\n`)
  
  // Step 1: Create Stripe Connect account
  console.log('📝 Step 1: Creating Stripe Connect account...')
  
  const createResponse = await fetch('http://localhost:3000/api/stripe/connect/create-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testLabel.id,
      userType: 'label',
      email: testLabel.email
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
      userType: 'label'
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
  console.log('4. Business type: Company')
  console.log('5. EIN: 00-0000000')
  console.log('6. Test Bank Account: 110000000 / 000123456789')
  console.log('7. After completion, we can test purchases!')
}

testLabelOnboarding().catch(console.error)
