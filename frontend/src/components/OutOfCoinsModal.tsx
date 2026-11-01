import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlaySolid } from 'iconoir-react'
import { Button } from './UI'
import { CoinIcon } from './CoinIcon'

interface OutOfCoinsModalProps {
  isOpen: boolean
  onClose: () => void
  onWatchAd: () => void
}

export const OutOfCoinsModal: React.FC<OutOfCoinsModalProps> = ({
  isOpen,
  onClose,
  onWatchAd,
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
            className="w-full max-w-sm bg-white dark:bg-[#181820] border-2 border-black dark:border-neutral-700 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#000] dark:shadow-none text-center"
          >
            <div className="w-12 h-12 bg-[#FFD100] rounded-2xl border-2 border-black flex items-center justify-center mx-auto mb-3 shadow-[2px_2px_0px_0px_#000]">
              <CoinIcon size="md" />
            </div>

            <h3 className="font-display font-black text-xl text-black dark:text-white mb-1 uppercase tracking-tight">
              Out of Coins!
            </h3>
            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              Extended chat requires 1 coin per message. Watch a quick sponsor video to instantly refill{' '}
              <strong className="text-black dark:text-white">+10 Human Coins</strong>!
            </p>

            <div className="space-y-2">
              <Button
                variant="primary"
                fullWidth
                onClick={onWatchAd}
                className="py-2.5 text-xs font-black uppercase tracking-wider border-2"
              >
                <PlaySolid className="w-4 h-4 mr-1.5" />
                Watch Ad (+10 🪙)
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
                className="py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
