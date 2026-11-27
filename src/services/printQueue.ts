import type {
  CartItem,
  PrintJobStatus,
  PrintQueueItem,
  PrintQueueOrder,
  QueueBatch,
  QueueStatusSummary,
  WorkshopQueueState,
} from '../types'
import { PRODUCTS, MATERIALS, FILAMENT_COLORS, INFILL_OPTIONS } from '../data/products'

export const BATCH_1_CAP = 5
export const BATCH_2_CAP = 5

const ORDERS_STORAGE_KEY = 'modus_print_queue_orders_v1'
const MANUAL_PAUSE_KEY = 'modus_print_queue_manual_pause_v1'
const PENDING_CART_KEY = 'modus_pending_checkout_cart_v1'

export interface AmsFilamentGroup {
  key: string
  materialName: string
  colorName: string
  colorHex: string
  itemCount: number
  totalMinutes: number
}

export function loadQueueOrders(): PrintQueueOrder[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveQueueOrders(orders: PrintQueueOrder[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
}

export function loadManualPause(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(MANUAL_PAUSE_KEY) === 'true'
}

export function saveManualPause(paused: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MANUAL_PAUSE_KEY, paused ? 'true' : 'false')
}

export function computeQueueStatus(
  orders: PrintQueueOrder[],
  manualPause: boolean
): QueueStatusSummary {
  // Active orders are those not yet shipped
  const activeOrders = orders.filter((o) => o.status !== 'shipped')
  const batch1Orders = activeOrders.filter((o) => o.batch === 'batch_1')
  const batch2Orders = activeOrders.filter((o) => o.batch === 'batch_2_24h')

  const batch1Count = batch1Orders.length
  const batch2Count = batch2Orders.length

  const sumMinutes = (list: PrintQueueOrder[]) =>
    list.reduce(
      (acc, order) =>
        acc + order.items.reduce((s, item) => s + item.printTimeMinutes * item.quantity, 0),
      0
    )

  let state: WorkshopQueueState = 'open'
  if (manualPause || (batch1Count >= BATCH_1_CAP && batch2Count >= BATCH_2_CAP)) {
    state = 'paused'
  } else if (batch1Count >= BATCH_1_CAP) {
    state = 'overflow_24h'
  }

  return {
    state,
    manualPause,
    batch1Count,
    batch2Count,
    batch1Cap: BATCH_1_CAP,
    batch2Cap: BATCH_2_CAP,
    totalActiveCount: activeOrders.length,
    totalCap: BATCH_1_CAP + BATCH_2_CAP,
    batch1Minutes: sumMinutes(batch1Orders),
    batch2Minutes: sumMinutes(batch2Orders),
  }
}

export function getNextAvailableBatch(status: QueueStatusSummary): QueueBatch | null {
  if (status.state === 'paused') return null
  if (status.state === 'overflow_24h') return 'batch_2_24h'
  return 'batch_1'
}

export function savePendingCheckoutCart(cart: CartItem[], batch: QueueBatch): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify({ cart, batch, savedAt: Date.now() }))
}

export function consumePendingCheckoutCart(): { cart: CartItem[]; batch: QueueBatch } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(PENDING_CART_KEY)
    if (!raw) return null
    sessionStorage.removeItem(PENDING_CART_KEY)
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed?.cart) && parsed.cart.length > 0) {
      return {
        cart: parsed.cart,
        batch: parsed.batch === 'batch_2_24h' ? 'batch_2_24h' : 'batch_1',
      }
    }
    return null
  } catch {
    return null
  }
}

export function createOrderFromCart(
  cart: CartItem[],
  options: {
    orderId: string
    stripeSessionId?: string
    batch: QueueBatch
    customerName?: string
    customerEmail?: string
    shippingAddress?: string
  }
): PrintQueueOrder {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const shippingCost = subtotal >= 35 ? 0 : 4.99
  const total = Number((subtotal + shippingCost).toFixed(2))

  const items: PrintQueueItem[] = cart.map((item) => ({
    productId: item.productId,
    productName: item.product.name,
    materialName: item.material.name,
    colorName: item.color.name,
    colorHex: item.color.hex,
    infillName: item.infill.name,
    selectedModel: String(item.selectedModel),
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    printTimeMinutes: Math.round(
      item.product.printSpecs.printTimeMinutes * item.infill.timeMultiplier
    ),
  }))

  return {
    id: options.orderId,
    stripeSessionId: options.stripeSessionId,
    createdAt: new Date().toISOString(),
    customerName: options.customerName || 'Stripe Customer',
    customerEmail: options.customerEmail || 'customer@example.com',
    shippingAddress: options.shippingAddress || 'Verified via Stripe Checkout',
    batch: options.batch,
    status: 'queued',
    subtotal: Number(subtotal.toFixed(2)),
    shippingCost,
    total,
    items,
  }
}

export function getAmsFilamentGroups(orders: PrintQueueOrder[]): AmsFilamentGroup[] {
  const active = orders.filter((o) => o.status === 'queued' || o.status === 'printing')
  const map = new Map<string, AmsFilamentGroup>()

  for (const order of active) {
    for (const item of order.items) {
      const key = `${item.materialName}::${item.colorName}`
      const existing = map.get(key)
      const mins = item.printTimeMinutes * item.quantity
      if (existing) {
        existing.itemCount += item.quantity
        existing.totalMinutes += mins
      } else {
        map.set(key, {
          key,
          materialName: item.materialName,
          colorName: item.colorName,
          colorHex: item.colorHex,
          itemCount: item.quantity,
          totalMinutes: mins,
        })
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.itemCount - a.itemCount)
}

export function updateOrderInList(
  orders: PrintQueueOrder[],
  orderId: string,
  nextStatus: PrintJobStatus,
  trackingNumber?: string
): PrintQueueOrder[] {
  return orders.map((order) => {
    if (order.id !== orderId) return order
    return {
      ...order,
      status: nextStatus,
      trackingNumber: trackingNumber !== undefined ? trackingNumber : order.trackingNumber,
    }
  })
}

export function generateSimulatedOrder(batch: QueueBatch): PrintQueueOrder {
  const p1 = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)]
  const mat = MATERIALS[Math.floor(Math.random() * MATERIALS.length)]
  const col = FILAMENT_COLORS[Math.floor(Math.random() * FILAMENT_COLORS.length)]
  const inf = INFILL_OPTIONS[Math.floor(Math.random() * INFILL_OPTIONS.length)]

  const names = ['Alex Rivera', 'Jordan Chen', 'Taylor Brooks', 'Samira Patel', 'Chris Miller']
  const cities = [
    '742 Maple St, Austin, TX 78704',
    '118 Cedar Ave, Portland, OR 97209',
    '405 Oak Blvd, Raleigh, NC 27601',
    '89 Pinecrest Dr, Denver, CO 80203',
  ]
  const randName = names[Math.floor(Math.random() * names.length)]
  const randAddr = cities[Math.floor(Math.random() * cities.length)]
  const unitPrice = Number((p1.basePrice * mat.priceMultiplier + inf.priceOffset).toFixed(2))
  const shippingCost = unitPrice >= 35 ? 0 : 4.99
  const shortCode = Math.random().toString(36).substring(2, 7).toUpperCase()

  return {
    id: `STRIPE-${shortCode}`,
    stripeSessionId: `cs_test_${shortCode.toLowerCase()}`,
    createdAt: new Date().toISOString(),
    customerName: randName,
    customerEmail: `${randName.toLowerCase().replace(' ', '.')}@example.com`,
    shippingAddress: randAddr,
    batch,
    status: 'queued',
    subtotal: unitPrice,
    shippingCost,
    total: Number((unitPrice + shippingCost).toFixed(2)),
    items: [
      {
        productId: p1.id,
        productName: p1.name,
        materialName: mat.name,
        colorName: col.name,
        colorHex: col.hex,
        infillName: inf.name,
        selectedModel: p1.compatibleModels[0] || 'Universal Standard',
        quantity: 1,
        unitPrice,
        printTimeMinutes: Math.round(p1.printSpecs.printTimeMinutes * inf.timeMultiplier),
      },
    ],
  }
}

export async function fetchPublicQueueStatus(): Promise<QueueStatusSummary | null> {
  try {
    const res = await fetch('/api/queue')
    if (!res.ok) return null
    const data = await res.json()
    if (data?.configured && data.queueStatus) return data.queueStatus
    return null
  } catch {
    return null
  }
}

export async function fetchAdminQueueData(passcode = ''): Promise<{
  configured: boolean
  unauthorized?: boolean
  queueStatus?: QueueStatusSummary
  orders?: PrintQueueOrder[]
  feedbackItems?: any[]
}> {
  try {
    const res = await fetch('/api/queue?admin=1', {
      headers: passcode ? { 'x-admin-passcode': passcode } : {},
    })
    if (res.status === 401) return { configured: true, unauthorized: true }
    if (!res.ok) return { configured: false }
    return await res.json()
  } catch {
    return { configured: false }
  }
}

export async function postAdminQueueAction(
  payload: Record<string, any>,
  passcode = ''
): Promise<boolean> {
  try {
    const res = await fetch('/api/queue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(passcode ? { 'x-admin-passcode': passcode } : {}),
      },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return false
  }
}
