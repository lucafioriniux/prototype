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

export type ProductCollection = 'Home & Cleaning' | 'Workshop' | 'Gaming' | 'Car Comfort'

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
