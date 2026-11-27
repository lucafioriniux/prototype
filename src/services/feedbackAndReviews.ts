import type { MakerFeedback, Product, ProductReview } from '../types'

const REVIEWS_STORAGE_KEY = 'forma_product_reviews_v1'
const FEEDBACK_STORAGE_KEY = 'forma_maker_feedback_v1'

const BASELINE_REVIEWS: Record<string, ProductReview[]> = {
  'accessory-storage-wall-mount': [
    {
      id: 'rev-base-1',
      productId: 'accessory-storage-wall-mount',
      author: 'Marcus T.',
      rating: 5,
      title: 'Clicks in just like the factory Dyson dock',
      comment: 'Zero wobble on my V15 attachments. Mounted it inside my laundry closet with two drywall anchors and it feels rock solid.',
      configSummary: 'Outdoor (PETG) • Iron Grey • Stronger',
      createdAt: '2026-10-18T14:20:00Z',
      verified: true,
    },
    {
      id: 'rev-base-2',
      productId: 'accessory-storage-wall-mount',
      author: 'Elena R.',
      rating: 5,
      title: 'Cleanest print finish I have bought online',
      comment: 'No stringing, tight detents, and arrived in 2 days. Finally got all my vacuum heads off the floor.',
      configSummary: 'Indoor + (PLA+) • Matte Stealth Black • Strong',
      createdAt: '2026-11-02T09:15:00Z',
      verified: true,
    },
  ],
  'v15-car-detailing-nozzle-set': [
    {
      id: 'rev-base-3',
      productId: 'v15-car-detailing-nozzle-set',
      author: 'Devon K.',
      rating: 5,
      title: 'Reaches under SUV seat rails effortlessly',
      comment: 'The slim 14mm wand pulled years of crumbs out from between my center console and seats. Zero air whistle.',
      configSummary: 'Indoor + (PLA+) • Iron Grey • Strong',
      createdAt: '2026-10-29T18:40:00Z',
      verified: true,
    },
  ],
  'zero-fatigue-trigger-lock': [
    {
      id: 'rev-base-4',
      productId: 'zero-fatigue-trigger-lock',
      author: 'Hannah L.',
      rating: 5,
      title: 'Saved my index finger on deep-clean days',
      comment: 'Snaps onto my V11 in 5 seconds and flips on/off smoothly with one thumb. Should come with the vacuum.',
      configSummary: 'Indoor + (PLA+) • Signature Fuchsia • Strong',
      createdAt: '2026-11-05T11:10:00Z',
      verified: true,
    },
  ],
}

export function loadUserReviews(): ProductReview[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveUserReviews(reviews: ProductReview[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews))
}

export function getReviewsForProduct(
  productId: string,
  userReviews: ProductReview[]
): ProductReview[] {
  const custom = userReviews.filter((r) => r.productId === productId)
  const baseline = BASELINE_REVIEWS[productId] || [
    {
      id: `rev-default-${productId}`,
      productId,
      author: 'Verified Workshop Buyer',
      rating: 5,
      title: 'Dialed-in tolerances and sturdy build',
      comment: 'Fits snugly right out of the box with a clean matte finish. Fast turnaround from the workshop.',
      configSummary: 'Indoor + (PLA+) • Iron Grey',
      createdAt: '2026-11-08T12:00:00Z',
      verified: true,
    },
  ]
  return [...custom, ...baseline]
}

export function getLiveProductRating(
  product: Product,
  userReviews: ProductReview[]
): { rating: number; count: number } {
  const added = userReviews.filter((r) => r.productId === product.id)
  if (added.length === 0) {
    return { rating: product.rating, count: product.reviewsCount }
  }
  const baseTotal = product.rating * product.reviewsCount
  const addedTotal = added.reduce((sum, r) => sum + r.rating, 0)
  const totalCount = product.reviewsCount + added.length
  return {
    rating: Number(((baseTotal + addedTotal) / totalCount).toFixed(2)),
    count: totalCount,
  }
}

export function loadMakerFeedback(): MakerFeedback[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveMakerFeedback(items: MakerFeedback[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(items))
}
