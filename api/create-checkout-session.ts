/**
 * Production Serverless Endpoint: Stripe Checkout Session Creator
 * Compatible with Vercel Serverless Functions, Netlify, or Node.js backends.
 */

export interface CartPayloadItem {
  name: string
  category: string
  unitPrice: number
  quantity: number
  material: string
  color: string
  infill: string
  dysonModel: string
  estimatedWeightGrams: number
  estimatedPrintMinutes: number
}

export interface CheckoutRequest {
  items: CartPayloadItem[]
  successUrl: string
  cancelUrl: string
}

// Handler template (requires `npm install stripe` in backend environment)
export async function createStripeCheckoutSession(reqBody: CheckoutRequest, stripeSecretKey: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Stripe = require('stripe')
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
  })

  const subtotal = reqBody.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const isFreeShipping = subtotal >= 35

  const lineItems = reqBody.items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: `${item.name} (${item.dysonModel})`,
        description: `Material: ${item.material} | Color: ${item.color} | Infill: ${item.infill} | Est. Weight: ${item.estimatedWeightGrams}g`,
        metadata: {
          category: item.category,
          material: item.material,
          color: item.color,
          infill: item.infill,
          dysonModel: item.dysonModel,
          printTimeMinutes: item.estimatedPrintMinutes.toString(),
        },
      },
      unit_amount: Math.round(item.unitPrice * 100), // Stripe accepts amount in cents
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    ui_mode: 'form',
    mode: 'payment',
    billing_address_collection: 'auto',
    phone_number_collection: {
      enabled: false,
    },
    automatic_tax: {
      enabled: false,
    },
    submit_type: 'pay',
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    integration_identifier: 'custom_embedded_web_0001',
    line_items: lineItems,
  })

  return { client_secret: session.client_secret }
}
