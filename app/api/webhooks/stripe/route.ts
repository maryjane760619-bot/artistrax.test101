import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'
import { POINTS_CONFIG } from '@/lib/points-config'
import { sendSubscriptionNotification } from '@/lib/email-service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Check if this is a subscription checkout or track purchase
        if (session.mode === 'subscription') {
          // Handle subscription activation
          const accountType = session.metadata?.accountType
          const accountId = session.metadata?.accountId

          if (!accountType || !accountId) {
            console.error('Missing subscription metadata:', session.metadata)
            break
          }

          const tableName = accountType === 'artist' ? 'artists' : 'labels'
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          const { error } = await supabase
            .from(tableName)
            .update({
              subscription_status: 'trialing',
              stripe_subscription_id: subscription.id,
              subscription_started_at: new Date().toISOString(),
            })
            .eq('id', accountId)

          if (error) {
            console.error('Failed to update subscription:', error)
          } else {
            console.log(`Subscription activated for ${accountType} ${accountId}`)
          }
        } else {
          // Handle track purchase
          const trackId = session.metadata?.trackId
          const artistId = session.metadata?.artistId
          const labelId = session.metadata?.labelId
          const customerEmail = session.customer_details?.email
          const amountPaid = session.amount_total ? session.amount_total / 100 : 0

          if (!trackId || !customerEmail) {
            console.error('Missing track purchase metadata:', session.metadata)
            break
          }

          const { data: purchaseData, error: purchaseError } = await supabase.from('purchases').insert({
            track_id: trackId,
            artist_id: artistId,
            label_id: labelId || null,
            buyer_email: customerEmail,
            amount: amountPaid,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
          }).select().single()

          if (purchaseError) {
            console.error('Failed to record purchase:', purchaseError)
          } else {
            console.log(`Purchase recorded: ${trackId} by ${customerEmail}`)
            
            // Award points to fan if they have an account
            const { data: fan } = await supabase
              .from('fans')
              .select('id')
              .eq('email', customerEmail)
              .single()
            
            if (fan && amountPaid > 0) {
              const pointsEarned = POINTS_CONFIG.calculatePointsEarned(amountPaid)
              
              // Call the award_points function
              const { error: pointsError } = await supabase.rpc('award_points', {
                p_fan_id: fan.id,
                p_amount: pointsEarned,
                p_source_type: 'purchase',
                p_source_id: purchaseData.id,
                p_description: `Earned ${pointsEarned} points from $${amountPaid.toFixed(2)} purchase`
              })
              
              if (pointsError) {
                console.error('Failed to award points:', pointsError)
              } else {
                console.log(`Awarded ${pointsEarned} points to fan ${fan.id}`)
              }
            }
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const accountType = subscription.metadata?.accountType
        const accountId = subscription.metadata?.accountId

        if (!accountType || !accountId) {
          console.error('Missing subscription metadata:', subscription.metadata)
          break
        }

        const tableName = accountType === 'artist' ? 'artists' : 'labels'
        
        // Determine subscription tier from price
        const priceId = subscription.items.data[0]?.price.id
        let tier: 'monthly' | 'annual' | null = null
        
        if (priceId) {
          // Match against known price IDs
          if (priceId.includes('month') || subscription.items.data[0]?.price.recurring?.interval === 'month') {
            tier = 'monthly'
          } else if (priceId.includes('year') || subscription.items.data[0]?.price.recurring?.interval === 'year') {
            tier = 'annual'
          }
        }

        const { error } = await supabase
          .from(tableName)
          .update({
            subscription_status: subscription.status,
            subscription_tier: tier,
            subscription_expires_at: subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString() 
              : null,
          })
          .eq('id', accountId)

        if (error) {
          console.error('Failed to update subscription status:', error)
        } else {
          console.log(`Subscription ${subscription.status} for ${accountType} ${accountId}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const accountType = subscription.metadata?.accountType
        const accountId = subscription.metadata?.accountId

        if (!accountType || !accountId) {
          console.error('Missing subscription metadata:', subscription.metadata)
          break
        }

        const tableName = accountType === 'artist' ? 'artists' : 'labels'

        const { error } = await supabase
          .from(tableName)
          .update({
            subscription_status: 'canceled',
            subscription_expires_at: new Date().toISOString(),
          })
          .eq('id', accountId)

        if (error) {
          console.error('Failed to cancel subscription:', error)
        } else {
          console.log(`Subscription canceled for ${accountType} ${accountId}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const accountType = subscription.metadata?.accountType
          const accountId = subscription.metadata?.accountId

          if (accountType && accountId) {
            const tableName = accountType === 'artist' ? 'artists' : 'labels'
            
            const { error, data: accountData } = await supabase
              .from(tableName)
              .update({
                subscription_status: 'active',
              })
              .eq('id', accountId)
              .select('email, display_name, name')
              .single()

            if (!error) {
              console.log(`Payment succeeded for ${accountType} ${accountId}`)
              
              // Send notification email to admin (non-blocking)
              const name = accountData?.display_name || accountData?.name || 'Unknown'
              const email = accountData?.email || 'unknown@email.com'
              const tier = subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'Annual' : 'Monthly'
              const amount = `$${(invoice.amount_paid / 100).toFixed(2)}`
              
              sendSubscriptionNotification(accountType, name, email, tier, amount)
                .catch(err => console.error('Failed to send subscription notification:', err))
            }
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const accountType = subscription.metadata?.accountType
          const accountId = subscription.metadata?.accountId

          if (accountType && accountId) {
            const tableName = accountType === 'artist' ? 'artists' : 'labels'
            
            const { error } = await supabase
              .from(tableName)
              .update({
                subscription_status: 'past_due',
              })
              .eq('id', accountId)

            if (!error) {
              console.log(`Payment failed for ${accountType} ${accountId}`)
            }
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
