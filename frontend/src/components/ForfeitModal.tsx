import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
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
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_#000] text-center"
          >
            <div className="w-12 h-12 bg-red-100 rounded-2xl border-3 border-black flex items-center justify-center mx-auto mb-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-black text-xl text-black mb-1 uppercase">
              Abandon Match?
            </h3>
            <p className="text-xs font-bold text-neutral-700 leading-relaxed mb-5">
              Leaving early will penalize your streak by <strong>-1</strong>. Are you sure you want to quit?
            </p>

            <div className="flex gap-3">
              <Button
                variant="danger"
                fullWidth
                onClick={() => {
                  onClose()
                  onConfirm()
                }}
                className="py-2.5 text-xs font-black uppercase tracking-wider"
              >
                Leave (-1 🔥)
              </Button>
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
                className="py-2.5 text-xs font-black uppercase tracking-wider"
              >
                Stay &amp; Chat
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
