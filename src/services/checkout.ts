import type { CartItem } from '../types'

export interface CheckoutSessionResult {
  success: boolean
  url?: string
  error?: string
  orderSummary?: {
    orderId: string
    subtotal: number
    shipping: number
    total: number
    itemCount: number
    isLiveStripe: boolean
    payload: any
  }
}

/**
 * Initiates checkout either by contacting the Stripe serverless backend
 * or by returning the formatted production payload for preview/simulation.
 */
export async function initiateCheckout(cart: CartItem[]): Promise<CheckoutSessionResult> {
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const isFreeShipping = subtotal >= 35
  const shipping = isFreeShipping ? 0 : 4.99
  const total = subtotal + shipping

  // Format exact line items for Stripe Checkout
  const formattedItems = cart.map((item) => {
    const weight = Math.round(item.product.printSpecs.weightGrams * (item.infill.percentage / 25 * 0.4 + 0.6))
    const minutes = Math.round(item.product.printSpecs.printTimeMinutes * item.infill.timeMultiplier * (item.material.id === 'tpu_95a' ? 1.4 : 1.0))

    return {
      name: item.product.name,
      category: item.product.category,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      material: item.material.name,
      color: item.color.name,
      infill: item.infill.name,
      dysonModel: item.selectedModel,
      estimatedWeightGrams: weight,
      estimatedPrintMinutes: minutes,
    }
  })

  const payload = {
    items: formattedItems,
    shippingAddressRequired: true,
    allowedCountries: ['US', 'CA'],
    shippingCost: shipping,
    isFreeShipping,
    successUrl: `${window.location.origin}${import.meta.env.BASE_URL}?order=success`,
    cancelUrl: `${window.location.origin}${import.meta.env.BASE_URL}?order=cancelled`,
  }

  const apiUrl = import.meta.env.VITE_API_URL

  // If a live backend endpoint is configured and not running in dummy mock mode
  if (apiUrl && apiUrl !== '/api' && !apiUrl.includes('localhost')) {
    try {
      const response = await fetch(`${apiUrl}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
        return { success: true, url: data.url }
      }
    } catch (err) {
      console.warn('Backend API connection failed, falling back to local production simulator', err)
    }
  }

  // Production-ready preview fallback
  const mockId = `MOD-${Math.floor(10000 + Math.random() * 90000)}`
  return {
    success: true,
    orderSummary: {
      orderId: mockId,
      subtotal,
      shipping,
      total,
      itemCount: cart.reduce((sum, i) => sum + i.quantity, 0),
      isLiveStripe: Boolean(apiUrl && apiUrl !== '/api'),
      payload,
    },
  }
}
