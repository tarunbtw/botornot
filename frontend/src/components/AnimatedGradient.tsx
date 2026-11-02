import React, { useId } from 'react'

interface AnimatedGradientProps {
  className?: string
  badgeText?: string
  showBadge?: boolean
  interactive?: boolean
}

/**
 * AnimatedGradient component inspired by React Bits (Aurora / Grainient background).
 * Renders an ambient shifting multi-layer mesh gradient with luminous blobs
 * and a subtle procedural noise overlay.
 */
export const AnimatedGradient: React.FC<AnimatedGradientProps> = ({
  className = '',
  badgeText = 'AD SPACE',
  showBadge = true,
}) => {
  const filterId = useId()

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-[#0A0A0E] select-none rounded-[inherit] ${className}`}
    >
      {/* Dynamic Aurora / Mesh Blobs */}
      <div className="absolute inset-0 filter blur-[22px] sm:blur-[28px] opacity-85 mix-blend-screen scale-110 pointer-events-none">
        {/* Blob 1: BotOrNot Brand Yellow */}
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full bg-[#FFD100] animate-aurora-1" />

        {/* Blob 2: Vibrant Indigo/Purple */}
        <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full bg-[#7C3AED] animate-aurora-2" />

        {/* Blob 3: Cyber Cyan */}
        <div className="absolute top-1/4 -right-1/4 w-2/3 h-2/3 rounded-full bg-[#06B6D4] animate-aurora-3" />

        {/* Blob 4: Neon Pink/Coral */}
        <div className="absolute -bottom-1/4 left-1/4 w-2/3 h-2/3 rounded-full bg-[#F43F5E] animate-aurora-1 [animation-delay:-4s]" />
      </div>

      {/* Subtle Grain / Noise Overlay (React Bits signature texture) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-25 pointer-events-none mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${filterId})`} />
      </svg>

      {/* Center Watermark / Glass Badge */}
      {showBadge && (
        <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
          <div className="backdrop-blur-md bg-black/45 border border-white/20 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-sm">
            <span className="font-mono font-bold text-[10px] text-white tracking-wider">
              {badgeText}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

