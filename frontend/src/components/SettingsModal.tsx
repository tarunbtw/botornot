import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, VolumeX, Settings, HelpCircle, User } from 'lucide-react'
import { Button, Card } from './UI'

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
  onOpenProfile,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md"
          >
            <Card className="relative bg-[#FFFDF5] p-6 border-4 shadow-[8px_8px_0px_0px_#000]">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFD100] border-3 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                  <Settings className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-black text-black leading-none">
                    Settings &amp; Preferences
                  </h3>
                  <span className="font-mono text-[10px] font-bold text-neutral-600">
                    BOT OR NOT • CONFIGURATION
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {/* Sound FX Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-white border-3 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000]">
                  <div className="flex items-center gap-3">
                    {sound ? (
                      <Volume2 className="w-5 h-5 text-black" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-neutral-400" />
                    )}
                    <div>
                      <div className="text-xs font-black uppercase text-black">Sound Effects</div>
                      <div className="text-[11px] font-bold text-neutral-600">Audio feedback during countdown &amp; verdict</div>
                    </div>
                  </div>
                  <button
                    onClick={onToggleSound}
                    className={`px-3 py-1.5 rounded-xl border-2 border-black font-mono text-xs font-black cursor-pointer transition-colors ${
                      sound ? 'bg-[#FFD100] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {sound ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Match Duration Indicator */}
                <div className="flex items-center justify-between p-3.5 bg-white border-3 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000]">
                  <div>
                    <div className="text-xs font-black uppercase text-black">Chat Duration</div>
                    <div className="text-[11px] font-bold text-neutral-600">Standard Turing experiment speed</div>
                  </div>
                  <span className="font-mono text-xs font-black bg-[#FFD100] px-3 py-1.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    2 MIN (120s)
                  </span>
                </div>

                {/* Game Info Summary */}
                <div className="p-4 bg-white border-3 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000]">
                  <h4 className="font-black text-xs uppercase flex items-center gap-1.5 mb-2">
                    <HelpCircle className="w-4 h-4 text-black" /> 2-Minute Game Format
                  </h4>
                  <ul className="text-xs text-neutral-700 space-y-1 list-disc pl-4 font-bold">
                    <li>120s live anonymous chat.</li>
                    <li>Guess Human or Bot at timer expiration.</li>
                    <li>+10 Coins on correct deduction.</li>
                  </ul>
                </div>

                {/* Account & Profile Link */}
                {onOpenProfile && (
                  <div className="flex items-center justify-between p-3.5 bg-white border-3 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FFD100] border-2 border-black flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-black" />
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase text-black">Player Account</div>
                        <div className="text-[11px] font-bold text-neutral-600">Google sign-in, public ID &amp; stats</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose()
                        onOpenProfile()
                      }}
                      className="px-3 py-1.5 bg-[#FFD100] hover:bg-[#E6BC00] text-black border-2 border-black rounded-xl font-mono text-xs font-black cursor-pointer shadow-[2px_2px_0px_0px_#000] transition-colors"
                    >
                      VIEW
                    </button>
                  </div>
                )}

                {/* Match Stats Reset */}
                <div className="flex items-center justify-between p-3.5 bg-white border-3 border-black rounded-2xl shadow-[2px_2px_0px_0px_#000]">
                  <div>
                    <div className="text-xs font-black uppercase text-black">Reset Local Progress</div>
                    <div className="text-[11px] font-bold text-neutral-600">Clear cached streaks and token counts</div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Reset all local streak and win data?')) {
                        localStorage.clear()
                        window.location.reload()
                      }
                    }}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-black rounded-xl font-mono text-xs font-black cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                  >
                    RESET
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                fullWidth
                className="py-2.5 text-xs font-black uppercase tracking-wider"
                onClick={onClose}
              >
                Save &amp; Close
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
