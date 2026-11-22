/**
 * Production Serverless Webhook Handler: Stripe Checkout Fulfillment
 * Listens for `checkout.session.completed` events and formats orders for print farms & shipping labels.
 */

export interface PrintOrderPayload {
  orderId: string
  stripeSessionId: string
  customerEmail: string
  customerName: string
  shippingAddress: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  lineItems: Array<{
    name: string
    quantity: number
    amountTotal: number
    specs: Record<string, string>
  }>
  amountTotal: number
  shippingTotal: number
  createdAt: string
}

export function formatOrderForPrintFarm(session: any, lineItems: any[]): PrintOrderPayload {
  return {
    orderId: `MOD-${Math.floor(10000 + Math.random() * 90000)}`,
    stripeSessionId: session.id,
    customerEmail: session.customer_details?.email || '',
    customerName: session.customer_details?.name || 'Valued Customer',
    shippingAddress: {
      line1: session.shipping_details?.address?.line1,
      line2: session.shipping_details?.address?.line2,
      city: session.shipping_details?.address?.city,
      state: session.shipping_details?.address?.state,
      postal_code: session.shipping_details?.address?.postal_code,
      country: session.shipping_details?.address?.country,
    },
    lineItems: lineItems.map((item) => ({
      name: item.description,
      quantity: item.quantity,
      amountTotal: item.amount_total / 100,
      specs: item.price?.product?.metadata || {},
    })),
    amountTotal: (session.amount_total || 0) / 100,
    shippingTotal: (session.total_details?.amount_shipping || 0) / 100,
    createdAt: new Date().toISOString(),
  }
}
