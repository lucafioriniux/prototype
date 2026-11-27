export type DysonModel =
  | 'All Models'
  | 'Dyson V8 / V7'
  | 'Dyson V10 Cyclone'
  | 'Dyson V11 Torque'
  | 'Dyson V12 Detect Slim'
  | 'Dyson V15 Detect'
  | 'Dyson Gen5detect'
  | 'Dyson Outsize'

export interface MaterialOption {
  id: string
  name: string
  code: string
  description: string
  benefits: string[]
  recommendedFor: string
  priceMultiplier: number
  durabilityRating: number // 1-5
  flexibilityRating: number // 1-5
}

export interface FilamentColor {
  id: string
  name: string
  hex: string
  borderClass: string
  bgClass: string
  dysonMatch: string
}

export type InfillLevel = 'standard' | 'heavy' | 'solid'

export interface InfillOption {
  id: InfillLevel
  name: string
  percentage: number
  description: string
  timeMultiplier: number
  priceOffset: number
}

export type ProductCollection = 'Household' | 'Workshop' | 'Gaming' | 'Travel'

export interface Product {
  id: string
  name: string
  collection: ProductCollection
  subCollection?: string
  category: string
  basePrice: number
  rating: number
  reviewsCount: number
  summary: string
  description: string
  compatibleModels: string[]
  incompatibleNotes?: string
  printSpecs: {
    weightGrams: number
    printTimeMinutes: number
    layerHeightMm: number
    recommendedMaterial: string
  }
  badge?: string
  features: string[]
  iconType: string
  imageUrl: string
  images?: string[]
}

export interface CartItem {
  cartId: string
  productId: string
  product: Product
  material: MaterialOption
  color: FilamentColor
  infill: InfillOption
  selectedModel: DysonModel | string
  quantity: number
  unitPrice: number
}

export type QueueBatch = 'batch_1' | 'batch_2_24h'
export type WorkshopQueueState = 'open' | 'overflow_24h' | 'paused'
export type PrintJobStatus = 'queued' | 'printing' | 'fit_checked' | 'shipped'

export interface PrintQueueItem {
  productId: string
  productName: string
  materialName: string
  colorName: string
  colorHex: string
  infillName: string
  selectedModel: string
  quantity: number
  unitPrice: number
  printTimeMinutes: number
}

export interface PrintQueueOrder {
  id: string
  stripeSessionId?: string
  createdAt: string
  customerName: string
  customerEmail: string
  shippingAddress: string
  batch: QueueBatch
  status: PrintJobStatus
  trackingNumber?: string
  subtotal: number
  shippingCost: number
  total: number
  items: PrintQueueItem[]
}

export interface QueueStatusSummary {
  state: WorkshopQueueState
  manualPause: boolean
  batch1Count: number
  batch2Count: number
  batch1Cap: number
  batch2Cap: number
  totalActiveCount: number
  totalCap: number
  batch1Minutes: number
  batch2Minutes: number
}

export interface ProductReview {
  id: string
  productId: string
  author: string
  rating: number
  title: string
  comment: string
  configSummary?: string
  photos?: string[]
  createdAt: string
  verified?: boolean
}

export type FeedbackCategory =
  | 'Product Idea / Custom Part'
  | 'Fit & Tolerance Feedback'
  | 'Website Experience'
  | 'Order / General Question'

export interface MakerFeedback {
  id: string
  category: FeedbackCategory
  name: string
  email: string
  productName?: string
  message: string
  createdAt: string
  status: 'unread' | 'resolved'
}
