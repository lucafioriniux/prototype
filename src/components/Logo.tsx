import { useId } from 'react'

interface LogoProps {
  className?: string
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', showTagline = true, size = 'md' }: LogoProps) {
  const uid = useId().replace(/:/g, '')
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
  const wordmarkHeight = size === 'sm' ? 'h-4' : size === 'lg' ? 'h-7' : 'h-5 sm:h-[22px]'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Brand Icon SVG: Intentional 3D Form & Function Interlocking Mark */}
      <div className={`relative ${iconSize} flex-shrink-0 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 p-1.5 border border-zinc-700/80 shadow-md group transition-transform duration-200 hover:scale-105`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`iconForm-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id={`iconFunction-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Subtle Isometric Blueprint Boundary */}
          <path
            d="M24 4.5 L41 14 V34 L24 43.5 L7 34 V14 Z"
            stroke="#52525b"
            strokeWidth="1.2"
            strokeOpacity="0.45"
            strokeLinejoin="round"
          />

          {/* Form Piece: Structural Top & Spine (Cyan) */}
          <path
            d="M24 7.5 L38.5 15.5 L33 18.5 L24 13.5 L14.5 18.8 V36.5 L9.5 33.8 V15.5 Z"
            fill={`url(#iconForm-${uid})`}
          />

          {/* Function Piece: Interlocking Cantilever & Base Key (Blue -> Fuchsia) */}
          <path
            d="M18 23.5 L31.5 16 L37 19 L23.5 26.5 V32 L35 25.5 L38.5 27.5 V33.5 L24 41.5 L18 38.2 Z"
            fill={`url(#iconFunction-${uid})`}
          />
        </svg>
      </div>

      {/* Vectorized FORMA Wordmark Lockup */}
      <div className="flex flex-col">
        <div className="flex items-center">
          <svg
            viewBox="0 0 564 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${wordmarkHeight} w-auto text-zinc-900 dark:text-white`}
            role="img"
            aria-label="FORMA"
          >
            <defs>
              <linearGradient id={`forma-accent-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="55%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id={`forma-sheen-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.82" />
              </linearGradient>
            </defs>

            {/* F: Rounded top-left corner, crisp horizontal bars */}
            <path
              d="M18 83 V34 Q18 17 35 17 H84 M18 51 H73"
              stroke={`url(#forma-sheen-${uid})`}
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* O: Wide geometric capsule */}
            <rect
              x="114"
              y="17"
              width="88"
              height="66"
              rx="33"
              stroke={`url(#forma-sheen-${uid})`}
              strokeWidth="16"
            />

            {/* R: Rounded bowl + angled leg */}
            <path
              d="M234 83 V17 H278 C295 17 305 26 305 35 C305 45 295 53 278 53 H234 M269 53 L307 83"
              stroke={`url(#forma-sheen-${uid})`}
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* M: Dual vertical stems with high center valley */}
            <path
              d="M342 83 V17 L387 58 L432 17 V83"
              stroke={`url(#forma-sheen-${uid})`}
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* A: Signature crossbar-less chevron in vibrant Cyan -> Blue -> Fuchsia */}
            <path
              d="M465 83 L506 17 L547 83"
              stroke={`url(#forma-accent-${uid})`}
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {showTagline && (
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium leading-tight mt-1">
            Thoughtfully Designed. Precisely Made.
          </span>
        )}
      </div>
    </div>
  )
}

export default Logo
