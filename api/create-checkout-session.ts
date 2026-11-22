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
    apiVersion: '2023-10-16',
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
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['US', 'CA'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: isFreeShipping ? 0 : 499,
            currency: 'usd',
          },
          display_name: isFreeShipping ? 'Free Standard Shipping' : 'Standard Shipping (USPS Ground)',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 5 },
          },
        },
      },
    ],
    metadata: {
      source: 'Modus 3D E-Commerce',
      totalItems: reqBody.items.reduce((sum, i) => sum + i.quantity, 0).toString(),
    },
    success_url: reqBody.successUrl || 'https://lucafioriniux.github.io/prototype/?order=success&session_id={CHECKOUT_SESSION_ID}',
    cancel_url: reqBody.cancelUrl || 'https://lucafioriniux.github.io/prototype/?order=cancelled',
  })

  return session
}
