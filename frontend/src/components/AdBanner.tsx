import React, { useState } from 'react'
import { AnimatedGradient } from './AnimatedGradient'
import { Xmark, Mail } from 'iconoir-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DesktopSideBannerProps {
  side?: 'left' | 'right'
  className?: string
}

/**
 * Vertical Dotted Rectangle Skyscraper Ad Banner for Desktop Sides
 * Matches the user wireframe:
 * - Outer vertical dotted rectangle
 * - Inner square with animated gradient
 * - "Sponsored Ad" tag
 * - "Contact us to display ads here"
 */
export const DesktopSideBanner: React.FC<DesktopSideBannerProps> = ({
  side = 'left',
  className = '',
}) => {
  return (
    <aside
      aria-label={`Sponsored Advertisement (${side})`}
      className={`w-full flex flex-col p-3.5 bg-white/60 dark:bg-[#141419]/60 backdrop-blur-xs border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-xs transition-colors hover:border-neutral-400 dark:hover:border-neutral-600 ${className}`}
    >
      {/* Top Square: Dotted border with Animated Gradient */}
      <div className="w-full aspect-square rounded-xl overflow-hidden border border-dashed border-neutral-300 dark:border-neutral-700 relative shadow-inner">
        <AnimatedGradient showBadge={false} />
      </div>

      {/* Content Below Square */}
      <div className="flex flex-col items-center text-center mt-3 pt-2.5 border-t border-dashed border-neutral-200 dark:border-neutral-800 flex-1 justify-between">
        <div className="flex flex-col items-center">
          {/* Sponsored Ad Badge */}
          <div className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider mb-1.5">
            <span>Sponsored Ad</span>
          </div>

          {/* Contact Text */}
          <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300 leading-tight">
            Contact us to display ads here
          </p>
          <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
            Reach 10,000+ daily players
          </span>
        </div>

        {/* Action Button / Mailto Link */}
        <a
          href="mailto:ads@botornot.game?subject=Ad%20Placement%20Inquiry%20(Desktop%20Banner)&body=Hi%20Bot%20or%20Not%20Team%2C%0A%0AI'm%20interested%20in%20placing%20a%20sponsored%20banner%20ad%20on%20Bot%20or%20Not.%20Please%20send%20over%20the%20ad%20rates%20and%20specifications.%0A%0AThanks!"
          className="mt-3 w-full py-1.5 px-2.5 bg-[#FFD100] hover:bg-[#E6BC00] text-black rounded-xl border border-black/20 text-[11px] font-black font-display uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Inquire Now</span>
        </a>
      </div>
    </aside>
  )
}

interface MobileStickyBannerProps {
  className?: string
}

/**
 * Sticky Horizontal Rectangle Ad Banner for Mobile View
 * - Stays fixed/sticky above bottom safe-area
 * - Horizontal layout with mini square animated gradient
 * - "Sponsored Ad" + "Contact us to display ads here"
 * - Small X mark button to dismiss
 */
export const MobileStickyBanner: React.FC<MobileStickyBannerProps> = ({
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={`fixed bottom-3 inset-x-3 sm:inset-x-6 z-40 max-w-lg mx-auto ${className}`}
        style={{
          bottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        }}
        role="complementary"
        aria-label="Mobile Sponsored Ad"
      >
        <div className="relative flex items-center justify-between gap-3 p-2.5 sm:p-3 bg-white/95 dark:bg-[#141419]/95 backdrop-blur-md border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-lg">
          {/* Left Mini Square: Animated Gradient */}
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-dashed border-neutral-300 dark:border-neutral-700 relative shrink-0 shadow-inner">
            <AnimatedGradient badgeText="AD" showBadge={false} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-mono text-[9px] font-black text-white/90 bg-black/40 px-1.5 py-0.5 rounded-full border border-white/20">
                AD
              </span>
            </div>
          </div>

          {/* Center Info & Contact */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Sponsored Ad
              </span>
            </div>
            <a
              href="mailto:ads@botornot.game?subject=Ad%20Placement%20Inquiry%20(Mobile%20Banner)&body=Hi%20Bot%20or%20Not%20Team%2C%0A%0AI'm%20interested%20in%20placing%20a%20sponsored%20banner%20ad%20on%20Bot%20or%20Not%20mobile.%20Please%20send%20over%20the%20ad%20rates.%0A%0AThanks!"
              className="text-xs sm:text-sm font-bold text-black dark:text-white leading-tight block truncate hover:underline"
            >
              Contact us to display ads here
            </a>
          </div>

          {/* Right: Small X mark to ignore/dismiss */}
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-full text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
            title="Dismiss ad"
            aria-label="Dismiss ad"
          >
            <Xmark className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

