import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Layers,
  Mail,
  MessageSquare,
  Package,
  PauseCircle,
  PlayCircle,
  PlusCircle,
  Printer,
  ShieldCheck,
  Trash2,
  Truck,
} from 'lucide-react'
import type { MakerFeedback, PrintJobStatus, PrintQueueOrder, QueueStatusSummary } from '../types'
import { getAmsFilamentGroups } from '../services/printQueue'

interface AdminPrintQueueProps {
  orders: PrintQueueOrder[]
  queueStatus: QueueStatusSummary
  feedbackItems: MakerFeedback[]
  onToggleFeedbackStatus: (feedbackId: string) => void
  onUpdateStatus: (orderId: string, status: PrintJobStatus, trackingNumber?: string) => void
  onToggleManualPause: () => void
  onSimulateOrder: () => void
  onClearShipped: () => void
  onExitAdmin: () => void
}

type FilterTab = 'active' | 'batch_1' | 'batch_2_24h' | 'shipped' | 'inbox'

const STATUS_STEPS: { id: PrintJobStatus; label: string }[] = [
  { id: 'queued', label: 'Queued' },
  { id: 'printing', label: 'Printing' },
  { id: 'fit_checked', label: 'Fit-Checked' },
  { id: 'shipped', label: 'Shipped' },
]

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`
}

export function AdminPrintQueue({
  orders,
  queueStatus,
  feedbackItems,
  onToggleFeedbackStatus,
  onUpdateStatus,
  onToggleManualPause,
  onSimulateOrder,
  onClearShipped,
  onExitAdmin,
}: AdminPrintQueueProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('active')
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const amsGroups = getAmsFilamentGroups(orders)

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'shipped') return order.status === 'shipped'
    if (activeTab === 'batch_1') return order.status !== 'shipped' && order.batch === 'batch_1'
    if (activeTab === 'batch_2_24h') return order.status !== 'shipped' && order.batch === 'batch_2_24h'
    return order.status !== 'shipped'
  })

  const handleCopyAddress = (order: PrintQueueOrder) => {
    const text = `${order.customerName}\n${order.shippingAddress}`
    navigator.clipboard?.writeText(text)
    setCopiedId(order.id)
    setTimeout(() => setCopiedId(null), 1800)
  }

  const handleShipWithTracking = (order: PrintQueueOrder) => {
    const tracking = (trackingDrafts[order.id] ?? order.trackingNumber ?? '').trim()
    onUpdateStatus(order.id, 'shipped', tracking || undefined)
  }

  const stateBadge =
    queueStatus.state === 'paused'
      ? {
          label: 'PAUSED FOR QUALITY',
          classes: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
        }
      : queueStatus.state === 'overflow_24h'
      ? {
          label: 'BATCH 2 (+24H LOOP)',
          classes: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
        }
      : {
          label: 'OPEN (48H DISPATCH)',
          classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
        }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Storefront</span>
            </button>
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-cyan-400" aria-hidden="true" />
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                FORMA • Print Queue
              </h1>
            </div>
            <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${stateBadge.classes}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" aria-hidden="true" />
              {stateBadge.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSimulateOrder}
              disabled={queueStatus.state === 'paused'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 text-xs font-extrabold transition cursor-pointer"
              title="Simulate an incoming paid Stripe Checkout order"
            >
              <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Simulate Stripe Order</span>
              <span className="sm:hidden">+ Order</span>
            </button>

            <button
              type="button"
              onClick={onToggleManualPause}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                queueStatus.manualPause
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
              }`}
            >
              {queueStatus.manualPause ? (
                <>
                  <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Resume Queue</span>
                </>
              ) : (
                <>
                  <PauseCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Pause Checkout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Rolling 24h Capacity & Batch Meters */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Batch 1 Meter */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Batch 1 • Today (48h SLA)
              </span>
              <span className="text-sm font-black font-mono text-white">
                {queueStatus.batch1Count} / {queueStatus.batch1Cap}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{
                  width: `${Math.min(100, (queueStatus.batch1Count / queueStatus.batch1Cap) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-zinc-400 flex items-center justify-between">
              <span>Est. Print Time: {formatDuration(queueStatus.batch1Minutes)}</span>
              <span>{queueStatus.batch1Count >= queueStatus.batch1Cap ? 'Full' : 'Accepting'}</span>
            </p>
          </div>

          {/* Batch 2 (+24h) Meter */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Batch 2 • Tomorrow (+24h Loop)
              </span>
              <span className="text-sm font-black font-mono text-white">
                {queueStatus.batch2Count} / {queueStatus.batch2Cap}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{
                  width: `${Math.min(100, (queueStatus.batch2Count / queueStatus.batch2Cap) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-zinc-400 flex items-center justify-between">
              <span>Est. Print Time: {formatDuration(queueStatus.batch2Minutes)}</span>
              <span>
                {queueStatus.batch2Count >= queueStatus.batch2Cap
                  ? 'Full (Checkout Paused)'
                  : queueStatus.state === 'overflow_24h'
                  ? 'Active Overflow'
                  : 'Standby'}
              </span>
            </p>
          </div>

          {/* AMS 4-Slot Filament Batch Planner */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                AMS 4-Slot Loadout
              </span>
              <span className="text-[11px] text-zinc-400">{amsGroups.length} color combos</span>
            </div>
            {amsGroups.length === 0 ? (
              <p className="text-xs text-zinc-500 pt-1">
                No active queued prints. Load your top 4 spools in the AMS.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {amsGroups.slice(0, 4).map((group, idx) => (
                  <div key={group.key} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-mono text-zinc-500">S{idx + 1}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: group.colorHex }}
                      />
                      <span className="truncate font-semibold text-zinc-200">
                        {group.materialName} • {group.colorName}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                      {group.itemCount}× ({formatDuration(group.totalMinutes)})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Filter Tabs & Maintenance */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto" role="tablist">
            {(
              [
                { id: 'active', label: `All Active (${queueStatus.totalActiveCount})` },
                { id: 'batch_1', label: `Batch 1 • Today (${queueStatus.batch1Count})` },
                { id: 'batch_2_24h', label: `Batch 2 • +24h (${queueStatus.batch2Count})` },
                {
                  id: 'shipped',
                  label: `Shipped (${orders.filter((o) => o.status === 'shipped').length})`,
                },
                {
                  id: 'inbox',
                  label: `Maker Inbox (${feedbackItems.filter((f) => f.status === 'unread').length} new)`,
                },
              ] as { id: FilterTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? tab.id === 'inbox'
                      ? 'bg-pink-500 text-white'
                      : 'bg-cyan-500 text-zinc-950'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab !== 'inbox' && orders.some((o) => o.status === 'shipped') && (
            <button
              type="button"
              onClick={onClearShipped}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-rose-400 bg-zinc-900 border border-zinc-800 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Archive Shipped</span>
            </button>
          )}
        </div>

        {/* Maker Inbox View vs Orders List */}
        {activeTab === 'inbox' ? (
          feedbackItems.length === 0 ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-12 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto" aria-hidden="true" />
              <h2 className="text-base font-bold text-white">Maker Inbox is Empty</h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Direct feedback, custom part ideas, and fit notes sent via the storefront&apos;s{' '}
                <strong className="text-cyan-400">Message Luca</strong> button will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackItems.map((fb) => (
                <article
                  key={fb.id}
                  className={`rounded-2xl border p-5 space-y-3 transition ${
                    fb.status === 'unread'
                      ? 'border-pink-500/40 bg-zinc-900/95'
                      : 'border-zinc-800 bg-zinc-900/60 opacity-80'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-zinc-400">{fb.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                          {fb.category}
                        </span>
                        {fb.productName && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                            {fb.productName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-300">
                        <strong className="text-white">{fb.name}</strong> •{' '}
                        <span className="text-zinc-400">{fb.email}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${fb.email}?subject=${encodeURIComponent(`Re: ${fb.category} — Forma`)}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
                      >
                        <Mail className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                        <span>Reply</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => onToggleFeedbackStatus(fb.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          fb.status === 'unread'
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {fb.status === 'unread' ? 'Mark Resolved' : 'Reopen'}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5">
                    {fb.message}
                  </p>
                </article>
              ))}
            </div>
          )
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-zinc-600 mx-auto" aria-hidden="true" />
            <h2 className="text-base font-bold text-white">No orders in this view</h2>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Paid Stripe Checkout orders appear here automatically. Click{' '}
              <strong className="text-cyan-400">Simulate Stripe Order</strong> above to test the
              Batch 1 → Batch 2 (+24h) → Quality Shutdown flow.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const totalOrderMinutes = order.items.reduce(
                (s, i) => s + i.printTimeMinutes * i.quantity,
                0
              )
              const mailtoSubject = encodeURIComponent(`Your Forma Order ${order.id} Has Shipped!`)
              const mailtoBody = encodeURIComponent(
                `Hi ${order.customerName},\n\nYour custom 3D-printed order (${order.id}) passed our ±0.15mm hand-fit inspection and has been dispatched via USPS Ground Advantage.${
                  order.trackingNumber ? `\n\nTracking Number: ${order.trackingNumber}` : ''
                }\n\nThank you for supporting an independent solo workshop!\n— Luca, Forma`
              )

              return (
                <article
                  key={order.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/85 p-5 space-y-4 shadow-lg"
                >
                  {/* Order Top Row */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-white">
                          {order.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.batch === 'batch_2_24h'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {order.batch === 'batch_2_24h' ? 'Batch 2 (+24h)' : 'Batch 1 (48h)'}
                        </span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {formatDuration(totalOrderMinutes)} print
                        </span>
                      </div>

                      <div className="text-xs text-zinc-300">
                        <span className="font-semibold text-white">{order.customerName}</span> •{' '}
                        <span className="text-zinc-400">{order.customerEmail}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        <span>{order.shippingAddress}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyAddress(order)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[10px] font-semibold text-zinc-200 cursor-pointer"
                        >
                          {copiedId === order.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                              <span>Copied for Pirate Ship</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" aria-hidden="true" />
                              <span>Copy Address</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-400 block">Paid Total</span>
                      <span className="text-lg font-extrabold font-mono text-emerald-400">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={`${order.id}-${idx}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 px-3.5 py-2.5 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: item.colorHex }}
                            title={item.colorName}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">
                              {item.quantity}× {item.productName}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              <strong className="text-zinc-200">{item.materialName}</strong> •{' '}
                              {item.colorName} • {item.infillName} • Fit: {item.selectedModel}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono text-zinc-400 text-[11px]">
                          {formatDuration(item.printTimeMinutes * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status Workflow & Tracking Controls */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2">
                    {/* 4-Step Status Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {STATUS_STEPS.map((step) => {
                        const isCurrent = order.status === step.id
                        return (
                          <button
                            key={step.id}
                            type="button"
                            onClick={() => onUpdateStatus(order.id, step.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              isCurrent
                                ? step.id === 'shipped'
                                  ? 'bg-emerald-500 text-zinc-950'
                                  : 'bg-cyan-500 text-zinc-950'
                                : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {step.id === 'fit_checked' && <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />}
                            {step.id === 'shipped' && <Truck className="w-3.5 h-3.5" aria-hidden="true" />}
                            {step.id === 'printing' && <Printer className="w-3.5 h-3.5" aria-hidden="true" />}
                            {step.id === 'queued' && <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />}
                            <span>{step.label}</span>
                          </button>
                        )
                      })}
                    </div>

                    {/* USPS Tracking & Notify */}
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={trackingDrafts[order.id] ?? order.trackingNumber ?? ''}
                        onChange={(e) =>
                          setTrackingDrafts((prev) => ({ ...prev, [order.id]: e.target.value }))
                        }
                        placeholder="USPS Tracking # (from Pirate Ship)"
                        className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 w-56 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleShipWithTracking(order)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-extrabold transition cursor-pointer"
                      >
                        Save & Ship
                      </button>
                      <a
                        href={`mailto:${order.customerEmail}?subject=${mailtoSubject}&body=${mailtoBody}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
                        title="Open pre-filled shipping email"
                      >
                        <Mail className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                        <span>Email Customer</span>
                      </a>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
