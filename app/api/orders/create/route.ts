import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      items,
      shippingAddress,
      buyerEmail,
      buyerName,
      subtotal,
      shippingTotal,
      platformFee,
      total
    } = body

    // Validate required fields
    if (!items || !items.length || !shippingAddress || !buyerEmail || !buyerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_email: buyerEmail,
        buyer_name: buyerName,
        shipping_address: shippingAddress,
        subtotal,
        shipping_total: shippingTotal,
        platform_fee: platformFee,
        total,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    for (const item of items) {
      const orderItemData: any = {
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId || null,
        product_title: item.productTitle,
        variant_name: item.variantName || null,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity
      }

      // Set artist_id or label_id based on seller type
      if (item.sellerType === 'label') {
        orderItemData.label_id = item.artistId // artistId field holds label ID for label products
      } else {
        orderItemData.artist_id = item.artistId
      }

      const { error: itemError } = await supabase
        .from('order_items')
        .insert(orderItemData)

      if (itemError) throw itemError
    }

    // Get seller info (artist or label) for email
    const firstItem = items[0]
    let sellerEmail = ''
    let sellerName = ''

    if (firstItem.sellerType === 'label') {
      const { data: label } = await supabase
        .from('labels')
        .select('name, email')
        .eq('id', firstItem.artistId)
        .single()
      
      sellerEmail = label?.email || ''
      sellerName = label?.name || 'Label'
    } else {
      const { data: artist } = await supabase
        .from('artists')
        .select('display_name, email')
        .eq('id', firstItem.artistId)
        .single()
      
      sellerEmail = artist?.email || ''
      sellerName = artist?.display_name || 'Artist'
    }

    // Send email notifications (don't wait for it)
    if (sellerEmail) {
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-order-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            id: order.id,
            buyer_name: buyerName,
            buyer_email: buyerEmail,
            subtotal,
            shipping_total: shippingTotal,
            platform_fee: platformFee,
            total,
            shipping_address: shippingAddress,
            created_at: order.created_at,
            items: items.map((item: any) => ({
              product_title: item.productTitle,
              variant_name: item.variantName,
              quantity: item.quantity,
              unit_price: item.price
            }))
          },
          sellerEmail,
          sellerName
        })
      }).catch(err => console.error('Failed to send order emails:', err))
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id 
    })

  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
