import { getSupabaseAdmin, sendResendEmail } from './_supabaseAdmin.js'

function mapOrderRow(row: any) {
  return {
    id: row.id,
    stripeSessionId: row.stripe_session_id || undefined,
    createdAt: row.created_at,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    shippingAddress: row.shipping_address,
    batch: row.batch,
    status: row.status,
    trackingNumber: row.tracking_number || undefined,
    subtotal: Number(row.subtotal || 0),
    shippingCost: Number(row.shipping_cost || 0),
    total: Number(row.total || 0),
    items: Array.isArray(row.items) ? row.items : [],
  }
}

function mapFeedbackRow(row: any) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    email: row.email,
    productName: row.product_name || undefined,
    message: row.message,
    createdAt: row.created_at,
    status: row.status,
  }
}

function computeStatusFromRows(orders: any[], settings: any) {
  const batch1Cap = settings?.batch_1_cap ?? 5
  const batch2Cap = settings?.batch_2_cap ?? 5
  const manualPause = Boolean(settings?.manual_pause)

  const active = orders.filter((o) => o.status !== 'shipped')
  const batch1 = active.filter((o) => o.batch === 'batch_1')
  const batch2 = active.filter((o) => o.batch === 'batch_2_24h')

  const sumMinutes = (list: any[]) =>
    list.reduce(
      (acc, order) =>
        acc +
        (order.items || []).reduce(
          (s: number, i: any) => s + (i.printTimeMinutes || 120) * (i.quantity || 1),
          0
        ),
      0
    )

  let state: 'open' | 'overflow_24h' | 'paused' = 'open'
  if (manualPause || (batch1.length >= batch1Cap && batch2.length >= batch2Cap)) {
    state = 'paused'
  } else if (batch1.length >= batch1Cap) {
    state = 'overflow_24h'
  }

  return {
    state,
    manualPause,
    batch1Count: batch1.length,
    batch2Count: batch2.length,
    batch1Cap,
    batch2Cap,
    totalActiveCount: active.length,
    totalCap: batch1Cap + batch2Cap,
    batch1Minutes: sumMinutes(batch1),
    batch2Minutes: sumMinutes(batch2),
  }
}

function checkAdminAuth(req: any): boolean {
  const configured = process.env.ADMIN_PASSCODE
  if (!configured) return true
  const provided = req.headers['x-admin-passcode']
  return provided === configured
}

export default async function handler(req: any, res: any) {
  const supabaseAdmin = getSupabaseAdmin()

  if (!supabaseAdmin) {
    return res.status(200).json({
      configured: false,
      queueStatus: null,
      orders: [],
      feedbackItems: [],
    })
  }

  if (req.method === 'GET') {
    const isAdmin = req.query?.admin === '1'

    const [{ data: settings }, { data: orderRows }] = await Promise.all([
      supabaseAdmin.from('workshop_settings').select('*').eq('id', 1).single(),
      supabaseAdmin.from('print_orders').select('*').order('created_at', { ascending: false }),
    ])

    const orders = (orderRows || []).map(mapOrderRow)
    const queueStatus = computeStatusFromRows(orders, settings)

    if (!isAdmin) {
      // Public storefront gets ONLY capacity status (no customer PII)
      return res.status(200).json({ configured: true, queueStatus })
    }

    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: 'Invalid admin passcode' })
    }

    const { data: feedbackRows } = await supabaseAdmin
      .from('maker_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    return res.status(200).json({
      configured: true,
      queueStatus,
      orders,
      feedbackItems: (feedbackRows || []).map(mapFeedbackRow),
    })
  }

  if (req.method === 'POST') {
    if (!checkAdminAuth(req)) {
      return res.status(401).json({ error: 'Invalid admin passcode' })
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const { action } = body

    if (action === 'update_status') {
      const { orderId, status, trackingNumber } = body
      const updatePayload: any = { status }
      if (trackingNumber !== undefined) updatePayload.tracking_number = trackingNumber

      const { data: updated, error } = await supabaseAdmin
        .from('print_orders')
        .update(updatePayload)
        .eq('id', orderId)
        .select('*')
        .single()

      if (error) return res.status(500).json({ error: error.message })

      if (status === 'shipped' && updated?.customer_email) {
        await sendResendEmail({
          to: updated.customer_email,
          subject: `Your Forma Order ${updated.id} Has Shipped!`,
          html: `<p>Hi ${updated.customer_name},</p><p>Your custom 3D-printed order (<strong>${updated.id}</strong>) passed our ±0.15mm hand-fit inspection and has shipped via USPS Ground Advantage.${
            updated.tracking_number
              ? `<br/><br/><strong>Tracking Number:</strong> ${updated.tracking_number}`
              : ''
          }</p><p>— Luca, Forma Additive Workshop</p>`,
        })
      }

      return res.status(200).json({ ok: true, order: mapOrderRow(updated) })
    }

    if (action === 'toggle_manual_pause') {
      const { manualPause } = body
      const { error } = await supabaseAdmin
        .from('workshop_settings')
        .update({ manual_pause: Boolean(manualPause), updated_at: new Date().toISOString() })
        .eq('id', 1)

      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }

    if (action === 'clear_shipped') {
      const { error } = await supabaseAdmin.from('print_orders').delete().eq('status', 'shipped')
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }

    if (action === 'insert_order') {
      const { order } = body
      const { error } = await supabaseAdmin.from('print_orders').insert({
        id: order.id,
        stripe_session_id: order.stripeSessionId || null,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        shipping_address: order.shippingAddress,
        batch: order.batch,
        status: order.status,
        subtotal: order.subtotal,
        shipping_cost: order.shippingCost,
        total: order.total,
        items: order.items,
      })
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }

    if (action === 'toggle_feedback_status') {
      const { feedbackId, status } = body
      const { error } = await supabaseAdmin
        .from('maker_feedback')
        .update({ status })
        .eq('id', feedbackId)
      if (error) return res.status(500).json({ error: error.message })
      return res.status(200).json({ ok: true })
    }

    return res.status(400).json({ error: 'Unknown action' })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method Not Allowed' })
}
