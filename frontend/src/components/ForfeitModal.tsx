import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WarningTriangle } from 'iconoir-react'
import { Button } from './UI'

interface ForfeitModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const ForfeitModal: React.FC<ForfeitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
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
            <div className="w-10 h-10 bg-red-100 dark:bg-red-950/60 rounded-xl border border-black dark:border-neutral-700 flex items-center justify-center mx-auto mb-3 text-red-600 dark:text-red-400">
              <WarningTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-display font-black text-lg text-black dark:text-white mb-1 uppercase">
              Abandon Match?
            </h3>
            <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
              Leaving early will reset your streak. Are you sure you want to quit?
            </p>

            <div className="flex gap-2.5">
              <Button
                variant="danger"
                fullWidth
                onClick={() => {
                  onClose()
                  onConfirm()
                }}
                className="py-2 text-xs font-black uppercase tracking-wider"
              >
                Quit Match
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
                className="py-2 text-xs font-black uppercase tracking-wider"
              >
                Stay
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
