import { useState } from 'react'
import { CyborgAvatar } from './CyborgAvatar'
import { CoinIcon } from './CoinIcon'
import {
  FireFlame,
  SoundHigh,
  SoundOff,
  Trophy,
  SunLight,
  HalfMoon,
  NavArrowRight,
  Play,
  HelpCircle,
  Gift,
} from 'iconoir-react'
import { motion, AnimatePresence } from 'framer-motion'
import { isSoundEnabled, setSoundEnabled } from '../lib/audio'
import type { UserProfileResponse } from '../lib/api'

interface NavbarProps {
  coins: number
  streak: number
  user?: UserProfileResponse | null
  onOpenLeaderboard?: () => void
  onHomeClick?: () => void
  onOpenQuests?: () => void
  onOpenProfile?: () => void
  unclaimedQuestsCount?: number
  isDark?: boolean
  onToggleTheme?: () => void
  currentPage?: string
}

export function Navbar({
  coins,
  streak,
  user,
  onOpenLeaderboard,
  onHomeClick,
  onOpenQuests,
  onOpenProfile,
  unclaimedQuestsCount = 0,
  isDark = false,
  onToggleTheme,
  currentPage = 'HOME',
}: NavbarProps) {
  const [sound, setSound] = useState(isSoundEnabled())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleSound = () => {
    const next = !sound
    setSound(next)
    setSoundEnabled(next)
  }

  const handlePlayClick = () => {
    onHomeClick?.()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleScrollToHowItWorks = () => {
    onHomeClick?.()
    setTimeout(() => {
      const el = document.getElementById('how-it-works')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 60)
  }

  const avatarSeed = user?.email || user?.name || user?.publicId || 'player'

  const isPlayActive = currentPage === 'HOME' || currentPage === 'MATCHMAKING' || currentPage === 'CHAT' || currentPage === 'GUESS'
  const isLeaderboardActive = currentPage === 'LEADERBOARD'
  const isQuestsActive = currentPage === 'QUESTS'
  const isProfileActive = currentPage === 'PROFILE'

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAFAF8] dark:bg-[#0E0E12] border-b-2 border-black dark:border-neutral-800 px-4 sm:px-6 lg:px-8 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo - Top Left */}
        <div
          onClick={handlePlayClick}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
        >
          <CyborgAvatar size="sm" />
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-black dark:text-white">
              Bot <span className="font-medium text-neutral-400">or</span> Not
            </span>
          </div>
        </div>

        {/* Center Navigation Links: Desktop Only */}
        <nav className="hidden md:flex items-center gap-6">
          <button
            onClick={handlePlayClick}
            className={`relative py-1 text-xs sm:text-sm font-display font-bold transition-colors cursor-pointer ${
              isPlayActive
                ? 'text-black dark:text-[#FFD100]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <span>Play</span>
            {isPlayActive && (
              <span className="absolute -bottom-2.5 left-0 right-0 h-[2.5px] bg-black dark:bg-[#FFD100] rounded-full" />
            )}
          </button>
          <button
            onClick={handleScrollToHowItWorks}
            className="relative py-1 text-xs sm:text-sm font-display font-bold text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={onOpenLeaderboard}
            className={`relative py-1 text-xs sm:text-sm font-display font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              isLeaderboardActive
                ? 'text-black dark:text-[#FFD100]'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Leaderboard</span>
            {isLeaderboardActive && (
              <span className="absolute -bottom-2.5 left-0 right-0 h-[2.5px] bg-black dark:bg-[#FFD100] rounded-full" />
            )}
          </button>
          {onOpenQuests && (
            <button
              onClick={onOpenQuests}
              className={`relative py-1 text-xs sm:text-sm font-display font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                isQuestsActive
                  ? 'text-black dark:text-[#FFD100]'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <span>Quests</span>
              {unclaimedQuestsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              {isQuestsActive && (
                <span className="absolute -bottom-2.5 left-0 right-0 h-[2.5px] bg-black dark:bg-[#FFD100] rounded-full" />
              )}
            </button>
          )}
        </nav>

        {/* Right Desktop Controls (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {/* Coins Pill */}
          <div
            className="flex items-center gap-1.5 bg-[#FFD100] border border-black/20 dark:border-black/40 rounded-xl px-2.5 py-1 font-mono font-bold text-xs sm:text-sm text-black shadow-xs"
            title="Human Coins"
          >
            <CoinIcon size="xs" />
            <span>{coins}</span>
          </div>

          {/* Streak Pill */}
          <div
            className="flex items-center gap-1 bg-white dark:bg-[#1E1E26] border border-neutral-300 dark:border-neutral-700 rounded-xl px-2.5 py-1 font-mono font-bold text-xs sm:text-sm text-black dark:text-white shadow-xs"
            title="Win Streak"
          >
            <FireFlame className="w-3.5 h-3.5 text-orange-500" />
            <span>{streak}</span>
          </div>

          {/* Theme Toggle (Dark / Light) */}
          {onToggleTheme && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              className="p-2 bg-white dark:bg-[#1E1E26] hover:bg-neutral-100 dark:hover:bg-[#272733] border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-xs cursor-pointer text-black dark:text-[#FFD100]"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <SunLight className="w-4 h-4" /> : <HalfMoon className="w-4 h-4" />}
            </motion.button>
          )}

          {/* Sound Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleSound}
            className="p-2 bg-white dark:bg-[#1E1E26] hover:bg-neutral-100 dark:hover:bg-[#272733] border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-xs cursor-pointer text-black dark:text-neutral-300"
            title={sound ? 'Mute Sound' : 'Enable Sound'}
          >
            {sound ? (
              <SoundHigh className="w-4 h-4" />
            ) : (
              <SoundOff className="w-4 h-4 text-neutral-400" />
            )}
          </motion.button>

          {/* Profile Avatar (Desktop Click opens Profile screen) */}
          {onOpenProfile && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenProfile}
              className={`w-9 h-9 rounded-full border overflow-hidden shadow-xs cursor-pointer shrink-0 bg-neutral-200 dark:bg-neutral-800 p-0 hover:scale-105 transition-transform ${
                isProfileActive
                  ? 'border-black dark:border-[#FFD100]'
                  : 'border-neutral-300 dark:border-neutral-700'
              }`}
              title={user && !user.id.startsWith('guest_') ? `Signed in as ${user.name}` : 'Profile'}
            >
              <img
                src={`https://blobatar.dev/avatar/${encodeURIComponent(avatarSeed)}`}
                alt={user?.name || 'Player'}
                className="w-full h-full object-cover"
              />
            </motion.button>
          )}
        </div>

        {/* Mobile View: ONLY the Profile Avatar at the top right */}
        <div className="flex md:hidden items-center">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className={`w-9 h-9 rounded-full border overflow-hidden shadow-xs cursor-pointer shrink-0 bg-neutral-200 dark:bg-neutral-800 p-0 transition-transform ${
              isMobileMenuOpen || isProfileActive
                ? 'border-black dark:border-[#FFD100]'
                : 'border-neutral-300 dark:border-neutral-700'
            }`}
            title="Menu & Profile"
          >
            <img
              src={`https://blobatar.dev/avatar/${encodeURIComponent(avatarSeed)}`}
              alt={user?.name || 'Player'}
              className="w-full h-full object-cover"
            />
          </motion.button>
        </div>
      </div>

      {/* Clean Minimal Mobile Dropdown Menu (Closes when touched anywhere else) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop: Touching anywhere else immediately closes */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
            />

            {/* Clean Dropdown Attached Beneath Navbar */}
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="absolute top-full right-3 w-72 max-w-[calc(100vw-24px)] mt-1.5 z-50 bg-white dark:bg-[#14141A] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-2 md:hidden"
            >
              {/* Profile Option */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  onOpenProfile?.()
                }}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={`https://blobatar.dev/avatar/${encodeURIComponent(avatarSeed)}`}
                    alt={user?.name || 'Player'}
                    className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-black dark:text-white leading-tight truncate">
                      {user?.name || 'Anonymous Human'}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      View Profile
                    </div>
                  </div>
                </div>
                <NavArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-black dark:group-hover:text-white shrink-0 transition-colors" />
              </button>

              <div className="my-1 border-t border-neutral-100 dark:border-neutral-800/80" />

              {/* Coins Option */}
              <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                <span className="flex items-center gap-2.5">
                  <CoinIcon size="xs" />
                  <span>Human Coins</span>
                </span>
                <span className="font-mono font-bold text-black dark:text-white">{coins}</span>
              </div>

              {/* Streak Option */}
              <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                <span className="flex items-center gap-2.5">
                  <FireFlame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Win Streak</span>
                </span>
                <span className="font-mono font-bold text-black dark:text-white">{streak}</span>
              </div>

              <div className="my-1 border-t border-neutral-100 dark:border-neutral-800/80" />

              {/* Theme Toggle Option */}
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {isDark ? <SunLight className="w-4 h-4 text-[#FFD100]" /> : <HalfMoon className="w-4 h-4 text-black dark:text-white" />}
                    <span>Theme</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400">
                    {isDark ? 'Dark' : 'Light'}
                  </span>
                </button>
              )}

              {/* Sound Toggle Option */}
              <button
                type="button"
                onClick={toggleSound}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {sound ? <SoundHigh className="w-4 h-4 text-black dark:text-white" /> : <SoundOff className="w-4 h-4 text-neutral-400" />}
                  <span>Sound</span>
                </span>
                <span className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400">
                  {sound ? 'On' : 'Muted'}
                </span>
              </button>

              <div className="my-1 border-t border-neutral-100 dark:border-neutral-800/80" />

              {/* Navigation Options */}
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handlePlayClick()
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Play className="w-4 h-4 text-neutral-400" />
                  <span>Play</span>
                </span>
                {isPlayActive && <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-[#FFD100]" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleScrollToHowItWorks()
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors text-left cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-neutral-400" />
                <span>How It Works</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  onOpenLeaderboard?.()
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors text-left cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-neutral-400" />
                  <span>Leaderboard</span>
                </span>
                {isLeaderboardActive && <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-[#FFD100]" />}
              </button>

              {onOpenQuests && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    onOpenQuests?.()
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Gift className="w-4 h-4 text-neutral-400" />
                    <span>Quests</span>
                  </span>
                  {unclaimedQuestsCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
