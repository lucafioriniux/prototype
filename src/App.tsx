import { useState, useId, useEffect } from 'react'
import {
  Check,
  X,
  ShoppingBag,
  Search,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Moon,
  Sun,
  Clock,
  Layers,
  HelpCircle,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  ArrowRight,
  FileText,
  CheckCircle2,
  Box,
  Cpu,
  RotateCcw
} from 'lucide-react'
import type {
  DysonModel,
  Product,
  MaterialOption,
  FilamentColor,
  InfillOption,
  CartItem
} from './types'
import {
  DYSON_MODELS,
  MATERIALS,
  FILAMENT_COLORS,
  INFILL_OPTIONS,
  PRODUCTS
} from './data/products'
import { Logo } from './components/Logo'
import { initiateCheckout } from './services/checkout'

export function App() {
  // Theme state: auto-detect system preference with localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('modus-theme')
    if (saved) return saved === 'dark'
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Dyson Model Filter state
  const [selectedModel, setSelectedModel] = useState<DysonModel>('Dyson V15 Detect')
  const [onlyCompatible, setOnlyCompatible] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'time'>('recommended')

  // Modals & Drawers state
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null)
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
        if (customizingProduct) setCustomizingProduct(null)
        else if (isCartOpen) setIsCartOpen(false)
        else if (isModelFinderOpen) setIsModelFinderOpen(false)
        else if (isGuidelinesOpen) setIsGuidelinesOpen(false)
        else if (orderConfirmed) setOrderConfirmed(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [customizingProduct, isCartOpen, isModelFinderOpen, isGuidelinesOpen, orderConfirmed])

  // Open customizer for a specific product
  const handleOpenCustomizer = (product: Product) => {
    setCustomizingProduct(product)
    // Preset recommended material
    const matchedMat = MATERIALS.find(m => m.name === product.printSpecs.recommendedMaterial) || MATERIALS[0]
    setSelectedMaterial(matchedMat)
    setSelectedColor(FILAMENT_COLORS[0])
    setSelectedInfill(INFILL_OPTIONS[0])
    setCustomQuantity(1)
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

  // Add customized item to cart
  const handleAddToCart = () => {
    if (!customizingProduct) return
    const unitPrice = calculateCustomPrice(customizingProduct, selectedMaterial, selectedInfill)
    const newItem: CartItem = {
      cartId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: customizingProduct.id,
      product: customizingProduct,
      material: selectedMaterial,
      color: selectedColor,
      infill: selectedInfill,
      selectedModel: selectedModel === 'All Models' ? 'Dyson V15 Detect' : selectedModel,
      quantity: customQuantity,
      unitPrice,
    }
    setCart(prev => [newItem, ...prev])
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

  // Filter products
  const categories = ['All', 'Docks & Storage', 'Ergonomics', 'Nozzles & Tips', 'Adapters', 'On-Board Storage', 'Air & Filtration']

  const filteredProducts = PRODUCTS.filter(product => {
    // Model compatibility check
    if (selectedModel !== 'All Models') {
      const isCompatible = product.compatibleModels.includes(selectedModel)
      if (onlyCompatible && !isCompatible) return false
    }

    // Category filter
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase()
      const matchName = product.name.toLowerCase().includes(q)
      const matchDesc = product.description.toLowerCase().includes(q)
      const matchCat = product.category.toLowerCase().includes(q)
      if (!matchName && !matchDesc && !matchCat) return false
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
            <ShieldCheck className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            100% Fit Guarantee & Free Replacement
          </span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline text-zinc-400">
            Precision Additive Manufacturing (PETG / Tough PLA+ / TPU 95A)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            WCAG 2.1 AA Compliant
          </span>
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

          {/* Model Lock Selector (Global Header Tool) */}
          <div className="hidden lg:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Your Dyson:
            </span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as DysonModel)}
              aria-label="Filter parts by Dyson vacuum model"
              className="bg-transparent text-xs font-semibold text-zinc-900 dark:text-zinc-100 border-none focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded py-0.5 pr-2 cursor-pointer"
            >
              {DYSON_MODELS.map((model) => (
                <option key={model} value={model} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
                  {model}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsModelFinderOpen(true)}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium ml-1"
              title="Help identifying your model"
            >
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              Identify
            </button>
          </div>

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
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Section */}
        {/* Hero Section with High Quality Showcase & Top Selling CTA */}
        <section
          aria-labelledby="hero-heading"
          className="relative rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden text-white"
        >
          {/* Subtle Industrial Background Grid */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" aria-hidden="true" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10 lg:p-12">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                Additive Engineering Lab
              </div>

              <div className="space-y-3">
                <h1 id="hero-heading" className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                  Precision 3D Printed Accessories for Your Dyson.
                </h1>
                <p className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                  Tailored upgrades crafted to overcome factory limitations. Explore heavy-duty wall docks, continuous-power trigger locks, and shop-vac adapters—manufactured on-demand in <strong>PLA, PLA+, and PETG</strong> with calibrated snap-fit detents.
                </p>
              </div>

              {/* Action Buttons: Primary CTA to Top Sellers + Secondary Model Diagnostic */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#products-heading"
                  className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  <ShoppingBag className="w-4 h-4 text-zinc-950" aria-hidden="true" />
                  Explore Top Selling Products
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsModelFinderOpen(true)}
                  className="px-5 py-3.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-sm transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  <HelpCircle className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  Identify My Dyson Model
                </button>
              </div>

              {/* Quick Model Selector Strip */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-semibold uppercase tracking-wider text-zinc-300">
                    Filter by Your Dyson Model:
                  </span>
                  <span className="text-[11px] text-cyan-400">Guaranteed fit detection</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1" role="radiogroup" aria-label="Select Dyson model">
                  {DYSON_MODELS.map((model) => {
                    const isSelected = selectedModel === model
                    return (
                      <button
                        key={model}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedModel(model)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                          isSelected
                            ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                            : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/60'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1 -mt-0.5" aria-hidden="true" />}
                        {model}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right Showcase Column (High Quality Hero Image) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-700/80 shadow-2xl bg-zinc-950 aspect-[4/3] group">
                <img
                  src={`${import.meta.env.BASE_URL}hero.jpg`}
                  alt="Dyson vacuum wands and precision 3D printed accessories showcase in design studio"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none" />

                {/* Floating Technical Highlights */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 z-10 text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-zinc-200 font-medium backdrop-blur-md">
                    ⚡ 0.20mm Precision FDM
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-zinc-900/90 border border-zinc-700/80 text-emerald-400 font-semibold backdrop-blur-md">
                    ✓ Calibrated Snap-Fits
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter, Search & Compatibility Control Bar */}
        <section aria-labelledby="catalog-controls-heading" className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <h2 id="catalog-controls-heading" className="sr-only">Product Search and Filter Controls</h2>
          
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <label htmlFor={searchInputId} className="sr-only">Search Dyson 3D printed accessories</label>
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                id={searchInputId}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search accessories (e.g. wall dock, trigger lock, TPU nozzle)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-sm text-zinc-900 dark:text-zinc-100 border border-transparent focus:border-cyan-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search text"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-full"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Compatibility toggle & Sorting */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Only Compatible Toggle */}
              {selectedModel !== 'All Models' && (
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <input
                    type="checkbox"
                    checked={onlyCompatible}
                    onChange={(e) => setOnlyCompatible(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 border-zinc-400"
                  />
                  <span>Only 100% Fit for {selectedModel}</span>
                </label>
              )}

              {/* Sort By Select */}
              <div className="flex items-center gap-2">
                <label htmlFor={sortSelectId} className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Sort:
                </label>
                <select
                  id={sortSelectId}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-900 dark:text-zinc-100 rounded-xl px-3 py-2 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="recommended">Highest Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="time">Fastest Print Time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Product categories">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-cyan-500 dark:text-zinc-950 shadow-xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </section>

        {/* Product Grid */}
        <section aria-labelledby="products-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="products-heading" className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <span>Catalog</span>
              <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
                ({filteredProducts.length} items available)
              </span>
            </h2>

            {selectedModel !== 'All Models' && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" aria-hidden="true" />
                Active Model Filter: <strong className="text-zinc-800 dark:text-zinc-200">{selectedModel}</strong>
              </span>
            )}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center space-y-4">
              <Box className="w-12 h-12 text-zinc-400 mx-auto" aria-hidden="true" />
              <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                No matching accessories found
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                No parts match your current search and compatibility criteria. Try turning off "Only 100% Fit" or selecting "All Models".
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All')
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
                const isCompatible = selectedModel === 'All Models' || product.compatibleModels.includes(selectedModel)

                return (
                  <article
                    key={product.id}
                    className="flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg transition-all duration-200"
                  >
                    <div>
                      {/* Product Preview Header Image */}
                      <div className="relative h-48 bg-zinc-900 overflow-hidden group/img">
                        <img
                          src={product.imageUrl.startsWith('http') ? product.imageUrl : `${import.meta.env.BASE_URL}${product.imageUrl}`}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/30 pointer-events-none" />

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                          {product.badge && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-zinc-900/90 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs backdrop-blur-xs">
                              {product.badge}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-900/80 text-zinc-200 border border-zinc-700/60 backdrop-blur-xs">
                            {product.category}
                          </span>
                        </div>

                        {/* Model Compatibility Badge */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs z-10">
                          {selectedModel !== 'All Models' && (
                            isCompatible ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-[11px] font-semibold backdrop-blur-xs">
                                <Check className="w-3.5 h-3.5" aria-hidden="true" /> Guaranteed Fit
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700 text-[11px] font-semibold backdrop-blur-xs">
                                <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" /> Incompatible with {selectedModel}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Product Body */}
                      <div className="p-5 space-y-3">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-snug">
                              {product.name}
                            </h3>
                          </div>
                          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                            {product.summary}
                          </p>
                        </div>

                        {/* Technical Print Spec chips */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px]">
                          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                            <span>~{Math.floor(product.printSpecs.printTimeMinutes / 60)}h {product.printSpecs.printTimeMinutes % 60}m print</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                            <Cpu className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                            <span>{product.printSpecs.weightGrams}g filament</span>
                          </div>
                        </div>

                        {/* Compatible Models list hint */}
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          <strong>Fits:</strong> {product.compatibleModels.join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Product Card Footer */}
                    <div className="p-5 pt-0 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-semibold block">Base Price</span>
                        <span className="text-lg font-extrabold text-zinc-900 dark:text-white">
                          ${product.basePrice.toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenCustomizer(product)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 text-xs font-bold flex items-center justify-center gap-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                        aria-label={`Configure and order ${product.name}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-cyan-400 dark:text-cyan-600" aria-hidden="true" />
                        Configure & Order
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* Informational / Trust Section: Why 3D Printed Parts for Dyson */}
        <section aria-labelledby="why-print-heading" className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-8 space-y-6">
          <div className="max-w-2xl">
            <h2 id="why-print-heading" className="text-xl font-bold text-zinc-900 dark:text-white">
              Why Additive Manufacturing for Dyson Accessories?
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              OEM accessories are mass-molded in bulk and often fail to solve niche homeowner and workshop needs. Our 3D printed components offer tailored solutions:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                Mechanical Precision & Click-Fit
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Calibrated to ±0.15mm tolerances to match the authentic snap-action detents of Dyson quick-release collars.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                Engineering Materials (PETG & TPU)
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                No brittle decorative plastic. Wall mounts use ductile PETG, while crevice tips use non-marring 95A TPU rubber.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                Zero Plastic Waste On-Demand
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Printed only when ordered in our local Boston farm. Every scrap is recycled back into filament pellets.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="space-y-1">
            <Logo size="sm" showTagline={false} />
            <p className="mt-1">
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
                <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                  Custom 3D Print Configurator
                </span>
                <h2 id="customizer-title" className="text-xl font-bold text-zinc-900 dark:text-white">
                  {customizingProduct.name}
                </h2>
              </div>
              <button
                onClick={() => setCustomizingProduct(null)}
                aria-label="Close customizer"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
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

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-md transition flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2"
              >
                <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                Add to Cart • ${(calculateCustomPrice(customizingProduct, selectedMaterial, selectedInfill) * customQuantity).toFixed(2)}
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
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 space-y-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white leading-tight">
                          {item.product.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3 h-3" aria-hidden="true" /> Fit: {item.selectedModel}
                        </span>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.cartId, -item.quantity)}
                        aria-label={`Remove ${item.product.name} from cart`}
                        className="text-zinc-400 hover:text-rose-500 p-1 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    {/* Material & Color Specs Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-medium text-zinc-700 dark:text-zinc-300">
                        {item.material.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: item.color.hex }}
                          aria-hidden="true"
                        />
                        {item.color.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 font-medium text-zinc-700 dark:text-zinc-300">
                        {item.infill.name}
                      </span>
                    </div>

                    {/* Quantity & Subtotal */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-700/60">
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900">
                        <button
                          onClick={() => updateQuantity(item.cartId, -1)}
                          aria-label="Decrease quantity"
                          className="px-2 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        >
                          <Minus className="w-3 h-3" aria-hidden="true" />
                        </button>
                        <span className="px-2 text-xs font-bold font-mono text-zinc-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartId, 1)}
                          aria-label="Increase quantity"
                          className="px-2 py-1 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        >
                          <Plus className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-sm text-zinc-900 dark:text-white">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
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
                        return // Redirecting to Stripe hosted page
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
                    } finally {
                      setIsCheckingOut(false)
                    }
                  }}
                  className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-zinc-950 font-bold text-sm shadow-md transition flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-zinc-950" aria-hidden="true" />
                  {isCheckingOut ? 'Redirecting to Stripe Checkout...' : 'Proceed to Stripe Checkout'}
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
