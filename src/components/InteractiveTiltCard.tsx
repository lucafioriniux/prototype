import { useRef, useState, type ReactNode } from 'react'

export type TiltAccent = 'cyan' | 'fuchsia' | 'violet' | 'amber'

interface InteractiveTiltCardProps {
  title: string
  description: string
  icon: ReactNode
  accent: TiltAccent
}

const ACCENT_STYLES: Record<
  TiltAccent,
  {
    spotlightRgb: string
    hoverBorder: string
    iconBase: string
    iconHover: string
    titleHover: string
  }
> = {
  cyan: {
    spotlightRgb: 'rgba(6, 182, 212, 0.16)',
    hoverBorder: 'hover:border-cyan-400/70 dark:hover:border-cyan-400/60 hover:shadow-cyan-500/10',
    iconBase: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200/60 dark:border-cyan-500/20',
    iconHover: 'group-hover:bg-cyan-500 group-hover:text-white group-hover:border-cyan-400 group-hover:shadow-md group-hover:shadow-cyan-500/25',
    titleHover: 'group-hover:text-cyan-700 dark:group-hover:text-cyan-300',
  },
  fuchsia: {
    spotlightRgb: 'rgba(236, 72, 153, 0.16)',
    hoverBorder: 'hover:border-pink-400/70 dark:hover:border-pink-400/60 hover:shadow-pink-500/10',
    iconBase: 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200/60 dark:border-pink-500/20',
    iconHover: 'group-hover:bg-pink-500 group-hover:text-white group-hover:border-pink-400 group-hover:shadow-md group-hover:shadow-pink-500/25',
    titleHover: 'group-hover:text-pink-700 dark:group-hover:text-pink-300',
  },
  violet: {
    spotlightRgb: 'rgba(139, 92, 246, 0.16)',
    hoverBorder: 'hover:border-violet-400/70 dark:hover:border-violet-400/60 hover:shadow-violet-500/10',
    iconBase: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200/60 dark:border-violet-500/20',
    iconHover: 'group-hover:bg-violet-500 group-hover:text-white group-hover:border-violet-400 group-hover:shadow-md group-hover:shadow-violet-500/25',
    titleHover: 'group-hover:text-violet-700 dark:group-hover:text-violet-300',
  },
  amber: {
    spotlightRgb: 'rgba(245, 158, 11, 0.16)',
    hoverBorder: 'hover:border-amber-400/70 dark:hover:border-amber-400/60 hover:shadow-amber-500/10',
    iconBase: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20',
    iconHover: 'group-hover:bg-amber-500 group-hover:text-zinc-950 group-hover:border-amber-400 group-hover:shadow-md group-hover:shadow-amber-500/25',
    titleHover: 'group-hover:text-amber-700 dark:group-hover:text-amber-300',
  },
}

export function InteractiveTiltCard({ title, description, icon, accent }: InteractiveTiltCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glowX: 50, glowY: 50, isHovered: false })
  const styles = ACCENT_STYLES[accent]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    const rotateY = (x - 0.5) * 14 // ±7 deg
    const rotateX = (0.5 - y) * 14 // ±7 deg

    setTilt({
      rotateX,
      rotateY,
      glowX: x * 100,
      glowY: y * 100,
      isHovered: true,
    })
  }

  const handleMouseLeave = () => {
    setTilt((prev) => ({
      ...prev,
      rotateX: 0,
      rotateY: 0,
      isHovered: false,
    }))
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: tilt.isHovered
          ? `perspective(900px) rotateX(${tilt.rotateX.toFixed(2)}deg) rotateY(${tilt.rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`
          : 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: tilt.isHovered
          ? 'transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1), border-color 200ms ease, box-shadow 200ms ease'
          : 'transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1), border-color 250ms ease, box-shadow 250ms ease',
        willChange: 'transform',
      }}
      className={`group relative flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800/70 shadow-xs hover:shadow-xl overflow-hidden ${styles.hoverBorder}`}
    >
      {/* Subtle Cursor-Tracking Color Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: tilt.isHovered ? 1 : 0,
          background: `radial-gradient(240px circle at ${tilt.glowX}% ${tilt.glowY}%, ${styles.spotlightRgb}, transparent 75%)`,
        }}
        aria-hidden="true"
      />

      {/* Icon Badge */}
      <div
        className={`relative z-10 p-3 rounded-xl border shrink-0 transition-all duration-300 group-hover:scale-110 ${styles.iconBase} ${styles.iconHover}`}
      >
        {icon}
      </div>

      {/* Text Content */}
      <div className="relative z-10 space-y-1.5">
        <h4 className={`text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-snug transition-colors duration-200 ${styles.titleHover}`}>
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}
