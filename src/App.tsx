
import { useState, useId, useEffect } from 'react'
import {
  Check,
  X,
  ShoppingBag,
  Search,
  ShieldCheck,
  Moon,
  Sun,
  Layers,
  HelpCircle,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  FileText,
  CheckCircle2,
  Box,
  Cpu,
  RotateCcw,
  UserCheck,
  HeartHandshake,
  Gauge,
  Home,
  Wrench,
  Gamepad2,
  Compass,
  Star,
  Eye,
  Pencil
} from 'lucide-react'
import type {
  DysonModel,
  Product,
  MaterialOption,
  FilamentColor,
  InfillOption,
  CartItem,
  ProductCollection
} from './types'
import {
  DYSON_MODELS,
  MATERIALS,
  FILAMENT_COLORS,
  INFILL_OPTIONS,
  PRODUCTS,
  COLLECTIONS
} from './data/products'
import { Logo } from './components/Logo'
import { initiateCheckout } from './services/checkout'

interface CollectionThemeConfig {
  name: ProductCollection
  badgeLabel: string
  containerBg: string
  containerBorder: string
  gridColor: string
  glow1: string
  glow2: string
  badgePill: string
  tabActive: string
  tabActiveIcon: string
  tabActiveCount: string
  tabInactive: string
  controlBg: string
  controlBorder: string
  searchFocus: string
  categoryActive: string
  modelPillActive: string
  cardHoverBorder: string
  cardCta: string
  accentText: string
}

const COLLECTION_THEMES: Record<ProductCollection, CollectionThemeConfig> = {
  Household: {
    name: 'Household',
    badgeLabel: 'Sage Living • Calibrated Care',
    containerBg: 'bg-[#f4f7f4] dark:bg-gradient-to-b dark:from-[#111915] dark:via-[#0c1310] dark:to-[#080d0b]',
    containerBorder: 'border-[#cbd5cc] dark:border-emerald-900/50',
    gridColor: '#52796f',
    glow1: 'bg-emerald-600/15 dark:bg-emerald-500/12',
    glow2: 'bg-teal-600/10 dark:bg-teal-500/10',
    badgePill: 'bg-emerald-100/90 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    tabActive: 'bg-[#3b5e4c] text-white shadow-md ring-2 ring-[#52796f] scale-[1.01]',
    tabActiveIcon: 'bg-[#284134] text-emerald-200',
    tabActiveCount: 'bg-white/20 text-white',
    tabInactive: 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-stone-800/50',
    controlBg: 'bg-white/95 dark:bg-[#121c17]/90',
    controlBorder: 'border-emerald-200/80 dark:border-emerald-900/50',
    searchFocus: 'focus:border-emerald-600 focus:ring-emerald-500',
    categoryActive: 'bg-[#3b5e4c] text-white shadow-xs',
    modelPillActive: 'bg-[#3b5e4c] text-white font-bold shadow-xs ring-2 ring-[#709782]',
    cardHoverBorder: 'hover:border-emerald-600/50 dark:hover:border-emerald-500/50',
    cardCta: 'bg-[#335645] hover:bg-[#284436] dark:bg-[#3b5e4c] dark:hover:bg-[#48725d] text-white',
    accentText: 'text-emerald-700 dark:text-emerald-400',
  },
  Workshop: {
    name: 'Workshop',
    badgeLabel: 'DeWalt-Grade Industrial • High Load PETG',
    containerBg: 'bg-[#fbfaf3] dark:bg-gradient-to-b dark:from-[#1c180c] dark:via-[#131109] dark:to-[#0a0805]',
    containerBorder: 'border-amber-300/80 dark:border-amber-600/35',
    gridColor: '#eab308',
    glow1: 'bg-yellow-500/15 dark:bg-yellow-500/12',
    glow2: 'bg-amber-500/12 dark:bg-amber-600/10',
    badgePill: 'bg-yellow-400/20 dark:bg-yellow-950/80 border-yellow-500/40 dark:border-yellow-600/60 text-yellow-900 dark:text-yellow-300',
    tabActive: 'bg-yellow-400 text-zinc-950 font-extrabold shadow-md ring-2 ring-yellow-500 scale-[1.01]',
    tabActiveIcon: 'bg-zinc-950 text-yellow-400 font-black',
    tabActiveCount: 'bg-zinc-950/20 text-zinc-950',
    tabInactive: 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-amber-100/50 dark:hover:bg-zinc-800/50',
    controlBg: 'bg-white/95 dark:bg-[#1a170f]/90',
    controlBorder: 'border-amber-300/70 dark:border-amber-900/50',
    searchFocus: 'focus:border-yellow-500 focus:ring-yellow-400',
    categoryActive: 'bg-yellow-400 text-zinc-950 font-bold shadow-xs',
    modelPillActive: 'bg-yellow-400 text-zinc-950 font-bold shadow-xs ring-2 ring-yellow-500',
    cardHoverBorder: 'hover:border-yellow-500/60 dark:hover:border-yellow-400/60',
    cardCta: 'bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-extrabold shadow-sm',
    accentText: 'text-amber-700 dark:text-yellow-400',
  },
  Gaming: {
    name: 'Gaming',
    badgeLabel: 'Battlestation Cyber • Zero-Drag Velocity',
    containerBg: 'bg-[#f0f6ff] dark:bg-gradient-to-br dark:from-[#08152c] dark:via-[#050f20] dark:to-[#030914]',
    containerBorder: 'border-blue-200/90 dark:border-blue-800/40',
    gridColor: '#2563eb',
    glow1: 'bg-blue-600/20 dark:bg-blue-500/18',
    glow2: 'bg-cyan-500/18 dark:bg-cyan-400/14',
    badgePill: 'bg-blue-100/90 dark:bg-blue-950/80 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    tabActive: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold shadow-md shadow-blue-600/30 ring-2 ring-blue-400 scale-[1.01]',
    tabActiveIcon: 'bg-zinc-950 text-cyan-300',
    tabActiveCount: 'bg-white/20 text-white',
    tabInactive: 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-blue-100/50 dark:hover:bg-zinc-800/50',
    controlBg: 'bg-white/95 dark:bg-[#0c1629]/90',
    controlBorder: 'border-blue-200/80 dark:border-blue-900/50',
    searchFocus: 'focus:border-blue-500 focus:ring-blue-400',
    categoryActive: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-xs',
    modelPillActive: 'bg-blue-600 text-white font-bold shadow-xs ring-2 ring-blue-400',
    cardHoverBorder: 'hover:border-blue-500/60 dark:hover:border-blue-400/60',
    cardCta: 'bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-sm shadow-blue-600/25',
    accentText: 'text-blue-600 dark:text-cyan-400',
  },
  Travel: {
    name: 'Travel',
    badgeLabel: 'Luxury Cockpit & Transit • 75°C Heat Proof',
    containerBg: 'bg-[#f9f7fd] dark:bg-gradient-to-b dark:from-[#180f2d] dark:via-[#0e091b] dark:to-[#07050e]',
    containerBorder: 'border-purple-200/90 dark:border-purple-800/40',
    gridColor: '#8b5cf6',
    glow1: 'bg-purple-600/18 dark:bg-purple-600/16',
    glow2: 'bg-violet-500/14 dark:bg-violet-500/12',
    badgePill: 'bg-purple-100/90 dark:bg-purple-950/80 border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-300',
    tabActive: 'bg-purple-700 dark:bg-purple-600 text-white font-extrabold shadow-md shadow-purple-700/25 ring-2 ring-purple-400 scale-[1.01]',
    tabActiveIcon: 'bg-zinc-950 text-purple-300',
    tabActiveCount: 'bg-white/20 text-white',
    tabInactive: 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-purple-100/50 dark:hover:bg-zinc-800/50',
    controlBg: 'bg-white/95 dark:bg-[#160f24]/90',
    controlBorder: 'border-purple-200/80 dark:border-purple-900/50',
    searchFocus: 'focus:border-purple-500 focus:ring-purple-400',
    categoryActive: 'bg-purple-700 dark:bg-purple-600 text-white font-semibold shadow-xs',
    modelPillActive: 'bg-purple-700 text-white font-bold shadow-xs ring-2 ring-purple-400',
    cardHoverBorder: 'hover:border-purple-500/60 dark:hover:border-purple-400/60',
    cardCta: 'bg-purple-700 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-500 text-white font-bold shadow-sm shadow-purple-700/20',
    accentText: 'text-purple-700 dark:text-purple-400',
  },
}

export function App() {
  // Theme state: auto-detect system preference with localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('modus-theme')
    if (saved) return saved === 'dark'
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Collection and Dyson Model Filter state
  const [activeCollection, setActiveCollection] = useState<ProductCollection>('Household')
  const activeTheme = COLLECTION_THEMES[activeCollection]
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
  const [selectedModel, setSelectedModel] = useState<DysonModel>('Dyson V15 Detect')
  const [onlyCompatible, setOnlyCompatible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'time'>('recommended')

  // Modals & Drawers state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null)
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isModelFinderOpen, setIsModelFinderOpen] = useState(false)
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false)
  const [orderConfirmed, setOrderConfirmed] = useState<{
    id: string
    total: number
    count: number
    shipping: number
    subtotal: number
    payload?: any
  } | null>(null)
  const [showStripePayload, setShowStripePayload] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Customizer form state
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(MATERIALS[0])
  const [selectedColor, setSelectedColor] = useState<FilamentColor>(FILAMENT_COLORS[0])
  const [selectedInfill, setSelectedInfill] = useState<InfillOption>(INFILL_OPTIONS[0])
  const [customQuantity, setCustomQuantity] = useState(1)

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([
    {
      cartId: 'item-demo-1',
      productId: 'dual-tool-dock',
      product: PRODUCTS[0],
      material: MATERIALS[0],
      color: FILAMENT_COLORS[0],
      infill: INFILL_OPTIONS[0],
      selectedModel: 'Dyson V15 Detect',
      quantity: 1,
      unitPrice: 16.5,
    },
  ])

  // Model Finder Diagnostic state
  const [diagnosticStep, setDiagnosticStep] = useState<1 | 2>(1)

  // Unique IDs for accessibility
  const searchInputId = useId()
  const sortSelectId = useId()

  // Sync dark mode class to <html> and update localStorage
  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add('dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.style.colorScheme = 'light'
    }
    localStorage.setItem('modus-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Listen to system OS dark mode preference changes
  useEffect(() => {
    if (!window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('modus-theme')
      // Only auto-switch if user hasn't explicitly set a preference override
      if (!saved) {
        setDarkMode(e.matches)
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Check for Stripe return URL params (?order=success&session_id=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const orderStatus = params.get('order')
    const sessionId = params.get('session_id')

    if (orderStatus === 'success') {
      const shortId = sessionId ? `STRIPE-${sessionId.slice(-6).toUpperCase()}` : `MOD-${Math.floor(10000 + Math.random() * 90000)}`
      setOrderConfirmed({
        id: shortId,
        total: 0,
        count: 1,
        shipping: 0,
        subtotal: 0,
        payload: {
          status: 'paid_verified',
          stripeSessionId: sessionId,
          note: 'Payment successfully processed through Stripe Checkout.',
        },
      })
      setCart([])
      // Clean query parameters from URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Keyboard navigation: Escape key closes modals and drawers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (quickViewProduct) setQuickViewProduct(null)
        else if (customizingProduct) {
          setCustomizingProduct(null)
          if (editingCartItemId) {
            setEditingCartItemId(null)
            setIsCartOpen(true)
          }
        }
        else if (isCartOpen) setIsCartOpen(false)
        else if (isModelFinderOpen) setIsModelFinderOpen(false)
        else if (isGuidelinesOpen) setIsGuidelinesOpen(false)
        else if (orderConfirmed) setOrderConfirmed(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [quickViewProduct, customizingProduct, editingCartItemId, isCartOpen, isModelFinderOpen, isGuidelinesOpen, orderConfirmed])

  // Open customizer for a specific product
  const handleOpenCustomizer = (product: Product) => {
    setEditingCartItemId(null)
    setCustomizingProduct(product)
    // Preset recommended material
    const matchedMat = MATERIALS.find(m => m.name === product.printSpecs.recommendedMaterial) || MATERIALS[0]
    setSelectedMaterial(matchedMat)
    setSelectedColor(FILAMENT_COLORS[0])
    setSelectedInfill(INFILL_OPTIONS[0])
    setCustomQuantity(1)
  }

  // Open customizer to re-configure an existing cart item
  const handleEditCartItem = (item: CartItem) => {
    setEditingCartItemId(item.cartId)
    setCustomizingProduct(item.product)
    setSelectedMaterial(item.material)
    setSelectedColor(item.color)
    setSelectedInfill(item.infill)
    setCustomQuantity(item.quantity)
    if (item.product.collection === 'Household' && DYSON_MODELS.includes(item.selectedModel as any)) {
      setSelectedModel(item.selectedModel as DysonModel)
    }
    setIsCartOpen(false)
  }

  // Close customizer modal, restoring cart if editing
  const handleCloseCustomizer = () => {
    const wasEditing = editingCartItemId !== null
    setCustomizingProduct(null)
    setEditingCartItemId(null)
    if (wasEditing) {
      setIsCartOpen(true)
    }
  }

  // Calculate live price for customizer
  const calculateCustomPrice = (product: Product, material: MaterialOption, infill: InfillOption) => {
    const base = product.basePrice * material.priceMultiplier
    return Number((base + infill.priceOffset).toFixed(2))
  }

  // Calculate live print time & weight
  const calculateTelemetry = (product: Product, material: MaterialOption, infill: InfillOption) => {
    const weight = Math.round(product.printSpecs.weightGrams * (infill.percentage / 25 * 0.4 + 0.6))
    const minutes = Math.round(product.printSpecs.printTimeMinutes * infill.timeMultiplier * (material.id === 'tpu_95a' ? 1.4 : 1.0))
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return {
      weightGrams: weight,
      timeFormatted: `${hours}h ${mins}m`,
      minutes,
    }
  }

  // Add customized item to cart or update existing cart item
  const handleAddToCart = () => {
    if (!customizingProduct) return
    const unitPrice = calculateCustomPrice(customizingProduct, selectedMaterial, selectedInfill)
    const modelForCart =
      customizingProduct.collection === 'Household'
        ? (selectedModel === 'All Models' ? 'Dyson V15 Detect' : selectedModel)
        : (customizingProduct.compatibleModels[0] || 'Universal Standard')

    if (editingCartItemId) {
      // Update existing item in cart
      setCart(prev =>
        prev.map(item => {
          if (item.cartId === editingCartItemId) {
            return {
              ...item,
              material: selectedMaterial,
              color: selectedColor,
              infill: selectedInfill,
              selectedModel: modelForCart,
              quantity: customQuantity,
              unitPrice,
            }
          }
          return item
        })
      )
      setEditingCartItemId(null)
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        cartId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        productId: customizingProduct.id,
        product: customizingProduct,
        material: selectedMaterial,
        color: selectedColor,
        infill: selectedInfill,
        selectedModel: modelForCart,
        quantity: customQuantity,
        unitPrice,
      }
      setCart(prev => [newItem, ...prev])
    }
    setCustomizingProduct(null)
    setIsCartOpen(true)
  }

  // Update item quantity in cart
  const updateQuantity = (cartId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.cartId === cartId) {
            const next = item.quantity + delta
            return next > 0 ? { ...item, quantity: next } : null
          }
          return item
        })
        .filter((item): item is CartItem => item !== null)
    )
  }

  // Cart totals
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const freeShippingThreshold = 35
  const freeShippingMet = cartSubtotal >= freeShippingThreshold
  const shippingCost = cartTotalItems === 0 ? 0 : freeShippingMet ? 0 : 4.99
  const orderTotal = cartSubtotal + shippingCost

  // Household subcategories
  const HOUSEHOLD_SUBCATEGORIES = [
    { id: 'all', label: 'All Household' },
    { id: 'dyson', label: 'Dyson Accessories' },
    { id: 'home', label: 'Home Essentials' },
  ] as const

  // Filter products by active collection
  const collectionProducts = PRODUCTS.filter((p) => p.collection === activeCollection)

  const filteredProducts = collectionProducts.filter(product => {
    // Household subcategory filtering
    if (activeCollection === 'Household') {
      if (selectedSubcategory === 'dyson' && product.subCollection !== 'Dyson Precision') {
        return false
      }
      if (selectedSubcategory === 'home' && product.subCollection === 'Dyson Precision') {
        return false
      }

      // Dyson Model compatibility check (revealed & active only when in Household and in Dyson Accessories subcategory)
      if (selectedSubcategory === 'dyson' && selectedModel !== 'All Models') {
        const isCompatible = product.compatibleModels.includes(selectedModel)
        if (onlyCompatible && !isCompatible) return false
      }
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const matchName = product.name.toLowerCase().includes(q)
      const matchDesc = product.description.toLowerCase().includes(q)
      const matchSummary = product.summary?.toLowerCase().includes(q) || false
      const matchCat = product.category.toLowerCase().includes(q)
      if (!matchName && !matchDesc && !matchSummary && !matchCat) return false
    }

    return true
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.basePrice - b.basePrice
    if (sortBy === 'price-desc') return b.basePrice - a.basePrice
    if (sortBy === 'time') return a.printSpecs.printTimeMinutes - b.printSpecs.printTimeMinutes
    return b.rating - a.rating // recommended
  })

  // Model Diagnostic resolver
  const handleDiagnosticSelect = (battery: 'screw' | 'click', display: 'lcd' | 'led' | 'none') => {
    if (battery === 'screw') {
      setSelectedModel('Dyson V8 / V7')
    } else if (display === 'lcd') {
      setSelectedModel('Dyson V15 Detect')
    } else {
      setSelectedModel('Dyson V10 Cyclone')
    }
    setIsModelFinderOpen(false)
    setDiagnosticStep(1)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      {/* WCAG Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 font-medium text-sm"
      >
        Skip to main content
      </a>

      {/* Top Banner: Manufacturing Guarantee & Accessibility status */}
      <div className="bg-zinc-900 text-zinc-300 text-xs py-2 px-4 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <UserCheck className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            Independent Solo Workshop • Hand-Calibrated & Inspected
          </span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline text-zinc-400">
            Work directly with the maker • Protected batch queue (zero backorders)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            Workshop Queue: Open (Orders Capped Daily for Quality)
          </span>
          <span className="hidden sm:inline text-zinc-600">|</span>
          <button
            onClick={() => setIsGuidelinesOpen(true)}
            className="text-zinc-400 hover:text-white flex items-center gap-1 underline underline-offset-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded px-1"
          >
            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
            View Design Guidelines
          </button>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <Logo size="md" />

          {/* Search, Theme, Cart Actions */}
          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Switcher */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 transition"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 font-semibold text-sm shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
              aria-label={`Open shopping cart with ${cartTotalItems} items`}
            >
              <ShoppingBag className="w-4 h-4 text-cyan-400 dark:text-cyan-600" aria-hidden="true" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-cyan-500 text-zinc-950 text-xs font-extrabold px-2 py-0.5 rounded-full" aria-live="polite">
                {cartTotalItems}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Landmark */}
      <main id="main-content" className="flex-1 w-full space-y-8">
        {/* Hero Section Container */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
          {/* Hero Section */}
        {/* Hero Section with Cinematic Showcase, Rich Intro & Top Selling CTA */}
        <section
          aria-labelledby="hero-heading"
          className="relative rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-white"
        >
          {/* Subtle Industrial Background Grid & Radial Glow */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" aria-hidden="true" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 p-6 sm:p-10 lg:p-12 space-y-10">
            {/* Hero Header & Intro Text */}
            <div className="w-full space-y-4">
              <h1 id="hero-heading" className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Modus 3D
                <span className="block text-2xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-200 mt-2">
                  Thoughtfully Designed. Precisely Made.
                </span>
              </h1>
              <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
                Functional 3D printed accessories for your daily environment—designed, printed, and hand-inspected in my independent workshop. Explore precision upgrades across <strong>Household</strong> (featuring Dyson), <strong>Workshop</strong>, <strong>Gaming</strong>, and <strong>Travel</strong>. Every upgrade is crafted on-demand in <strong>PLA, PLA+, or heat-resistant PETG</strong> with calibrated snap-fit detents.
              </p>
            </div>

            {/* Cinematic High Quality Hero Image Showcase Container (16:9) */}
            <div className="relative rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl bg-zinc-950 group">
              <div className="relative aspect-[16/9] w-full overflow-hidden">
                <img
                  src={`${import.meta.env.BASE_URL}hero.jpg`}
                  alt="Independent precision 3D printing workshop with active CoreXY printers, CAD slicer workstation, and custom additive tool wall"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>
        </div>

        {/* Full-Width 4-Pillar Engineering & Trust Stripe Directly Below Hero */}
        <section
          aria-label="Engineering guarantees and customer trust"
          className="w-full bg-zinc-100/90 dark:bg-zinc-900 border-y border-zinc-200/90 dark:border-zinc-800 relative overflow-hidden py-8 sm:py-10 shadow-xs dark:shadow-inner transition-colors duration-200"
        >
          {/* Subtle Industrial Background Grid & Radial Glow */}
          <div
            className="absolute inset-0 opacity-25 dark:opacity-15 bg-[radial-gradient(#0891b2_1px,transparent_1px)] dark:bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"
            aria-hidden="true"
          />
          <div className="absolute -top-12 left-1/4 w-72 h-36 bg-cyan-400/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-12 right-1/4 w-72 h-36 bg-purple-400/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/60 shadow-xs dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-500/20 shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug">±0.15mm Hand-Fit Check</h4>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Every piece is physically test-fit on authentic Dyson wands before shipping.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/60 shadow-xs dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-500/20 shrink-0">
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug">PLA, PLA+ & PETG</h4>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">From cost-efficient home docks to 75°C heat-resistant utility prints.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/60 shadow-xs dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-200/60 dark:border-cyan-500/20 shrink-0">
                  <Gauge className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug">Protected Order Queue</h4>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Orders are capped at workshop capacity to prevent massive backorders.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950/40 border border-zinc-200/80 dark:border-zinc-800/60 shadow-xs dark:shadow-none hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20 shrink-0">
                  <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug">100% Direct Maker Care</h4>
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">No bots, ticket queues, or phone trees. Work directly with the person who built it.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* THEMED CATALOG COLLECTIONS SECTION WRAPPER               */}
        {/* ======================================================== */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-8">
          <section
            id="catalog-collections"
            aria-labelledby="catalog-collections-heading"
            className={`relative rounded-3xl border shadow-2xl overflow-hidden transition-all duration-500 ${activeTheme.containerBg} ${activeTheme.containerBorder} p-6 sm:p-10 lg:p-12 space-y-8`}
          >
            {/* Ambient Background Grid & Subtle Collection Radial Glows */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none transition-opacity duration-500"
              style={{
                backgroundImage: `radial-gradient(${activeTheme.gridColor} 1px, transparent 1px)`,
                backgroundSize: '20px 20px',
              }}
              aria-hidden="true"
            />
            <div
              className={`absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${activeTheme.glow1}`}
              aria-hidden="true"
            />
            <div
              className={`absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${activeTheme.glow2}`}
              aria-hidden="true"
            />

            {/* Content Container */}
            <div className="relative z-10 space-y-8">
              {/* Catalog Section Header: Title & Subtitle + Active Collection Status */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2
                    id="catalog-collections-heading"
                    className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-white"
                  >
                    Catalog collections
                  </h2>
                  <p className="mt-1 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 font-medium">
                    Explore items by collection
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {filteredProducts.length} items
                  </span>{' '}
                  available in {activeCollection} • Sliced on demand
                </div>
              </div>

              {/* 4-way Tactile Collection Switcher Tabs */}
              <div
                role="tablist"
                aria-label="Product collections"
                className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 p-2 rounded-2xl bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-inner"
              >
                {COLLECTIONS.map((col) => {
                  const isActive = activeCollection === col.id
                  const count = PRODUCTS.filter((p) => p.collection === col.id).length
                  const IconComponent =
                    col.id === 'Household'
                      ? Home
                      : col.id === 'Workshop'
                      ? Wrench
                      : col.id === 'Gaming'
                      ? Gamepad2
                      : Compass

                  return (
                    <button
                      key={col.id}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => {
                        setActiveCollection(col.id)
                        setSelectedSubcategory('all')
                      }}
                      className={`group relative flex items-center gap-3 p-3 sm:p-3.5 rounded-xl transition-all duration-200 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        isActive
                          ? activeTheme.tabActive
                          : activeTheme.tabInactive
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          isActive
                            ? activeTheme.tabActiveIcon
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs sm:text-sm truncate">
                            {col.label}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                              isActive
                                ? activeTheme.tabActiveCount
                                : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                            }`}
                          >
                            {count}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-80 truncate hidden sm:block">
                          {col.id === 'Household' ? 'Home & Living' : col.headline.replace(/^Rugged |^Battlestation & |^Automotive & /, '')}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Filter, Search & Compatibility Control Bar */}
              <div
                aria-labelledby="catalog-controls-heading"
                className={`rounded-2xl p-4 sm:p-6 border backdrop-blur-sm shadow-xs space-y-4 transition-colors duration-300 ${activeTheme.controlBg} ${activeTheme.controlBorder}`}
              >
                <h3 id="catalog-controls-heading" className="sr-only">Product Search and Filter Controls</h3>

                {/* Top Row: Search Input + Sorting + Help Diagnostic */}
                <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <label htmlFor={searchInputId} className="sr-only">Search 3D printed accessories</label>
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    <input
                      id={searchInputId}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={activeCollection === 'Household' ? 'Search accessories (e.g. wall mount, car nozzle, trigger lock)...' : `Search ${activeCollection} accessories...`}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/80 text-sm text-zinc-900 dark:text-zinc-100 border border-transparent ${activeTheme.searchFocus} focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 transition`}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search text"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-full cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  {/* Quick Sort */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label htmlFor={sortSelectId} className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Sort:
                      </label>
                      <select
                        id={sortSelectId}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className={`bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 rounded-xl px-3 py-2 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 ${activeTheme.searchFocus} cursor-pointer`}
                      >
                        <option value="recommended">Highest Rated</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="time">Fastest Print Time</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Subcategory Row: Rendered when Household is active */}
                {activeCollection === 'Household' && (
                  <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Household subcategories">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline mr-1">
                        Subcategory:
                      </span>
                      {HOUSEHOLD_SUBCATEGORIES.map((subcat) => {
                        const isActive = selectedSubcategory === subcat.id
                        return (
                          <button
                            key={subcat.id}
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setSelectedSubcategory(subcat.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                              isActive
                                ? activeTheme.categoryActive
                                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {subcat.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Filter by Dyson Model: Revealed ONLY when Household is active AND Dyson Accessories subcategory is selected */}
                {activeCollection === 'Household' && selectedSubcategory === 'dyson' && (
                  <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                          Filter by Your Dyson Model:
                        </span>
                        <span className="hidden sm:inline text-xs text-zinc-300 dark:text-zinc-600">•</span>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Guaranteed fit detection & calibration
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsModelFinderOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition cursor-pointer"
                          title="Don't know your model? Take the quick 2-step diagnostic"
                        >
                          <HelpCircle className={`w-3.5 h-3.5 ${activeTheme.accentText}`} aria-hidden="true" />
                          <span>Find My Model</span>
                        </button>

                        {selectedModel !== 'All Models' && (
                          <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-700">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                              <input
                                type="checkbox"
                                checked={onlyCompatible}
                                onChange={(e) => setOnlyCompatible(e.target.checked)}
                                className="w-3.5 h-3.5 rounded text-zinc-900 dark:text-white border-zinc-400"
                              />
                              <span className="hidden sm:inline">Only 100% Fit for {selectedModel}</span>
                              <span className="sm:hidden">100% Fit</span>
                            </label>
                            <button
                              onClick={() => {
                                setSelectedModel('All Models')
                                setOnlyCompatible(false)
                              }}
                              className={`text-xs ${activeTheme.accentText} hover:underline cursor-pointer font-medium`}
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Model Filter Pills */}
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select Dyson model">
                      {DYSON_MODELS.map((model) => {
                        const isSelected = selectedModel === model
                        return (
                          <button
                            key={model}
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => setSelectedModel(model)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
                              isSelected
                                ? activeTheme.modelPillActive
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" aria-hidden="true" />}
                            {model}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* For non-household collections: concise description line */}
                {activeCollection !== 'Household' && (
                  <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <span className="font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                        {COLLECTIONS.find((c) => c.id === activeCollection)?.headline}
                      </span>
                      <span className="hidden sm:inline text-zinc-300 dark:text-zinc-600">•</span>
                      <span className="hidden sm:inline">
                        {COLLECTIONS.find((c) => c.id === activeCollection)?.description}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 id="products-heading" className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>{activeCollection} Catalog</span>
                    <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                      ({filteredProducts.length} items available)
                    </span>
                  </h3>

                  {activeCollection === 'Household' && selectedSubcategory === 'dyson' && selectedModel !== 'All Models' && (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${activeTheme.accentText}`} aria-hidden="true" />
                      Active Model Filter: <strong className="text-zinc-800 dark:text-zinc-200">{selectedModel}</strong>
                    </span>
                  )}
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center space-y-4">
                    <Box className="w-12 h-12 text-zinc-400 mx-auto" aria-hidden="true" />
                    <h4 className="text-base font-semibold text-zinc-900 dark:text-white">
                      No matching accessories found
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                      No parts match your current search and compatibility criteria. Try turning off "Only 100% Fit" or selecting "All Models".
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSubcategory('all')
                        setSelectedModel('All Models')
                        setSearchQuery('')
                        setOnlyCompatible(false)
                      }}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product) => {
                      return (
                        <article
                          key={product.id}
                          className={`flex flex-col justify-between rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 ${activeTheme.cardHoverBorder}`}
                        >
                          <div>
                            {/* Product Preview Header Image with Quick View Trigger */}
                            <div
                              onClick={() => setQuickViewProduct(product)}
                              className="relative h-48 bg-zinc-900 overflow-hidden group/img cursor-pointer"
                              title={`Click to preview ${product.name}`}
                            >
                              <img
                                src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.BASE_URL}${product.imageUrl}`}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 via-transparent to-transparent pointer-events-none" />

                              {/* Bestseller Tag Only */}
                              {product.badge && (
                                <div className="absolute top-3 left-3 z-10">
                                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-zinc-900/90 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md backdrop-blur-xs">
                                    {product.badge}
                                  </span>
                                </div>
                              )}

                              {/* Quick View Hover Action Pill */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 bg-zinc-950/30 backdrop-blur-[2px]">
                                <span className="px-3.5 py-2 rounded-xl bg-white/95 dark:bg-zinc-900/95 text-zinc-900 dark:text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transform translate-y-1 group-hover/img:translate-y-0 transition-transform">
                                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                                  Quick View
                                </span>
                              </div>
                            </div>

                            {/* Product Body */}
                            <div className="p-5 space-y-2.5">
                              <div>
                                <h4
                                  onClick={() => setQuickViewProduct(product)}
                                  className="font-bold text-base text-zinc-900 dark:text-white leading-snug cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                                  title={`View details for ${product.name}`}
                                >
                                  {product.name}
                                </h4>
                              </div>

                              {/* Amazon-Style Rating Stars */}
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {product.rating.toFixed(1)}
                                </span>
                                <div className="flex items-center text-amber-400" aria-label={`${product.rating} out of 5 stars`}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-3.5 h-3.5 ${
                                        star <= Math.round(product.rating)
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'fill-zinc-200 dark:fill-zinc-700 text-zinc-300 dark:text-zinc-600'
                                      }`}
                                      aria-hidden="true"
                                    />
                                  ))}
                                </div>
                                <span className="text-zinc-500 dark:text-zinc-400 text-[11px] font-medium">
                                  ({product.reviewsCount.toLocaleString()})
                                </span>
                              </div>

                              {/* Concise Summary Description */}
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                                {product.summary}
                              </p>
                            </div>
                          </div>

                          {/* Product Card Footer */}
                          <div className="p-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                            <div>
                              <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Base Price</span>
                              <span className="text-lg font-extrabold text-zinc-900 dark:text-white">
                                ${product.basePrice.toFixed(2)}
                              </span>
                            </div>

                            <button
                              onClick={() => handleOpenCustomizer(product)}
                              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition focus-visible:outline-none focus-visible:ring-2 ${activeTheme.cardCta}`}
                              aria-label={`Configure and order ${product.name}`}
                            >
                              <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
                              Configure & Order
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* ======================================================== */}
        {/* SNAPSHOT STAGGERED SECTION: SOLO MAKER & ADDITIVE CRAFT */}
        {/* ======================================================== */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-8 space-y-8">
          <section aria-labelledby="why-additive-heading" className="space-y-8 py-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 text-xs font-bold tracking-wider uppercase">
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Human Craftsmanship • Additive Precision
            </div>
            <h2 id="why-additive-heading" className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
              Crafted by a Human. Not a Mass Factory.
            </h2>
            <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-400 font-medium">
              Why working directly with an independent solo maker beats faceless injection molders and automated drop-shippers.
            </p>
          </div>

          {/* Burst 1: Mechanical Snap-Fit Precision (Text Left, Stat Right) */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-10 shadow-xs hover:border-cyan-500/40 transition">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold tracking-widest uppercase text-cyan-500 dark:text-cyan-400">
                  01 • Micro-Precision
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-snug">
                  ±0.15mm Hand-Fit. <span className="text-cyan-500 dark:text-cyan-400">Zero Wand Wobble.</span>
                </h3>
                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                  Mass molders accept loose ±0.50mm tolerances because retooling costs tens of thousands. Because I personally slice, print, and physically test-fit every piece, every detent clicks with factory Dyson tactility and zero suction leaks.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    ✓ Factory Tactile Snap
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    ✓ Physically Test-Fitted
                  </span>
                </div>
              </div>

              {/* Big Stat Snapshot Card */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-center space-y-2">
                <span className="text-5xl sm:text-7xl font-black tracking-tight text-cyan-500">
                  ±0.15<span className="text-3xl sm:text-4xl">mm</span>
                </span>
                <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  Laser & Hand Verified Fit
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  vs ±0.50mm loose injection mold slop
                </span>
              </div>
            </div>
          </div>

          {/* Burst 2: Quality-Capped Queue & Zero Backorders (Stat Left, Text Right) */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-10 shadow-xs hover:border-pink-500/40 transition">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Big Stat Snapshot Card (Left on Desktop) */}
              <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-center space-y-2">
                <span className="text-5xl sm:text-7xl font-black tracking-tight text-pink-500">
                  48 <span className="text-3xl sm:text-4xl">Hours</span>
                </span>
                <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  Print Bed to Mailbox Dispatch
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  vs months of overseas backorders
                </span>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
                <span className="text-xs font-bold tracking-widest uppercase text-pink-500 dark:text-pink-400">
                  02 • Capacity Protection
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-snug">
                  Quality-Capped Queue. <span className="text-pink-500 dark:text-pink-400">Zero Backorder Limbo.</span>
                </h3>
                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                  I refuse to run an order sweatshop where backorders spiral out of control. When my print capacity is reached, new orders temporarily pause so every piece gets the attention it deserves and ships within 48 hours. Small batch buffers keep top sellers ready to go.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    ✓ Protected 48h Turnaround
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    ✓ Small Batch Buffer Inventory
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Burst 3: Purpose-Engineered Polymers (Text Left, Stat Right) */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-10 shadow-xs hover:border-purple-500/40 transition">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-bold tracking-widest uppercase text-purple-500 dark:text-purple-400">
                  03 • Polymer Science
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-snug">
                  Engineered Polymers. <span className="text-purple-500 dark:text-purple-400">Not Brittle Plastic.</span>
                </h3>
                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                  Big box sellers use brittle commodity plastic that snaps after a few months of tool swapping. I print in cost-efficient <strong>PLA</strong> for home docks, impact-modified <strong>PLA+</strong> for daily tool swapping, and industrial heat-resistant <strong>PETG</strong> (rated to 75°C) for utility vans, garages, and heavy mechanical strain.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    ✓ PLA • Cost-Efficient
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    ✓ PLA+ • 3x Impact Toughness
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    ✓ PETG • 75°C Heat Resistance
                  </span>
                </div>
              </div>

              {/* Big Stat Snapshot Card */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-center space-y-2">
                <span className="text-5xl sm:text-7xl font-black tracking-tight text-purple-500">
                  75°<span className="text-3xl sm:text-4xl">C</span>
                </span>
                <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  PETG Heat Deflection Ceiling
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Resists hot vans, garages & heavy structural strain
                </span>
              </div>
            </div>
          </div>

          {/* Burst 4: The Human Connection Over Automated Bots (Stat Left, Text Right) */}
          <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-10 shadow-xs hover:border-emerald-500/40 transition">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Big Stat Snapshot Card (Left on Desktop) */}
              <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col items-center justify-center p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-center space-y-2">
                <span className="text-5xl sm:text-7xl font-black tracking-tight text-emerald-500">
                  1 : 1
                </span>
                <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  Direct Human Connection
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Zero bots, outsourced tiers, or automated phone trees
                </span>
              </div>

              <div className="lg:col-span-7 order-1 lg:order-2 space-y-4">
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-500 dark:text-emerald-400">
                  04 • Direct Craftsmanship
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight leading-snug">
                  A Real Human Maker. <span className="text-emerald-500 dark:text-emerald-400">Zero Automated Bots.</span>
                </h3>
                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                  While large organizations replace their people with generative chatbots and ticket trees, I run this as an authentic human craft. When you have a question, need a custom fit, or request a tweak, you talk directly to the person who designed the CAD, calibrated the machine, and boxed your order.
                </p>
                <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    ✓ Direct Maker Support
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                    ✓ 100% Personal Accountability
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="space-y-1">
            <Logo size="sm" showTagline={false} />
            <p className="mt-1 font-medium text-zinc-700 dark:text-zinc-300">
              Independent solo additive workshop operated with pride in the USA. Designed, printed, calibrated, and packed by Luca.
            </p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              Not affiliated with Dyson Ltd. Dyson, V8, V10, V11, V12, V15, and Gen5detect are registered trademarks of Dyson Ltd.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsGuidelinesOpen(true)}
              className="hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded p-1"
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              Design & Accessibility Guidelines
            </button>
            <span aria-hidden="true">•</span>
            <a
              href="https://github.com/lucafioriniux/prototype"
              target="_blank"
              rel="noreferrer"
              className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded p-1"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* QUICK VIEW PREVIEW MODAL                                 */}
      {/* ======================================================== */}
      {quickViewProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quickview-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setQuickViewProduct(null)
          }}
        >
          <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            {/* Close Button Top Right */}
            <button
              onClick={() => setQuickViewProduct(null)}
              aria-label="Close product preview"
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer backdrop-blur-xs shadow-xs"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Visual Showcase (Left) */}
              <div className="relative bg-zinc-950 flex flex-col justify-between overflow-hidden min-h-[300px] md:min-h-[460px]">
                <img
                  src={quickViewProduct.imageUrl.startsWith('http') ? quickViewProduct.imageUrl : `${import.meta.env.BASE_URL}${quickViewProduct.imageUrl}`}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
                  {quickViewProduct.badge && (
                    <span className="px-3 py-1 rounded-md text-xs font-bold tracking-wider uppercase bg-zinc-900/90 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md backdrop-blur-xs">
                      {quickViewProduct.badge}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-zinc-900/80 text-zinc-200 border border-zinc-700/60 backdrop-blur-xs">
                    {quickViewProduct.collection}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-xs text-zinc-300 backdrop-blur-xs bg-zinc-950/70 p-3 rounded-xl border border-zinc-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    Hand-Inspected & Calibrated Fit
                  </span>
                  <span className="text-zinc-400 text-[11px]">Direct Maker Build</span>
                </div>
              </div>

              {/* Product Information & Action (Right) */}
              <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Collection Label */}
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {quickViewProduct.collection} Collection
                  </div>

                  {/* Title */}
                  <h3 id="quickview-title" className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                    {quickViewProduct.name}
                  </h3>

                  {/* Amazon-Style Rating & Review Count */}
                  <div className="flex items-center gap-2 pt-1 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                    <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                      {quickViewProduct.rating.toFixed(1)}
                    </span>
                    <div className="flex items-center text-amber-400" aria-label={`${quickViewProduct.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(quickViewProduct.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-zinc-200 dark:fill-zinc-700 text-zinc-300 dark:text-zinc-600'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      ({quickViewProduct.reviewsCount.toLocaleString()} customer reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="space-y-0.5">
                    <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Base Price</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-zinc-900 dark:text-white">
                        ${quickViewProduct.basePrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        • Customize filament & infill next
                      </span>
                    </div>
                  </div>

                  {/* In-depth Description */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Overview
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-h-36 overflow-y-auto pr-1">
                      {quickViewProduct.description}
                    </p>
                  </div>

                  {/* Key Features */}
                  {quickViewProduct.features && quickViewProduct.features.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        Key Features
                      </h4>
                      <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                        {quickViewProduct.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-3">
                  <button
                    onClick={() => {
                      const prod = quickViewProduct
                      setQuickViewProduct(null)
                      handleOpenCustomizer(prod)
                    }}
                    className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${COLLECTION_THEMES[quickViewProduct.collection].cardCta}`}
                  >
                    <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                    <span>Configure & Order (${quickViewProduct.basePrice.toFixed(2)})</span>
                  </button>
                  <button
                    onClick={() => setQuickViewProduct(null)}
                    className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: 3D PRINT CUSTOMIZER & ORDER BUILDER             */}
      {/* ======================================================== */}
      {customizingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="customizer-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  {editingCartItemId && <Pencil className="w-3 h-3" />}
                  {editingCartItemId ? 'Edit Cart Configuration' : 'Custom 3D Print Configurator'}
                </span>
                <h2 id="customizer-title" className="text-xl font-bold text-zinc-900 dark:text-white">
                  {customizingProduct.name}
                </h2>
              </div>
              <button
                onClick={handleCloseCustomizer}
                aria-label="Close customizer"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Product Photograph & Live Filament Simulation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative h-32 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700/60 bg-zinc-900">
                  <img
                    src={customizingProduct.imageUrl.startsWith('http') ? customizingProduct.imageUrl : `${import.meta.env.BASE_URL}${customizingProduct.imageUrl}`}
                    alt={customizingProduct.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-2 left-3 text-[11px] font-semibold text-white/90">
                    3D Print Geometry
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300 flex-shrink-0"
                    style={{ backgroundColor: selectedColor.hex }}
                  >
                    <Layers className="w-8 h-8 text-white/90 drop-shadow" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block truncate">
                      Filament Preview
                    </span>
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                      {selectedColor.name}
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {selectedMaterial.name} ({selectedInfill.name})
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Color Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block">
                    1. Select Filament Color Match
                  </label>
                  <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                    Selected: {selectedColor.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {FILAMENT_COLORS.map((col) => {
                    const isSelected = selectedColor.id === col.id
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20 shadow-xs'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/20 flex-shrink-0 shadow-xs"
                          style={{ backgroundColor: col.hex }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate text-zinc-900 dark:text-white">
                            {col.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate">
                            {col.dysonMatch}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Print Material Choice (PLA, PLA+, PETG) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block">
                    2. Select Print Material
                  </label>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    PLA (Most Cost-Efficient) → PETG (Strongest)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MATERIALS.map((mat) => {
                    const isSelected = selectedMaterial.id === mat.id
                    const badgeText =
                      mat.id === 'pla'
                        ? 'Most Cost-Efficient'
                        : mat.id === 'pla_plus'
                        ? 'Reinforced & Balanced'
                        : 'Strongest • Industrial'
                    const badgeColor =
                      mat.id === 'pla'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : mat.id === 'pla_plus'
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800'
                        : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800'

                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => setSelectedMaterial(mat)}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20 text-zinc-900 dark:text-white shadow-xs'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-white">{mat.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-cyan-500" aria-hidden="true" />}
                          </div>

                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border mb-2 ${badgeColor}`}>
                            {badgeText}
                          </span>

                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                            {mat.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-medium text-zinc-500 flex justify-between">
                          <span>Durability</span>
                          <span className="font-bold text-zinc-700 dark:text-zinc-300">
                            {'★'.repeat(mat.durabilityRating)}{'☆'.repeat(5 - mat.durabilityRating)}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. Infill & Density Profile */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block">
                  3. Infill Density & Strength
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {INFILL_OPTIONS.map((inf) => {
                    const isSelected = selectedInfill.id === inf.id
                    return (
                      <button
                        key={inf.id}
                        type="button"
                        onClick={() => setSelectedInfill(inf)}
                        className={`p-3 rounded-xl border text-left transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-500/20 shadow-xs'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-zinc-900 dark:text-white">{inf.name}</span>
                          <span className="text-[10px] font-semibold text-zinc-500">
                            {inf.priceOffset === 0 ? 'Included' : `+$${inf.priceOffset.toFixed(2)}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                          {inf.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Telemetry Summary Panel */}
              {(() => {
                const telem = calculateTelemetry(customizingProduct, selectedMaterial, selectedInfill)
                const unitPrice = calculateCustomPrice(customizingProduct, selectedMaterial, selectedInfill)
                return (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Est. Print Time</span>
                      <span className="font-mono font-bold text-sm text-zinc-900 dark:text-white">{telem.timeFormatted}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Filament Weight</span>
                      <span className="font-mono font-bold text-sm text-zinc-900 dark:text-white">{telem.weightGrams}g</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-zinc-500 block">Configured Price</span>
                      <span className="font-mono font-extrabold text-sm text-cyan-600 dark:text-cyan-400">${unitPrice.toFixed(2)}</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
              {/* Quantity */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-500">Qty:</span>
                <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                  <button
                    onClick={() => setCustomQuantity(Math.max(1, customQuantity - 1))}
                    aria-label="Decrease quantity"
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                  <span className="px-3 text-xs font-bold font-mono text-zinc-900 dark:text-white">
                    {customQuantity}
                  </span>
                  <button
                    onClick={() => setCustomQuantity(customQuantity + 1)}
                    aria-label="Increase quantity"
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Add or Update Cart button */}
              <button
                onClick={handleAddToCart}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-md transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 cursor-pointer"
              >
                {editingCartItemId ? (
                  <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Update Cart • ${(calculateCustomPrice(customizingProduct, selectedMaterial, selectedInfill) * customQuantity).toFixed(2)}
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                    Add to Cart • ${(calculateCustomPrice(customizingProduct, selectedMaterial, selectedInfill) * customQuantity).toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DRAWER: SHOPPING CART & CHECKOUT SIMULATOR              */}
      {/* ======================================================== */}
      {isCartOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
          className="fixed inset-0 z-50 flex justify-end bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-zinc-200 dark:border-zinc-800">
            {/* Drawer Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                <h2 id="cart-drawer-title" className="font-bold text-lg text-zinc-900 dark:text-white">
                  Your 3D Print Queue
                </h2>
                <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold px-2 py-0.5 rounded-full">
                  {cartTotalItems}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Free Shipping Meter */}
            <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {freeShippingMet
                    ? '🎉 Free Expedited Shipping Unlocked!'
                    : `Add $${(freeShippingThreshold - cartSubtotal).toFixed(2)} more for Free Shipping`}
                </span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  ${cartSubtotal.toFixed(2)} / ${freeShippingThreshold}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (cartSubtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Click to Edit Hint */}
            {cart.length > 0 && (
              <div className="px-6 py-2 bg-cyan-50/60 dark:bg-cyan-950/20 border-b border-cyan-100 dark:border-cyan-900/30 text-[11px] text-cyan-800 dark:text-cyan-300 flex items-center gap-1.5">
                <Pencil className="w-3 h-3 text-cyan-500 shrink-0" aria-hidden="true" />
                <span>Tip: Click any item below to edit its material, color, or infill</span>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Box className="w-12 h-12 text-zinc-400 mx-auto" aria-hidden="true" />
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">Your print queue is empty</p>
                  <p className="text-xs text-zinc-500">Configure an attachment to start printing.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.cartId}
                    onClick={() => handleEditCartItem(item)}
                    className="group/cartitem p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 space-y-2.5 shadow-xs hover:border-cyan-500/60 dark:hover:border-cyan-500/50 hover:shadow-md transition cursor-pointer"
                    title={`Click to edit configuration for ${item.product.name}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight group-hover/cartitem:text-cyan-600 dark:group-hover/cartitem:text-cyan-400 transition-colors">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3 h-3" aria-hidden="true" /> Fit: {item.selectedModel}
                          </span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                            <Pencil className="w-2.5 h-2.5" aria-hidden="true" /> Edit
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          updateQuantity(item.cartId, -item.quantity)
                        }}
                        aria-label={`Remove ${item.product.name} from cart`}
                        className="text-zinc-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700/60 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Material & Color Specs Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700/80 font-medium text-zinc-700 dark:text-zinc-300">
                        {item.material.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700/80 font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block border border-black/10"
                          style={{ backgroundColor: item.color.hex }}
                          aria-hidden="true"
                        />
                        {item.color.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-700/80 font-medium text-zinc-700 dark:text-zinc-300">
                        {item.infill.name}
                      </span>
                    </div>

                    {/* Quantity & Subtotal */}
                    <div
                      className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-700/60"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                        <button
                          onClick={() => updateQuantity(item.cartId, -1)}
                          aria-label="Decrease quantity"
                          className="px-2 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" aria-hidden="true" />
                        </button>
                        <span className="px-2 text-xs font-bold font-mono text-zinc-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, 1)}
                          aria-label="Increase quantity"
                          className="px-2 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-zinc-900 dark:text-white block">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          ${item.unitPrice.toFixed(2)} each
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Manufacturing Subtotal</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                      ${cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Shipping</span>
                    <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                      {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-zinc-900 dark:text-white pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    <span>Estimated Total</span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400">
                      ${orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  disabled={isCheckingOut}
                  onClick={async () => {
                    setIsCheckingOut(true)
                    try {
                      const result = await initiateCheckout(cart)
                      if (result.url) {
                        window.location.href = result.url
                        return
                      }
                      if (result.error) {
                        alert(`Stripe Checkout note: ${result.error}`)
                        return
                      }
                      if (result.orderSummary) {
                        setOrderConfirmed({
                          id: result.orderSummary.orderId,
                          total: result.orderSummary.total,
                          count: result.orderSummary.itemCount,
                          subtotal: result.orderSummary.subtotal,
                          shipping: result.orderSummary.shipping,
                          payload: result.orderSummary.payload,
                        })
                        setCart([])
                        setIsCartOpen(false)
                      }
                    } catch (err: any) {
                      console.error('Checkout error:', err)
                      alert(`Checkout error: ${err.message || err}`)
                    } finally {
                      setIsCheckingOut(false)
                    }
                  }}
                  className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-zinc-950 font-bold text-sm shadow-md transition flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-zinc-950" aria-hidden="true" />
                  {isCheckingOut ? 'Opening Stripe Checkout...' : 'Proceed to Stripe Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: INTERACTIVE MODEL FINDER DIAGNOSTIC            */}
      {/* ======================================================== */}
      {isModelFinderOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="model-finder-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                  Compatibility Diagnostic
                </span>
                <h2 id="model-finder-title" className="text-xl font-bold text-zinc-900 dark:text-white">
                  Identify Your Dyson Model
                </h2>
              </div>
              <button
                onClick={() => setIsModelFinderOpen(false)}
                aria-label="Close diagnostic"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {diagnosticStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  <strong>Question 1:</strong> Look at your vacuum battery. How does it attach to the main handle?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      handleDiagnosticSelect('screw', 'none')
                    }}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-cyan-500 text-left transition cursor-pointer"
                  >
                    <span className="font-bold text-sm text-zinc-900 dark:text-white block">
                      Screw-In Battery
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                      Fastened with 3 small Philips screws. No red release clip on battery.
                    </span>
                    <span className="inline-block mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                      Matches → Dyson V7 / V8
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setDiagnosticStep(2)
                    }}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-cyan-500 text-left transition cursor-pointer"
                  >
                    <span className="font-bold text-sm text-zinc-900 dark:text-white block">
                      Click-In Battery
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                      Has a large red button on the battery pack to swap batteries instantly.
                    </span>
                    <span className="inline-block mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                      Next Step → V10, V11, V12, V15
                    </span>
                  </button>
                </div>
              </div>
            )}

            {diagnosticStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  <strong>Question 2:</strong> Does your vacuum have a digital LCD screen on the back of the motor?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleDiagnosticSelect('click', 'lcd')}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-cyan-500 text-left transition cursor-pointer"
                  >
                    <span className="font-bold text-sm text-zinc-900 dark:text-white block">
                      Yes, Round Color LCD Screen
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                      Shows exact minute countdown and particle particle graph.
                    </span>
                    <span className="inline-block mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                      Matches → Dyson V15 / V11
                    </span>
                  </button>

                  <button
                    onClick={() => handleDiagnosticSelect('click', 'led')}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:border-cyan-500 text-left transition cursor-pointer"
                  >
                    <span className="font-bold text-sm text-zinc-900 dark:text-white block">
                      No Screen (LED Lights Only)
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 block">
                      Simple 3-LED battery indicator lights on the battery flank.
                    </span>
                    <span className="inline-block mt-2 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                      Matches → Dyson V10 Cyclone
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => setDiagnosticStep(1)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                  Back to Question 1
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ORDER CONFIRMATION & PRINT FARM SIMULATION     */}
      {/* ======================================================== */}
      {orderConfirmed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                Order Received • {orderConfirmed.id}
              </span>
              <h2 id="confirmation-title" className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                Dispatched to Print Farm!
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Your order of {orderConfirmed.count} custom Dyson components (${orderConfirmed.total.toFixed(2)}) is now queued for slicing and bed scheduling.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Order Subtotal:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">${orderConfirmed.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Shipping:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{orderConfirmed.shipping === 0 ? 'FREE' : `$${orderConfirmed.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Facility:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">Prusa MK4 Farm #3 (Boston, MA)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Estimated Dispatch:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Within 24–48 Hours</span>
              </div>
            </div>

            {/* Expandable Stripe & Shipping Technical Inspection */}
            {orderConfirmed.payload && (
              <div className="text-left">
                <button
                  type="button"
                  onClick={() => setShowStripePayload(!showStripePayload)}
                  className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                  {showStripePayload ? 'Hide Stripe & Shipping Payload' : 'Inspect Production Stripe Payload'}
                </button>

                {showStripePayload && (
                  <div className="mt-2 p-3 rounded-xl bg-zinc-900 text-zinc-300 font-mono text-[11px] overflow-x-auto max-h-48 border border-zinc-700 space-y-2">
                    <div className="text-cyan-400 font-bold text-[10px] uppercase">
                      ✓ Production Stripe Session & Line Items Formatted:
                    </div>
                    <pre className="text-[10px] leading-tight text-zinc-400 whitespace-pre-wrap">
                      {JSON.stringify(orderConfirmed.payload, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setOrderConfirmed(null)}
              className="w-full py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-sm shadow-md transition"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: IN-APP DESIGN & ACCESSIBILITY GUIDELINES        */}
      {/* ======================================================== */}
      {isGuidelinesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guidelines-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-500" aria-hidden="true" />
                <h2 id="guidelines-title" className="text-xl font-bold text-zinc-900 dark:text-white">
                  Design & WCAG 2.1 AA Accessibility Guidelines
                </h2>
              </div>
              <button
                onClick={() => setIsGuidelinesOpen(false)}
                aria-label="Close guidelines modal"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-700 dark:text-zinc-300">
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs">
                <strong>Project Rule:</strong> This file is permanently stored at <code className="font-mono bg-cyan-500/20 px-1 py-0.5 rounded">DESIGN_GUIDELINES.md</code> in the repository root. All builds related to this project must conform to these specifications.
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">1. WCAG 2.1 Level AA Compliance</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <li><strong>Contrast Ratio:</strong> ≥ 4.5:1 for normal text against background; ≥ 3:1 for large text and UI components. Verified across both light and dark modes.</li>
                  <li><strong>Keyboard Navigation:</strong> All interactive controls operable via <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">Tab</kbd>, <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">Enter</kbd>, <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">Space</kbd>, and <kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">Esc</kbd>. Focus rings are never hidden.</li>
                  <li><strong>ARIA & Semantics:</strong> Explicit dialog roles (<code className="font-mono text-[11px]">role="dialog"</code>), live announcements (<code className="font-mono text-[11px]">aria-live="polite"</code>), and skip links.</li>
                  <li><strong>Touch Targets:</strong> Interactive elements maintain a minimum target size of 44x44px.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">2. Technical 3D Printing Specifications</h3>
                <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <li><strong>Tolerances:</strong> Calibrated to ±0.15mm to mirror factory Dyson quick-release detents.</li>
                  <li><strong>Materials:</strong> PETG Technical for structural docks; Tough PLA+ for airflow nozzles; TPU 95A elastomer for non-scratch bumpers.</li>
                  <li><strong>Infill Profiles:</strong> 25% Residential, 55% Reinforced, 100% Ultra-Solid.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">3. Compatibility Architecture</h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Every product displays a model-specific verification badge. Users can lock their model globally, or use the interactive diagnostic finder to identify battery and display characteristics.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setIsGuidelinesOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-semibold text-xs"
              >
                Close Guidelines
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
