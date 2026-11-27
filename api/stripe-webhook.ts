import crypto from 'node:crypto'
import { getSupabaseAdmin, sendResendEmail } from './_supabaseAdmin.js'

/**
 * Production Serverless Stripe Webhook Handler (Vercel / Node.js).
 * Verifies `stripe-signature` using `STRIPE_WEBHOOK_SECRET` and handles
 * `checkout.session.completed` to persist paid orders to Supabase `print_orders`
 * with automatic Batch 1 (48h) / Batch 2 (+24h) assignment.
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
  const stripeSecret = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY
  if (!webhookSecret) {
    return res.status(500).json({ error: 'Missing STRIPE_WEBHOOK_SECRET' })
  }
  if (!stripeSecret) {
    return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY' })
  }

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
    const supabaseAdmin = getSupabaseAdmin()

    // Parse structured item specs if passed in session metadata
    let parsedItems: any[] = []
    if (session.metadata?.items_json) {
      try {
        parsedItems = JSON.parse(session.metadata.items_json)
      } catch {
        parsedItems = []
      }
    }

    // Fallback: fetch Stripe line_items if metadata wasn't attached
    if (parsedItems.length === 0) {
      const lineItemsRes = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items?limit=50`,
        { headers: { Authorization: `Bearer ${stripeSecret}` } }
      )
      const lineItemsData = await lineItemsRes.json()
      parsedItems = (lineItemsData.data || []).map((li: any) => ({
        productId: li.price?.product || 'custom',
        productName: li.description || 'Forma 3D Print',
        materialName: 'Indoor +',
        colorName: 'Iron Grey',
        colorHex: '#374151',
        infillName: 'Strong',
        selectedModel: 'Universal',
        quantity: li.quantity || 1,
        unitPrice: (li.amount_total || 0) / 100 / (li.quantity || 1),
        printTimeMinutes: 150,
      }))
    }

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

    const orderId = `STRIPE-${String(session.id).slice(-6).toUpperCase()}`
    const total = Number(((session.amount_total || 0) / 100).toFixed(2))
    const shippingCost = Number((((session.total_details?.amount_shipping || 0) / 100)).toFixed(2))
    const subtotal = Number((total - shippingCost).toFixed(2))

    let assignedBatch: 'batch_1' | 'batch_2_24h' =
      session.metadata?.batch === 'batch_2_24h' ? 'batch_2_24h' : 'batch_1'

    if (supabaseAdmin) {
      const [{ data: settings }, { data: activeOrders }] = await Promise.all([
        supabaseAdmin.from('workshop_settings').select('*').eq('id', 1).single(),
        supabaseAdmin.from('print_orders').select('id, batch').neq('status', 'shipped'),
      ])

      const batch1Cap = settings?.batch_1_cap ?? 5
      const batch1Count = (activeOrders || []).filter((o: any) => o.batch === 'batch_1').length
      if (batch1Count >= batch1Cap) {
        assignedBatch = 'batch_2_24h'
      }

      const { error: upsertErr } = await supabaseAdmin.from('print_orders').upsert(
        {
          id: orderId,
          stripe_session_id: session.id,
          customer_name: shipping?.name || session.customer_details?.name || 'Customer',
          customer_email: session.customer_details?.email || '',
          shipping_address: formattedAddress,
          batch: assignedBatch,
          status: 'queued',
          subtotal,
          shipping_cost: shippingCost,
          total,
          items: parsedItems,
        },
        { onConflict: 'id' }
      )

      if (upsertErr) {
        console.error('[Forma Webhook] Supabase insert error:', upsertErr)
        return res.status(500).json({ error: upsertErr.message })
      }
    }

    // Optional Resend Email Notifications (Customer + Maker)
    const customerEmail = session.customer_details?.email
    const makerEmail = process.env.MAKER_NOTIFICATION_EMAIL
    const slaText =
      assignedBatch === 'batch_2_24h'
        ? "Tomorrow's Batch (+24h dispatch)"
        : 'Today’s Batch (48h dispatch)'

    if (customerEmail) {
      await sendResendEmail({
        to: customerEmail,
        subject: `Forma Order Confirmed: ${orderId}`,
        html: `<p>Hi ${shipping?.name || 'there'},</p><p>Thanks for supporting Forma! Your custom 3D-printed order <strong>${orderId}</strong> ($${total.toFixed(2)}) is queued in <strong>${slaText}</strong>.</p><p>Every part is personally printed, inspected to ±0.15mm, and shipped via USPS Ground Advantage.</p><p>— Luca, Forma Additive Workshop</p>`,
      })
    }

    if (makerEmail) {
      await sendResendEmail({
        to: makerEmail,
        subject: `[New Forma Order] ${orderId} ($${total.toFixed(2)}) — ${assignedBatch}`,
        html: `<p><strong>New Paid Order:</strong> ${orderId}</p><p><strong>Customer:</strong> ${shipping?.name || 'Customer'} (${customerEmail || 'no email'})</p><p><strong>Ship To:</strong> ${formattedAddress}</p><p><strong>Batch:</strong> ${slaText}</p>`,
      })
    }

    return res.status(200).json({ received: true, orderId, batch: assignedBatch })
  }

  return res.status(200).json({ received: true, ignored: event.type })
}
