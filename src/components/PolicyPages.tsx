import { ArrowLeft, Mail, MessageSquare, ShieldCheck, RefreshCw, FileText, Store } from 'lucide-react'
import { Logo } from './Logo'

export type PolicyPageId = 'contact' | 'privacy-policy' | 'refund-policy' | 'terms-of-service'

interface PolicyPagesProps {
  activePage: PolicyPageId
  onNavigatePage: (page: PolicyPageId) => void
  onBackToStore: () => void
  onOpenFeedbackModal: () => void
}

const PAGE_NAV: { id: PolicyPageId; label: string }[] = [
  { id: 'contact', label: 'Contact' },
  { id: 'privacy-policy', label: 'Privacy Policy' },
  { id: 'refund-policy', label: 'Refund Policy' },
  { id: 'terms-of-service', label: 'Terms of Service' },
]

export function PolicyPages({
  activePage,
  onNavigatePage,
  onBackToStore,
  onOpenFeedbackModal,
}: PolicyPagesProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-200 hover:text-cyan-600 dark:hover:text-cyan-400 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Storefront</span>
          </button>

          <button type="button" onClick={onBackToStore} className="cursor-pointer">
            <Logo size="sm" showTagline={false} />
          </button>
        </div>

        {/* Sub-Nav Pills */}
        <div className="border-t border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-zinc-950/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
            {PAGE_NAV.map((item) => {
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigatePage(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* Page Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {activePage === 'contact' && (
          <div className="space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                Direct Maker Support
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
                Contact Forma
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                Forma is an independent, one-person 3D-print workshop. There are no chatbots or outsourced ticket queues—when you reach out, you talk directly with Luca, who designs, prints, inspects, and packs your order.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  Send a Direct Workshop Message
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Best for custom fit questions, part ideas, tolerance feedback, or order updates. Typical reply time is within 1 business day.
                </p>
                <button
                  type="button"
                  onClick={onOpenFeedbackModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-extrabold text-xs transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" aria-hidden="true" />
                  <span>Open Direct Message Form</span>
                </button>
              </div>

              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                  Email & Retail Inquiries
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Prefer standard email or reaching out about carrying Forma Workshop grab-and-go displays in your local hardware store?
                </p>
                <a
                  href="mailto:hello@forma3d.com?subject=Forma%20Workshop%20Inquiry"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs hover:opacity-90 transition"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>hello@forma3d.com</span>
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2.5 text-sm font-bold text-zinc-900 dark:text-white">
                <Store className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <span>Local Hardware Store & Small Business Displays</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                We partner with independent hardware stores and tool shops for compact countertop grab-and-go displays (such as magnetic drill bit holders and stepped shop-vac couplers). Reach out by email or via the direct message form to request a sample rack.
              </p>
            </div>
          </div>
        )}

        {activePage === 'privacy-policy' && (
          <article className="space-y-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-10">
            <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                Legal & Data Privacy
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                Privacy Policy
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Last updated: November 2026 • Forma Additive Workshop
              </p>
            </div>

            <div className="space-y-5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">1. Information We Collect</h2>
                <p>
                  When you place an order or send a message through Forma, we collect only the information needed to manufacture and deliver your custom 3D-printed items: your name, email address, shipping address, and selected product specifications (color, Indoor/Outdoor material, strength level, and hardware model).
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">2. Payment Processing (Stripe)</h2>
                <p>
                  All payment card details are handled securely by <strong>Stripe</strong>. Forma never sees, processes, or stores your credit card number or banking credentials on our servers.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">3. How We Use Your Information</h2>
                <p>
                  Your contact and shipping details are used strictly to print your order, perform quality checks, purchase USPS/carrier shipping labels, send tracking updates, and respond to direct support inquiries. <strong>We never sell, rent, or trade your personal information to third parties.</strong>
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">4. Reviews & Uploaded Photos</h2>
                <p>
                  If you submit a product review or upload customer photos, your chosen display name, review text, and photos may appear publicly on that product&apos;s Review tab. Please avoid including sensitive personal details in uploaded photos.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">5. Your Rights & Data Removal</h2>
                <p>
                  You can request access to, correction of, or deletion of your order contact info or posted reviews anytime by emailing{' '}
                  <a href="mailto:hello@forma3d.com" className="text-cyan-600 dark:text-cyan-400 underline">
                    hello@forma3d.com
                  </a>.
                </p>
              </section>
            </div>
          </article>
        )}

        {activePage === 'refund-policy' && (
          <article className="space-y-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-10">
            <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                30-Day Fit & Quality Guarantee
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                Refund Policy
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Last updated: November 2026 • Forma Additive Workshop
              </p>
            </div>

            <div className="space-y-5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">1. Our ±0.15mm Fit & Arrival Guarantee</h2>
                <p>
                  Every Forma part is physically inspected before shipping. If your order arrives damaged in transit, has a manufacturing defect, or fails to fit the compatible hardware model listed on the product page, we will <strong>reprint and ship a replacement at zero cost</strong> or issue a full refund.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">2. 30-Day Returns</h2>
                <p>
                  We accept returns within <strong>30 days of delivery</strong> for unused items in their original condition. To start a return or replacement, contact{' '}
                  <a href="mailto:hello@forma3d.com" className="text-cyan-600 dark:text-cyan-400 underline">
                    hello@forma3d.com
                  </a>{' '}
                  with your order number (and a quick photo if damaged or mis-fitting).
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">3. Order Cancellations (Before Printing)</h2>
                <p>
                  Because items are printed to order in your chosen color, environment material, and strength level, orders can be cancelled or modified for a full refund anytime <strong>before your print begins</strong> on the build plate.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">4. Refund Timing</h2>
                <p>
                  Approved refunds are issued back to your original Stripe payment method within 1–2 business days (banks typically take 3–5 business days to post the credit).
                </p>
              </section>
            </div>
          </article>
        )}

        {activePage === 'terms-of-service' && (
          <article className="space-y-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 sm:p-10">
            <div className="space-y-2 border-b border-zinc-200 dark:border-zinc-800 pb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                <FileText className="w-4 h-4" aria-hidden="true" />
                Workshop Terms
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">
                Terms of Service
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Last updated: November 2026 • Forma Additive Workshop
              </p>
            </div>

            <div className="space-y-5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">1. Made-to-Order Additive Manufacturing</h2>
                <p>
                  Forma products are precision FDM 3D-printed in small batches and to order. Subtle horizontal layer lines are a natural characteristic of additive manufacturing and do not affect structural integrity.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">2. Rolling Queue & Dispatch Windows</h2>
                <p>
                  To protect quality as a one-person workshop, daily production capacity is capped. Standard Batch 1 orders ship within 48 hours; when daily capacity fills, overflow Batch 2 orders carry an automatic +24h dispatch window. Checkout temporarily pauses when both batches are full.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">3. Material Temperature & Load Guidelines</h2>
                <p>
                  <strong>Indoor (PLA)</strong> and <strong>Indoor + (PLA+)</strong> prints are intended for climate-controlled indoor use and should not be left in hot vehicles or direct high-heat sunlight (&gt;55°C). For hot cars, garages, or heavy mechanical loads, select <strong>Outdoor (PETG)</strong>, rated up to 75°C. Always mount wall brackets into wall studs or appropriate drywall anchors.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">4. Independent Compatibility & Trademarks</h2>
                <p>
                  Forma is an independent workshop and is not affiliated with, endorsed by, or sponsored by Dyson Ltd., Apple Inc., DeWalt, Milwaukee Tool, Sony, Microsoft, or any other third-party hardware manufacturer. Brand and model names are referenced strictly to indicate physical fit compatibility.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">5. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, Forma&apos;s liability for any claim arising out of a purchased product is limited to the purchase price paid for that item, or a free replacement/reprint under our 30-day guarantee.
                </p>
              </section>
            </div>
          </article>
        )}
      </main>
    </div>
  )
}
