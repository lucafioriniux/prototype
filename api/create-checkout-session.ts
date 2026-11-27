import { getSupabaseAdmin } from './_supabaseAdmin.js'

/**
 * Server-side Stripe Checkout Session endpoint (Vercel Serverless).
 * Checks live Supabase queue capacity first so checkout stays strictly gated
 * when Batch 1 + Batch 2 (+24h) are full or manually paused.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!stripeSecret) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY not configured on server' })
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
  const { cart, originUrl } = body

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' })
  }

  // Enforce live Supabase Queue Cap if configured
  let assignedBatch: 'batch_1' | 'batch_2_24h' = 'batch_1'
  const supabaseAdmin = getSupabaseAdmin()
  if (supabaseAdmin) {
    const [{ data: settings }, { data: activeOrders }] = await Promise.all([
      supabaseAdmin.from('workshop_settings').select('*').eq('id', 1).single(),
      supabaseAdmin.from('print_orders').select('id, batch').neq('status', 'shipped'),
    ])

    const batch1Cap = settings?.batch_1_cap ?? 5
    const batch2Cap = settings?.batch_2_cap ?? 5
    const manualPause = Boolean(settings?.manual_pause)
    const batch1Count = (activeOrders || []).filter((o: any) => o.batch === 'batch_1').length
    const batch2Count = (activeOrders || []).filter((o: any) => o.batch === 'batch_2_24h').length

    if (manualPause || (batch1Count >= batch1Cap && batch2Count >= batch2Cap)) {
      return res.status(409).json({
        error:
          'Workshop Queue Paused for Quality — Today and tomorrow’s print batches are full. Checkout reopens tomorrow morning.',
      })
    }
    if (batch1Count >= batch1Cap) {
      assignedBatch = 'batch_2_24h'
    }
  }

  const subtotal = cart.reduce((sum: number, item: any) => sum + item.unitPrice * item.quantity, 0)
  const isFreeShipping = subtotal >= 35

  const compactItems = cart.map((item: any) => ({
    productId: item.productId,
    productName: item.product?.name || 'Forma Part',
    materialName: item.material?.name || 'Indoor +',
    colorName: item.color?.name || 'Iron Grey',
    colorHex: item.color?.hex || '#374151',
    infillName: item.infill?.name || 'Strong',
    selectedModel: String(item.selectedModel || 'Universal'),
    quantity: item.quantity || 1,
    unitPrice: item.unitPrice,
    printTimeMinutes: Math.round(
      (item.product?.printSpecs?.printTimeMinutes || 120) * (item.infill?.timeMultiplier || 1)
    ),
  }))

  const params = new URLSearchParams()
  params.append('mode', 'payment')
  params.append('billing_address_collection', 'auto')
  params.append('shipping_address_collection[allowed_countries][0]', 'US')
  params.append('shipping_address_collection[allowed_countries][1]', 'CA')
  params.append('metadata[batch]', assignedBatch)
  params.append('metadata[items_json]', JSON.stringify(compactItems).slice(0, 490))

  params.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount')
  params.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', isFreeShipping ? '0' : '499')
  params.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'usd')
  params.append(
    'shipping_options[0][shipping_rate_data][display_name]',
    isFreeShipping ? 'Free Standard Shipping (USPS)' : 'Standard Shipping (USPS Ground)'
  )

  cart.forEach((item: any, index: number) => {
    params.append(`line_items[${index}][price_data][currency]`, 'usd')
    params.append(
      `line_items[${index}][price_data][product_data][name]`,
      `${item.product.name} (${item.selectedModel})`
    )
    params.append(
      `line_items[${index}][price_data][product_data][description]`,
      `Material: ${item.material.name} | Color: ${item.color.name} | Strength: ${item.infill.name}`
    )
    params.append(
      `line_items[${index}][price_data][unit_amount]`,
      Math.round(item.unitPrice * 100).toString()
    )
    params.append(`line_items[${index}][quantity]`, String(item.quantity))
  })

  const baseUrl = String(originUrl || 'https://forma3d.vercel.app').replace(/\/+$/, '')
  params.append('success_url', `${baseUrl}/?order=success&session_id={CHECKOUT_SESSION_ID}`)
  params.append('cancel_url', `${baseUrl}/?order=cancelled`)

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const session = await stripeRes.json()
  if (session.url) {
    return res.status(200).json({ url: session.url, batch: assignedBatch })
  }
  return res.status(400).json({ error: session.error?.message || 'Stripe error' })
}
