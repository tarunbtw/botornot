import React from 'react'
import { CyborgAvatar } from '../components/CyborgAvatar'
import { Button, Card } from '../components/UI'
import { AdSlot } from '../components/AdSlot'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

interface MatchmakingProps {
  onCancel: () => void
}

export const Matchmaking: React.FC<MatchmakingProps> = ({ onCancel }) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col justify-between flex-1 select-none min-h-[85vh]">
      {/* Central Loading Animation & Status */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 my-auto">
        {/* Radar Pulse Animation in Yellow & White */}
        <div className="relative flex items-center justify-center my-4">
          <motion.div
            animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-44 h-44 sm:w-56 sm:h-56 bg-[#FFD100] rounded-full border-3 border-black"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0.15, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            className="absolute w-36 h-36 sm:w-44 sm:h-44 bg-[#FFD100] rounded-full border-3 border-black"
          />

          {/* Central Cyborg Face Avatar */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 p-4 sm:p-5 bg-white rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_#000] flex items-center justify-center"
          >
            <CyborgAvatar size="xl" />
          </motion.div>
        </div>

        {/* Clean Status & Please Wait Message */}
        <div className="text-center space-y-1.5 shrink-0 max-w-sm">
          <h2 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-black">
            Finding Match...
          </h2>
          <p className="text-neutral-700 font-bold text-xs sm:text-sm animate-pulse">
            Connecting to partner. Please wait...
          </p>
        </div>

        {/* 1 Clean Turing Fact (Uncluttered) */}
        <div className="w-full max-w-md mt-2">
          <Card className="p-4 bg-white border-3 text-center shadow-[4px_4px_0px_0px_#000]">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-black text-black mb-1">
              <Sparkles className="w-4 h-4 text-[#FFD100] fill-[#FFD100]" />
              <span>DID YOU KNOW?</span>
            </div>
            <p className="text-xs font-bold text-neutral-700 leading-relaxed">
              In 1950, Alan Turing predicted that machines would eventually converse so well that humans would struggle to tell them apart.
            </p>
          </Card>
        </div>
      </div>

      {/* Ad slot & Cancel button at bottom */}
      <div className="mt-6 flex flex-col items-center gap-4 shrink-0">
        <div className="w-full">
          <div className="hidden sm:block">
            <AdSlot format="leaderboard" id="matchmaking-desktop-ad" />
          </div>
          <div className="sm:hidden">
            <AdSlot format="mobile_banner" id="matchmaking-mobile-ad" />
          </div>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={onCancel}
          className="px-8 py-2.5 text-xs font-black uppercase tracking-wider border-3 shadow-[3px_3px_0px_0px_#000]"
        >
          Cancel Matchmaking
        </Button>
      </div>
    </div>
  )
}
