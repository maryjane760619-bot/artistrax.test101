import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { order, sellerEmail, sellerName } = await request.json()

    // Send confirmation email to customer
    const customerEmail = await resend.emails.send({
      from: 'artistrax <orders@artistrax.com>',
      to: order.buyer_email,
      subject: `Order Confirmation #${order.id.slice(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Order Confirmed!</h1>
          <p>Hi ${order.buyer_name},</p>
          <p>Thank you for your order! We've received your payment and your order is being prepared for shipping.</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Order #${order.id.slice(0, 8)}</h2>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <h3>Items:</h3>
            <ul style="list-style: none; padding: 0;">
              ${order.items.map((item: any) => `
                <li style="margin-bottom: 10px;">
                  <strong>${item.product_title}</strong>
                  ${item.variant_name ? `<br/><small>${item.variant_name}</small>` : ''}
                  <br/>Quantity: ${item.quantity} × $${item.unit_price.toFixed(2)} = $${(item.quantity * item.unit_price).toFixed(2)}
                </li>
              `).join('')}
            </ul>
            
            <div style="border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px;">
              <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
              <p><strong>Shipping:</strong> $${order.shipping_total.toFixed(2)}</p>
              <p style="font-size: 18px;"><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            </div>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Shipping Address</h3>
            <p style="margin: 5px 0;">${order.shipping_address.name}</p>
            <p style="margin: 5px 0;">${order.shipping_address.street}</p>
            <p style="margin: 5px 0;">${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}</p>
            <p style="margin: 5px 0;">${order.shipping_address.country}</p>
          </div>
          
          <h3>What happens next?</h3>
          <ul>
            <li>The seller will prepare your order for shipping</li>
            <li>You'll receive tracking information once shipped</li>
            <li>Questions? Contact us at support@artistrax.com</li>
          </ul>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Thank you for supporting independent artists!<br/>
            - The artistrax Team
          </p>
        </div>
      `
    })

    // Send notification email to seller (artist/label)
    const sellerEmail_result = await resend.emails.send({
      from: 'artistrax <orders@artistrax.com>',
      to: sellerEmail,
      subject: `🎉 New Order #${order.id.slice(0, 8)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">🎉 New Order Received!</h1>
          <p>Hi ${sellerName},</p>
          <p>Great news! You have a new order for your merch.</p>
          
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
            <h2 style="margin-top: 0;">Order #${order.id.slice(0, 8)}</h2>
            <p><strong>Customer:</strong> ${order.buyer_name} (${order.buyer_email})</p>
            <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            
            <h3>Items Ordered:</h3>
            <ul style="list-style: none; padding: 0;">
              ${order.items.map((item: any) => `
                <li style="margin-bottom: 10px;">
                  <strong>${item.product_title}</strong>
                  ${item.variant_name ? `<br/><small>${item.variant_name}</small>` : ''}
                  <br/>Quantity: ${item.quantity}
                </li>
              `).join('')}
            </ul>
            
            <div style="border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px;">
              <p><strong>Order Total:</strong> $${order.total.toFixed(2)}</p>
              <p><strong>Your Payout:</strong> $${(order.subtotal - order.platform_fee).toFixed(2)} (after 5% platform fee)</p>
            </div>
          </div>
          
          <div style="background: #fff4e6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📦 Shipping Address</h3>
            <p style="margin: 5px 0;"><strong>${order.shipping_address.name}</strong></p>
            <p style="margin: 5px 0;">${order.shipping_address.street}</p>
            <p style="margin: 5px 0;">${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}</p>
            <p style="margin: 5px 0;">${order.shipping_address.country}</p>
          </div>
          
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h3 style="margin-top: 0; color: #dc2626;">⚡ Action Required</h3>
            <p style="margin: 5px 0;">1. Log in to your dashboard to view the order</p>
            <p style="margin: 5px 0;">2. Prepare the items for shipping</p>
            <p style="margin: 5px 0;">3. Mark as "Shipped" once sent and update tracking</p>
          </div>
          
          <a href="https://artistrax.com/artist/orders" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            View Order in Dashboard →
          </a>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Questions? Contact us at support@artistrax.com<br/>
            - The artistrax Team
          </p>
        </div>
      `
    })

    return NextResponse.json({
      success: true,
      customerEmailId: customerEmail.data?.id,
      sellerEmailId: sellerEmail_result.data?.id
    })

  } catch (error: any) {
    console.error('Email sending error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
