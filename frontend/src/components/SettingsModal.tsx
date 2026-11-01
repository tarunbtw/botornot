import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Xmark, SoundHigh, SoundOff, Settings, HelpCircle } from 'iconoir-react'
import { Card } from './UI'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  sound: boolean
  onToggleSound: () => void
  onOpenProfile?: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sound,
  onToggleSound,
  onOpenProfile: _onOpenProfile,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            className="w-full max-w-sm"
          >
            <Card className="relative bg-[#FAFAF8] dark:bg-[#181820] p-5 border-2 border-black dark:border-neutral-700 shadow-[4px_4px_0px_0px_#000] dark:shadow-none">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-black dark:text-white"
              >
                <Xmark className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-[#FFD100] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
                  <Settings className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-black text-black dark:text-white leading-none">
                    Settings
                  </h3>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {/* Sound FX Toggle */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-[#1E1E28] border-2 border-black dark:border-neutral-700 rounded-xl shadow-[2px_2px_0px_0px_#000] dark:shadow-none">
                  <div className="flex items-center gap-2.5">
                    {sound ? (
                      <SoundHigh className="w-4 h-4 text-black dark:text-white" />
                    ) : (
                      <SoundOff className="w-4 h-4 text-neutral-400" />
                    )}
                    <div>
                      <div className="text-xs font-black uppercase text-black dark:text-white">Sound Effects</div>
                      <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">Audio feedback during timer &amp; verdict</div>
                    </div>
                  </div>
                  <button
                    onClick={onToggleSound}
                    className={`px-3 py-1 rounded-lg border border-black dark:border-neutral-700 font-mono text-xs font-black cursor-pointer transition-colors ${
                      sound ? 'bg-[#FFD100] text-black shadow-[1px_1px_0px_0px_#000]' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {sound ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Match Duration Indicator */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-[#1E1E28] border-2 border-black dark:border-neutral-700 rounded-xl shadow-[2px_2px_0px_0px_#000] dark:shadow-none">
                  <div>
                    <div className="text-xs font-black uppercase text-black dark:text-white">Chat Duration</div>
                    <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">Turing experiment standard</div>
                  </div>
                  <span className="font-mono text-xs font-black bg-[#FFD100] text-black px-2.5 py-1 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000]">
                    2 MIN (120s)
                  </span>
                </div>

                {/* Game Info Summary */}
                <div className="p-3.5 bg-white dark:bg-[#1E1E28] border-2 border-black dark:border-neutral-700 rounded-xl shadow-[2px_2px_0px_0px_#000] dark:shadow-none">
                  <h4 className="font-black text-xs uppercase flex items-center gap-1.5 mb-1.5 text-black dark:text-white">
                    <HelpCircle className="w-3.5 h-3.5 text-black dark:text-white" /> Game Rules
                  </h4>
                  <ul className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1 list-disc pl-4 font-bold">
                    <li>120s live anonymous chat.</li>
                    <li>Guess Human or Bot at timer expiration.</li>
                    <li>Correct guesses earn +10 coins and streak.</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
