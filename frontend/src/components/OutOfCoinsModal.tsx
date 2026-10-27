import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlaySquare } from 'lucide-react'
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
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 30 }}
            className="w-full max-w-sm bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_#000] text-center"
          >
            <div className="w-16 h-16 bg-[#FFD100] rounded-3xl border-3 border-black flex items-center justify-center mx-auto mb-3 shadow-[4px_4px_0px_0px_#000]">
              <CoinIcon size="lg" />
            </div>

            <h3 className="font-display font-black text-2xl text-black mb-1 uppercase tracking-tight">
              Out of Coins!
            </h3>
            <p className="text-xs font-bold text-neutral-700 leading-relaxed mb-5">
              Extended chat requires 1 coin per message. Watch a quick sponsor video to instantly refill{' '}
              <strong>+10 Human Coins</strong>!
            </p>

            <div className="space-y-2.5">
              <Button
                variant="primary"
                fullWidth
                onClick={onWatchAd}
                className="py-3 text-xs font-black uppercase tracking-wider border-3 shadow-[4px_4px_0px_0px_#000]"
              >
                <PlaySquare className="w-4 h-4 mr-2" />
                Watch Ad (+10 🪙)
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
                className="py-2.5 text-xs font-black uppercase tracking-wider"
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
