import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'

interface MenuItem {
  label: string
  to: string
  isAction?: boolean
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Turner Index', to: '/turner-index' },
  { label: 'Roadmap', to: '/roadmap' },
  { label: 'Login', to: '/profile', isAction: true },
]

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="md:hidden">
      {/* Dim backdrop when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#232323]/50 backdrop-blur-xs z-40"
          />
        )}
      </AnimatePresence>

      {/* Floating Menu Container fixed at bottom-center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
        {/* Expanded Sheet Card */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="pointer-events-auto w-64 sm:w-72 mb-2.5 bg-[#232323] text-[#f1eee7] rounded-2xl border-2 border-[#232323] shadow-[4px_4px_0px_#232323] p-4 flex flex-col overflow-hidden"
            >
              <nav className="flex flex-col space-y-1.5 py-1">
                {MENU_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-lg font-pixel text-xs sm:text-sm font-bold tracking-wide transition-all flex items-center justify-between ${
                        isActive
                          ? 'text-[#22c55e] underline underline-offset-4 decoration-2 bg-white/5'
                          : 'text-[#f1eee7]/85 hover:text-[#22c55e] hover:bg-white/5'
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    {item.isAction && (
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#22c55e]" />
                    )}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Bar Toggle Button (≡ Menu / ✕ Menu) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="pointer-events-auto w-64 sm:w-72 h-11 bg-[#232323] text-[#f1eee7] rounded-xl font-pixel text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border-2 border-[#232323] shadow-[3px_3px_0px_#232323] hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer select-none"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <>
              <X className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Menu</span>
            </>
          ) : (
            <>
              <Menu className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Menu</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
