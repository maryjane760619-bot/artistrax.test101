// Quick script to verify Stripe Connect schema is applied
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySchema() {
  console.log('🔍 Checking Stripe Connect schema...\n')
  
  // Check artists table for Stripe columns
  const { data: artists, error: artistsError } = await supabase
    .from('artists')
    .select('id, stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled')
    .limit(1)
  
  if (artistsError && artistsError.code === 'PGRST116') {
    console.log('❌ Artists table missing Stripe columns')
  } else if (artistsError) {
    console.log('⚠️  Artists table error:', artistsError.message)
  } else {
    console.log('✅ Artists table has Stripe columns')
  }
  
  // Check labels table for Stripe columns
  const { data: labels, error: labelsError } = await supabase
    .from('labels')
    .select('id, stripe_account_id, stripe_onboarding_complete, stripe_charges_enabled')
    .limit(1)
  
  if (labelsError && labelsError.code === 'PGRST116') {
    console.log('❌ Labels table missing Stripe columns')
  } else if (labelsError) {
    console.log('⚠️  Labels table error:', labelsError.message)
  } else {
    console.log('✅ Labels table has Stripe columns')
  }
  
  // Check if payouts table exists
  const { data: payouts, error: payoutsError } = await supabase
    .from('payouts')
    .select('id')
    .limit(1)
  
  if (payoutsError && payoutsError.code === '42P01') {
    console.log('❌ Payouts table does not exist')
  } else if (payoutsError) {
    console.log('⚠️  Payouts table error:', payoutsError.message)
  } else {
    console.log('✅ Payouts table exists')
  }
  
  // Check orders table for stripe_payment_intent_id
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, stripe_payment_intent_id')
    .limit(1)
  
  if (ordersError && ordersError.code === 'PGRST116') {
    console.log('❌ Orders table missing stripe_payment_intent_id column')
  } else if (ordersError) {
    console.log('⚠️  Orders table error:', ordersError.message)
  } else {
    console.log('✅ Orders table has stripe_payment_intent_id column')
  }
  
  console.log('\n📋 Summary:')
  const needsMigration = artistsError || labelsError || payoutsError || ordersError
  if (needsMigration) {
    console.log('❌ Schema NOT fully applied. Run stripe-connect-schema.sql in Supabase.')
  } else {
    console.log('✅ Schema is fully applied and ready!')
  }
}

verifySchema().catch(console.error)
