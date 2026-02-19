/**
 * Stripe Subscription Products Setup
 * Run this once to create products and prices in Stripe
 * 
 * Usage: node stripe-subscription-products.js
 */

require('dotenv').config({ path: '.env.local' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createSubscriptionProducts() {
  console.log('Creating Stripe subscription products and prices...\n');

  try {
    // ============================================
    // ARTIST SUBSCRIPTIONS
    // ============================================

    // Artist Monthly ($20/month)
    const artistMonthlyProduct = await stripe.products.create({
      name: 'Artist Monthly Subscription',
      description: 'Monthly subscription for artists - Keep 95% of sales, 10GB storage',
      metadata: {
        user_type: 'artist',
        tier: 'monthly',
        storage_gb: '10'
      }
    });

    const artistMonthlyPrice = await stripe.prices.create({
      product: artistMonthlyProduct.id,
      unit_amount: 2000, // $20.00
      currency: 'usd',
      recurring: {
        interval: 'month',
        trial_period_days: 30
      },
      metadata: {
        user_type: 'artist',
        tier: 'monthly'
      }
    });

    console.log('✅ Artist Monthly: $20/month');
    console.log(`   Product ID: ${artistMonthlyProduct.id}`);
    console.log(`   Price ID: ${artistMonthlyPrice.id}\n`);

    // Artist Annual ($96/year - 60% discount)
    const artistAnnualProduct = await stripe.products.create({
      name: 'Artist Annual Subscription',
      description: 'Annual subscription for artists - Keep 95% of sales, 10GB storage, 60% discount!',
      metadata: {
        user_type: 'artist',
        tier: 'annual',
        storage_gb: '10'
      }
    });

    const artistAnnualPrice = await stripe.prices.create({
      product: artistAnnualProduct.id,
      unit_amount: 9600, // $96.00
      currency: 'usd',
      recurring: {
        interval: 'year',
        trial_period_days: 30
      },
      metadata: {
        user_type: 'artist',
        tier: 'annual'
      }
    });

    console.log('✅ Artist Annual: $96/year (60% off)');
    console.log(`   Product ID: ${artistAnnualProduct.id}`);
    console.log(`   Price ID: ${artistAnnualPrice.id}\n`);

    // ============================================
    // LABEL SUBSCRIPTIONS
    // ============================================

    // Label Monthly ($25/month)
    const labelMonthlyProduct = await stripe.products.create({
      name: 'Label Monthly Subscription',
      description: 'Monthly subscription for labels - Keep 90% of sales, 10GB storage',
      metadata: {
        user_type: 'label',
        tier: 'monthly',
        storage_gb: '10'
      }
    });

    const labelMonthlyPrice = await stripe.prices.create({
      product: labelMonthlyProduct.id,
      unit_amount: 2500, // $25.00
      currency: 'usd',
      recurring: {
        interval: 'month',
        trial_period_days: 30
      },
      metadata: {
        user_type: 'label',
        tier: 'monthly'
      }
    });

    console.log('✅ Label Monthly: $25/month');
    console.log(`   Product ID: ${labelMonthlyProduct.id}`);
    console.log(`   Price ID: ${labelMonthlyPrice.id}\n`);

    // Label Annual ($120/year - 60% discount)
    const labelAnnualProduct = await stripe.products.create({
      name: 'Label Annual Subscription',
      description: 'Annual subscription for labels - Keep 90% of sales, 10GB storage, 60% discount!',
      metadata: {
        user_type: 'label',
        tier: 'annual',
        storage_gb: '10'
      }
    });

    const labelAnnualPrice = await stripe.prices.create({
      product: labelAnnualProduct.id,
      unit_amount: 12000, // $120.00
      currency: 'usd',
      recurring: {
        interval: 'year',
        trial_period_days: 30
      },
      metadata: {
        user_type: 'label',
        tier: 'annual'
      }
    });

    console.log('✅ Label Annual: $120/year (60% off)');
    console.log(`   Product ID: ${labelAnnualProduct.id}`);
    console.log(`   Price ID: ${labelAnnualPrice.id}\n`);

    // ============================================
    // STORAGE ADD-ON (for both artists and labels)
    // ============================================

    const unlimitedStorageProduct = await stripe.products.create({
      name: 'Unlimited Storage Add-On',
      description: 'Upgrade to unlimited storage - $5/month for artists and labels',
      metadata: {
        addon_type: 'unlimited_storage'
      }
    });

    const unlimitedStoragePrice = await stripe.prices.create({
      product: unlimitedStorageProduct.id,
      unit_amount: 500, // $5.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        addon_type: 'unlimited_storage'
      }
    });

    console.log('✅ Unlimited Storage Add-On: $5/month');
    console.log(`   Product ID: ${unlimitedStorageProduct.id}`);
    console.log(`   Price ID: ${unlimitedStoragePrice.id}\n`);

    // ============================================
    // SAVE TO ENV
    // ============================================

    console.log('\n' + '='.repeat(60));
    console.log('ADD THESE TO YOUR .env.local FILE:');
    console.log('='.repeat(60) + '\n');

    console.log('# Artist Subscription Price IDs');
    console.log(`STRIPE_ARTIST_MONTHLY_PRICE_ID=${artistMonthlyPrice.id}`);
    console.log(`STRIPE_ARTIST_ANNUAL_PRICE_ID=${artistAnnualPrice.id}`);
    console.log('\n# Label Subscription Price IDs');
    console.log(`STRIPE_LABEL_MONTHLY_PRICE_ID=${labelMonthlyPrice.id}`);
    console.log(`STRIPE_LABEL_ANNUAL_PRICE_ID=${labelAnnualPrice.id}`);
    console.log('\n# Storage Add-On Price ID');
    console.log(`STRIPE_UNLIMITED_STORAGE_PRICE_ID=${unlimitedStoragePrice.id}`);
    console.log('\n');

  } catch (error) {
    console.error('Error creating products:', error.message);
    process.exit(1);
  }
}

createSubscriptionProducts();
