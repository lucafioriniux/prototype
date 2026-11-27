import { useState } from 'react'
import { CheckCircle2, Mail, MessageSquare, Send, X } from 'lucide-react'
import type { FeedbackCategory, MakerFeedback, Product } from '../types'

interface DirectFeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onSubmitFeedback: (item: MakerFeedback) => void
}

const CATEGORIES: FeedbackCategory[] = [
  'Product Idea / Custom Part',
  'Fit & Tolerance Feedback',
  'Website Experience',
  'Order / General Question',
]

export function DirectFeedbackModal({
  isOpen,
  onClose,
  products,
  onSubmitFeedback,
}: DirectFeedbackModalProps) {
  const [category, setCategory] = useState<FeedbackCategory>('Product Idea / Custom Part')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [productName, setProductName] = useState('')
  const [message, setMessage] = useState('')
  const [submittedItem, setSubmittedItem] = useState<MakerFeedback | null>(null)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return

    const item: MakerFeedback = {
      id: `FB-${Date.now().toString(36).toUpperCase()}`,
      category,
      name: name.trim(),
      email: email.trim(),
      productName: productName || undefined,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'unread',
    }
    onSubmitFeedback(item)
    setSubmittedItem(item)
    setName('')
    setEmail('')
    setProductName('')
    setMessage('')
  }

  const handleResetAndClose = () => {
    setSubmittedItem(null)
    onClose()
  }

  const mailtoHref = submittedItem
    ? `mailto:hello@forma3d.com?subject=${encodeURIComponent(
        `[Forma Feedback] ${submittedItem.category}`
      )}&body=${encodeURIComponent(
        `From: ${submittedItem.name} (${submittedItem.email})${
          submittedItem.productName ? `\nProduct: ${submittedItem.productName}` : ''
        }\n\n${submittedItem.message}`
      )}`
    : '#'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="direct-feedback-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleResetAndClose()
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              Direct Maker Care • Zero Bots
            </span>
            <h3 id="direct-feedback-title" className="text-xl font-black text-zinc-900 dark:text-white">
              Message Luca Directly
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Have a custom part request, tolerance feedback, or site suggestion? It goes straight to my workshop inbox.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label="Close feedback modal"
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {submittedItem ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                Feedback Sent to the Workshop!
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Thanks, <strong>{submittedItem.name}</strong>. Your note ({submittedItem.id}) is saved in my Maker Inbox and I&apos;ll reply to{' '}
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">{submittedItem.email}</span>.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={mailtoHref}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-500" aria-hidden="true" />
                <span>Also Send via Email App</span>
              </a>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-extrabold transition cursor-pointer"
              >
                Back to Storefront
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Topic Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 block">
                Topic
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition cursor-pointer ${
                      category === cat
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-300'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="fb-name" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Your Name *
                </label>
                <input
                  id="fb-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="fb-email" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                  Email for Reply *
                </label>
                <input
                  id="fb-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="fb-product" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Related Product (Optional)
              </label>
              <select
                id="fb-product"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">General / Not specific to one item</option>
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="fb-message" className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
                Message *
              </label>
              <textarea
                id="fb-message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me what you'd like built, how a part fit, or how I can improve Forma..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-extrabold shadow-md transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Send to Luca</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
