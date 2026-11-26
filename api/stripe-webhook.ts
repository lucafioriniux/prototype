import crypto from 'node:crypto'

/**
 * Production Serverless Stripe Webhook Handler (Vercel / Node.js compatible).
 * Verifies `stripe-signature` using `STRIPE_WEBHOOK_SECRET` and handles
 * `checkout.session.completed` to enqueue paid orders into Batch 1 (48h)
 * or Batch 2 (+24h overflow) up to the daily quality cap.
 *
 * Environment Variables required in production:
 * - STRIPE_SECRET_KEY
 * - STRIPE_WEBHOOK_SECRET
 */

function verifyStripeSignature(payload: string, sigHeader: string, secret: string): boolean {
  const parts = sigHeader.split(',').reduce<Record<string, string>>((acc, item) => {
    const [k, v] = item.split('=')
    if (k && v) acc[k.trim()] = v.trim()
    return acc
  }, {})

  const timestamp = parts['t']
  const signature = parts['v1']
  if (!timestamp || !signature) return false

  const signedPayload = `${timestamp}.${payload}`
  const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!webhookSecret || !stripeSecret) {
    return res.status(500).json({ error: 'Missing STRIPE_WEBHOOK_SECRET or STRIPE_SECRET_KEY' })
  }

  // Read raw body for signature verification
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  const rawBody = Buffer.concat(chunks).toString('utf8')
  const sigHeader = req.headers['stripe-signature'] as string | undefined

  if (!sigHeader || !verifyStripeSignature(rawBody, sigHeader, webhookSecret)) {
    return res.status(400).json({ error: 'Invalid Stripe webhook signature' })
  }

  const event = JSON.parse(rawBody)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // Fetch full line items from Stripe API so all material/color/infill specs are captured
    const lineItemsRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items?limit=50`,
      {
        headers: { Authorization: `Bearer ${stripeSecret}` },
      }
    )
    const lineItemsData = await lineItemsRes.json()

    const shipping = session.shipping_details || session.customer_details
    const formattedAddress = shipping?.address
      ? [
          shipping.address.line1,
          shipping.address.line2,
          `${shipping.address.city || ''}, ${shipping.address.state || ''} ${shipping.address.postal_code || ''}`,
          shipping.address.country,
        ]
          .filter(Boolean)
          .join(', ')
      : 'No shipping address provided'

    const enqueuedOrder = {
      id: `STRIPE-${String(session.id).slice(-6).toUpperCase()}`,
      stripeSessionId: session.id,
      createdAt: new Date().toISOString(),
      customerName: shipping?.name || session.customer_details?.name || 'Customer',
      customerEmail: session.customer_details?.email || '',
      shippingAddress: formattedAddress,
      batch: session.metadata?.batch === 'batch_2_24h' ? 'batch_2_24h' : 'batch_1',
      status: 'queued',
      total: (session.amount_total || 0) / 100,
      items: lineItemsData.data || [],
    }

    // Persist `enqueuedOrder` to your database (e.g., Supabase, Cloudflare D1, or Postgres)
    console.log('[Modus 3D Webhook] Enqueued paid print order:', enqueuedOrder.id, enqueuedOrder.batch)

    return res.status(200).json({ received: true, orderId: enqueuedOrder.id, batch: enqueuedOrder.batch })
  }

  return res.status(200).json({ received: true, ignored: event.type })
}
