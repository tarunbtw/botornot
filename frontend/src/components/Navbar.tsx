import React from 'react'
import { CyborgAvatar } from './CyborgAvatar'
import { CoinIcon } from './CoinIcon'
import { Flame, Volume2, VolumeX, Trophy, Settings, Gift, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { isSoundEnabled, setSoundEnabled } from '../lib/audio'
import type { UserProfileResponse } from '../lib/api'

interface NavbarProps {
  coins: number
  streak: number
  user?: UserProfileResponse | null
  onOpenLeaderboard?: () => void
  onOpenSettings?: () => void
  onHomeClick?: () => void
  onOpenQuests?: () => void
  onOpenProfile?: () => void
  unclaimedQuestsCount?: number
}

export function Navbar({
  coins,
  streak,
  user,
  onOpenLeaderboard,
  onOpenSettings,
  onHomeClick,
  onOpenQuests,
  onOpenProfile,
  unclaimedQuestsCount = 0,
}: NavbarProps) {
  const [sound, setSound] = React.useState(isSoundEnabled())

  const toggleSound = () => {
    const next = !sound
    setSound(next)
    setSoundEnabled(next)
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

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF5]/95 backdrop-blur-md border-b-4 border-black px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo with Yellow & White Cyborg Avatar */}
        <div
          onClick={onHomeClick}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
        >
          <CyborgAvatar size="sm" />
          <div className="flex flex-col leading-none">
            <span className="font-display font-black text-lg sm:text-2xl tracking-tight text-black flex items-center gap-1 sm:gap-1.5">
              Bot
              <span className="text-black bg-[#FFD100] px-1.5 sm:px-2 py-0.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                OR Not?
              </span>
            </span>
            <span className="font-mono text-[10px] font-bold text-neutral-600 mt-0.5 hidden md:inline">
              THE SOCIAL TURING EXPERIMENT • 2-MIN CHAT
            </span>
          </div>
        </div>

        {/* Center Quick Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-white border-2 border-black rounded-2xl px-2 py-1 shadow-[2px_2px_0px_0px_#000]">
          <button
            onClick={onHomeClick}
            className="px-3 py-1 rounded-xl text-xs font-display font-black hover:bg-[#FFD100] transition-colors cursor-pointer"
          >
            PLAY
          </button>
          <button
            onClick={handleScrollToHowItWorks}
            className="px-3 py-1 rounded-xl text-xs font-display font-black hover:bg-[#FFD100] transition-colors cursor-pointer"
          >
            HOW IT WORKS
          </button>
          <button
            onClick={onOpenLeaderboard}
            className="px-3 py-1 rounded-xl text-xs font-display font-black hover:bg-[#FFD100] transition-colors cursor-pointer"
          >
            LEADERBOARD
          </button>
          {onOpenQuests && (
            <button
              onClick={onOpenQuests}
              className="px-3 py-1 rounded-xl text-xs font-display font-black hover:bg-[#FFD100] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>QUESTS</span>
              {unclaimedQuestsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          )}
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-3 py-1 rounded-xl text-xs font-display font-black hover:bg-[#FFD100] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{user && !user.id.startsWith('guest_') ? (user.name.split(' ')[0] || 'PROFILE') : 'PROFILE'}</span>
            </button>
          )}
        </nav>

        {/* Right Action Badges (Optimized for Mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Daily Quests Gift Button */}
          {onOpenQuests && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenQuests}
              className="relative p-1.5 sm:p-2 bg-[#FFD100] hover:bg-[#E6BC00] transition-colors border-2 sm:border-3 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] cursor-pointer"
              title="Daily Quests & Check-In"
            >
              <Gift className="w-4 h-4 text-black" />
              {unclaimedQuestsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-[1px_1px_0px_0px_#000] animate-bounce">
                  {unclaimedQuestsCount}
                </span>
              )}
            </motion.button>
          )}

          {/* Coins Pill */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 bg-[#FFD100] border-2 sm:border-3 border-black rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 font-mono font-black text-xs sm:text-sm shadow-[2px_2px_0px_0px_#000]"
            title="Human Coins"
          >
            <CoinIcon size="xs" />
            <span>{coins}</span>
          </motion.div>

          {/* Streak Pill */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1 bg-white border-2 sm:border-3 border-black rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 font-mono font-black text-xs sm:text-sm shadow-[2px_2px_0px_0px_#000]"
            title="Win Streak"
          >
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
            <span>{streak}</span>
          </motion.div>

          {/* Sound Toggle (Mobile & Desktop) */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleSound}
            className="p-1.5 sm:p-2 bg-white hover:bg-neutral-100 border-2 sm:border-3 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] cursor-pointer"
            title={sound ? 'Mute Sound' : 'Enable Sound'}
          >
            {sound ? (
              <Volume2 className="w-4 h-4 text-black" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-400" />
            )}
          </motion.button>

          {/* Leaderboard Button (Tablet/Desktop only to save mobile header space) */}
          {onOpenLeaderboard && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenLeaderboard}
              className="hidden sm:flex p-2 bg-white hover:bg-[#FFD100]/30 transition-colors border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] cursor-pointer"
              title="Global Leaderboard"
            >
              <Trophy className="w-4 h-4 text-[#FFD100] fill-[#FFD100]" />
            </motion.button>
          )}

          {/* Settings Button */}
          {onOpenSettings && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenSettings}
              className="hidden sm:flex p-2 bg-white hover:bg-[#FFD100]/30 transition-colors border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] cursor-pointer"
              title="Settings & Rules"
            >
              <Settings className="w-4 h-4 text-black" />
            </motion.button>
          )}

          {/* Profile & Auth Button */}
          {onOpenProfile && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenProfile}
              className="p-1.5 sm:p-2 bg-white hover:bg-[#FFD100] transition-colors border-2 sm:border-3 border-black rounded-xl shadow-[2px_2px_0px_0px_#000] cursor-pointer flex items-center justify-center shrink-0"
              title={user && !user.id.startsWith('guest_') ? `Signed in as ${user.name}` : 'Profile & Account'}
            >
              {user?.image ? (
                <img src={user.image} alt={user.name} className="w-4 h-4 rounded-full border border-black object-cover" />
              ) : (
                <User className="w-4 h-4 text-black" />
              )}
            </motion.button>
          )}
        </div>
      </div>
    </header>
  )
}

