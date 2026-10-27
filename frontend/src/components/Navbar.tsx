import React from 'react'
import { CyborgAvatar } from './CyborgAvatar'
import { CoinIcon } from './CoinIcon'
import { Flame, Volume2, VolumeX, Trophy, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { isSoundEnabled, setSoundEnabled } from '../lib/audio'

interface NavbarProps {
  coins: number
  streak: number
  onOpenLeaderboard?: () => void
  onOpenSettings?: () => void
  onHomeClick?: () => void
}

export function Navbar({
  coins,
  streak,
  onOpenLeaderboard,
  onOpenSettings,
  onHomeClick,
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
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF5]/95 backdrop-blur-md border-b-4 border-black px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo with Yellow & White Cyborg Avatar */}
        <div
          onClick={onHomeClick}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <CyborgAvatar size="sm" />
          <div className="flex flex-col leading-none">
            <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-black flex items-center gap-1.5">
              Bot
              <span className="text-black bg-[#FFD100] px-2 py-0.5 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                OR Not?
              </span>
            </span>
            <span className="font-mono text-[10px] font-bold text-neutral-600 mt-1 hidden sm:inline">
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
        </nav>

        {/* Right Action Badges */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Coins Pill */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 bg-[#FFD100] border-3 border-black rounded-xl px-2.5 sm:px-3.5 py-1.5 font-mono font-black text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000]"
            title="Human Coins"
          >
            <CoinIcon size="sm" />
            <span>{coins}</span>
          </motion.div>

          {/* Streak Pill */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 bg-white border-3 border-black rounded-xl px-2.5 sm:px-3.5 py-1.5 font-mono font-black text-xs sm:text-sm shadow-[3px_3px_0px_0px_#000]"
            title="Win Streak"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>{streak}</span>
          </motion.div>

          {/* Leaderboard Button */}
          {onOpenLeaderboard && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenLeaderboard}
              className="p-2 bg-white hover:bg-[#FFD100]/30 transition-colors border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] cursor-pointer"
              title="Global Leaderboard"
            >
              <Trophy className="w-4 h-4 text-[#FFD100] fill-[#FFD100]" />
            </motion.button>
          )}

          {/* Sound Toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleSound}
            className="p-2 bg-white hover:bg-neutral-100 border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] cursor-pointer"
            title={sound ? 'Mute Sound' : 'Enable Sound'}
          >
            {sound ? (
              <Volume2 className="w-4 h-4 text-black" />
            ) : (
              <VolumeX className="w-4 h-4 text-neutral-400" />
            )}
          </motion.button>

          {/* Settings Button */}
          {onOpenSettings && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onOpenSettings}
              className="p-2 bg-white hover:bg-[#FFD100]/30 transition-colors border-3 border-black rounded-xl shadow-[3px_3px_0px_0px_#000] cursor-pointer"
              title="Settings & Rules"
            >
              <Settings className="w-4 h-4 text-black" />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  )
}
