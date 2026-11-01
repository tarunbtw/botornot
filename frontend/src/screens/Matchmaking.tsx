import React from 'react'
import { CyborgAvatar } from '../components/CyborgAvatar'
import { Button } from '../components/UI'
import { motion } from 'framer-motion'
import { Sparks, Xmark } from 'iconoir-react'

interface MatchmakingProps {
  onCancel: () => void
}

export const Matchmaking: React.FC<MatchmakingProps> = ({ onCancel }) => {
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-12 flex flex-col items-center justify-center flex-1 select-none min-h-[75vh]">
      {/* Central Radar Pulse Animation */}
      <div className="relative flex items-center justify-center my-8">
        <motion.div
          animate={{ scale: [1, 1.8, 1], opacity: [0.35, 0, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-44 h-44 sm:w-52 sm:h-52 bg-[#FFD100] rounded-full border border-black/20"
        />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          className="absolute w-36 h-36 sm:w-40 sm:h-40 bg-[#FFD100] rounded-full border border-black/20"
        />

        {/* Central Character Face Avatar */}
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 p-4 bg-white dark:bg-[#181820] rounded-2xl border border-black/15 dark:border-neutral-700 shadow-xs flex items-center justify-center"
        >
          <CyborgAvatar size="xl" />
        </motion.div>
      </div>

      {/* Clean Status & Connecting State */}
      <div className="text-center space-y-2 max-w-sm mt-4 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD100] border border-black text-xs font-mono font-black uppercase shadow-[1px_1px_0px_0px_#000] text-black">
          <Sparks className="w-3.5 h-3.5 text-black" />
          <span>Matchmaking</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-black dark:text-white">
          Finding Opponent...
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 font-bold text-xs sm:text-sm">
          Pairing you with an anonymous partner. 2-minute round starts immediately.
        </p>
      </div>

      {/* Cancel button */}
      <Button
        variant="secondary"
        size="md"
        onClick={onCancel}
        className="px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-xs"
      >
        <Xmark className="w-4 h-4 mr-1 text-neutral-600" />
        Cancel
      </Button>
    </div>
  )
}
