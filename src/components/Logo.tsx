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
      {/* Brand Icon SVG */}
      <div className={`relative ${iconSize} flex-shrink-0 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 p-1.5 border border-zinc-700/80 shadow-md group transition-transform duration-200 hover:scale-105`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="logoCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <linearGradient id="logoPink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>

          {/* 3D Slicing Stratum Lines */}
          <line x1="8" y1="36" x2="40" y2="36" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <line x1="12" y1="31" x2="36" y2="31" stroke="#52525b" strokeWidth="1.75" strokeLinecap="round" opacity="0.8" />

          {/* Left Cyclone Curve (Cyan) */}
          <path
            d="M24 7 C15 7 9 13 9 20 C9 27 15 32 23 35 C19 33 15 28 15 22 C15 16 18 12 24 10 Z"
            fill="url(#logoCyan)"
          />

          {/* Right Cyclone Curve (Fuchsia) */}
          <path
            d="M24 41 C33 41 39 35 39 28 C39 21 33 16 25 13 C29 15 33 20 33 26 C33 32 30 36 24 38 Z"
            fill="url(#logoPink)"
          />

          {/* Center Precision Quick-Release Core & Nozzle Point */}
          <circle cx="24" cy="24" r="5" fill="#09090b" stroke="url(#logoCyan)" strokeWidth="2.2" />
          <circle cx="24" cy="24" r="2" fill="#db2777" />

          {/* Calibrated Snap Detent Marker */}
          <line x1="24" y1="3" x2="24" y2="6.5" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" />
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
