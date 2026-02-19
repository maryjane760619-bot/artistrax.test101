// Force verification to pass in test mode
require('dotenv').config({ path: '.env.local' })
const Stripe = require('stripe')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function forceVerification() {
  const accountId = 'acct_1T1Jy9KRmwHFAFvI'
  
  console.log('🔧 Updating account to enable charges in test mode...\n')
  
  try {
    // In test mode, we can update the account with verified test data
    const account = await stripe.accounts.update(accountId, {
      individual: {
        id_number: '000000000', // Test SSN
        verification: {
          document: {
            front: 'file_identity_document_success' // Stripe test file token
          }
        }
      }
    })
    
    console.log('📋 Updated Account Status:')
    console.log('   Details Submitted:', account.details_submitted)
    console.log('   Charges Enabled:', account.charges_enabled)
    console.log('   Payouts Enabled:', account.payouts_enabled)
    
    if (account.charges_enabled) {
      console.log('\n✅ Success! Account is now ready to receive payments!')
    } else {
      console.log('\n⚠️  Still pending. Check requirements:')
      if (account.requirements?.currently_due?.length > 0) {
        console.log('   Currently Due:', account.requirements.currently_due)
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\nℹ️  In test mode, Stripe usually activates accounts instantly.')
    console.log('   Try waiting 30 seconds and run: node sync-stripe-status.js')
  }
}

forceVerification().catch(console.error)
