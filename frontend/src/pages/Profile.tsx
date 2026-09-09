import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dithering } from '@paper-design/shaders-react'
import {
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Trash2,
  Sparkles,
  X,
} from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  // 6-character user ID
  const userId = 'nsapw2'

  const handleCopy = () => {
    navigator.clipboard.writeText(userId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pt-10 sm:pb-16">
      {/* User Header: Shader Avatar Icon + 6-Char User ID */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl neo-card bg-[#f1eee7]"
      >
        <div className="flex items-center gap-3.5">
          {/* Avatar Icon (Paper Dithering Shader - Strictly Circular, No Border) */}
          <div
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden flex-shrink-0"
            style={{
              borderRadius: '9999px',
              clipPath: 'circle(50% at 50% 50%)',
              WebkitClipPath: 'circle(50% at 50% 50%)',
            }}
          >
            <Dithering
              width="100%"
              height="100%"
              colorBack="rgba(0, 0, 0, 0)"
              colorFront="#232323"
              shape="sphere"
              type="4x4"
              size={2.5}
              speed={1}
              scale={1.0}
              className="w-full h-full"
              style={{
                borderRadius: '9999px',
                clipPath: 'circle(50% at 50% 50%)',
                WebkitClipPath: 'circle(50% at 50% 50%)',
              }}
            />
          </div>

          <div>
            <div className="text-[10px] sm:text-xs text-slate-500 font-pixel font-bold uppercase tracking-wider">
              USER ID
            </div>
            <div className="font-pixel text-lg sm:text-xl font-bold text-[#232323] tracking-wider">
              {userId}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f1eee7] text-[#232323] border-2 border-[#232323] shadow-[1.5px_1.5px_0px_#232323] text-xs font-pixel font-bold hover:bg-[#22c55e] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#232323]" />
              <span>COPIED</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#232323]" />
              <span>COPY ID</span>
            </>
          )}
        </button>
      </motion.div>

      {/* 2-Column Section: PREMIUM STATUS & HUMAN COINS */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8"
      >
        {/* Left: Premium Status Card */}
        <div className="md:col-span-7 neo-card p-5 sm:p-6 flex flex-col justify-between bg-[#f1eee7]">
          <div>
            <h2 className="font-pixel text-sm sm:text-base font-bold text-[#232323] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#22c55e]" />
              <span>PREMIUM STATUS</span>
            </h2>

            {/* Status Bar */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#232323] text-[#f1eee7] mb-5 border-2 border-[#232323]">
              <span className="font-pixel text-xs sm:text-sm font-bold tracking-wider text-slate-300">
                NOT ACTIVE
              </span>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(true)}
                className="neo-btn neo-btn-green px-4 py-1.5 font-pixel text-xs font-bold rounded hover:scale-105 transition-all text-[#232323]"
              >
                UPGRADE
              </button>
            </div>

            {/* Premium Benefits List */}
            <div>
              <h3 className="font-pixel text-xs font-bold text-[#232323] uppercase tracking-wider mb-2.5">
                Premium Benefits:
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm font-bold text-[#232323]">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                  <span>Unlimited extends / messages</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                  <span>No ads</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                  <span>Badge visible to opponents</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Human Coins Card */}
        <div className="md:col-span-5 neo-card p-5 sm:p-6 flex flex-col justify-between bg-[#f1eee7]">
          <div>
            <h2 className="font-pixel text-sm sm:text-base font-bold text-[#232323] tracking-wider mb-4">
              Human Coins:
            </h2>

            <div className="flex items-center gap-3 my-4">
              <div className="w-12 h-12 rounded-full bg-[#22c55e] border-2 border-[#232323] flex items-center justify-center font-pixel text-xl font-bold text-[#232323] shadow-[2px_2px_0px_#232323]">
                H
              </div>
              <div className="font-pixel text-4xl sm:text-5xl font-bold text-[#232323]">
                10
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#232323]/20 text-xs font-bold text-slate-600">
            Earn coins by voting correctly in 2-minute Turing rounds.
          </div>
        </div>
      </motion.div>

      {/* Free Coins Recharge Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2 }}
        className="mb-8"
      >
        <div className="font-pixel text-xs sm:text-sm font-bold text-[#232323] mb-2 uppercase tracking-wider">
          Free coins recharge in:
        </div>

        <div className="neo-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f1eee7]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#232323] text-[#22c55e] flex items-center justify-center border-2 border-[#232323]">
              <Clock className="w-5 h-5" />
            </div>
            <div className="font-pixel text-sm sm:text-base font-bold text-[#232323]">
              NOW! Play to get it
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="neo-btn neo-btn-green px-8 py-2.5 font-pixel text-sm font-bold tracking-wider rounded-lg text-[#232323] hover:scale-105 transition-transform"
          >
            PLAY
          </button>
        </div>
      </motion.div>

      {/* Gameplay Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
        className="mb-8 neo-card divide-y-2 divide-[#232323]/20 overflow-hidden bg-[#f1eee7]"
      >
        <div className="p-4 sm:p-5 flex items-center justify-between">
          <span className="font-pixel text-xs sm:text-sm font-bold text-[#22c55e]">
            Total Games:
          </span>
          <span className="font-pixel text-base sm:text-lg font-bold text-[#232323]">
            0
          </span>
        </div>

        <div className="p-4 sm:p-5 flex items-center justify-between">
          <span className="font-pixel text-xs sm:text-sm font-bold text-[#22c55e]">
            Wins:
          </span>
          <span className="font-pixel text-base sm:text-lg font-bold text-[#232323]">
            0%
          </span>
        </div>

        <div className="p-4 sm:p-5 flex items-center justify-between">
          <span className="font-pixel text-xs sm:text-sm font-bold text-[#22c55e]">
            Wins 24h:
          </span>
          <span className="font-pixel text-base sm:text-lg font-bold text-[#232323]">
            0%
          </span>
        </div>
      </motion.div>

      {/* Recent Chats Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="mb-10 neo-card p-5 sm:p-6 bg-[#f1eee7]"
      >
        <h2 className="font-pixel text-sm sm:text-base font-bold text-[#232323] mb-4">
          Recent Chats:
        </h2>
        <div className="py-6 text-center border-2 border-dashed border-[#232323]/30 rounded-lg">
          <p className="font-pixel text-xs sm:text-sm font-bold text-slate-500">
            No recent chats found
          </p>
          <p className="text-xs text-slate-400 mt-1 font-bold">
            Chat logs will appear here after finishing rounds.
          </p>
        </div>
      </motion.div>

      {/* Danger Zone: Delete Account Button in Red */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.35 }}
        className="pt-6 border-t-2 border-[#232323]/20 flex justify-start"
      >
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="neo-btn neo-btn-red px-6 sm:px-8 py-2.5 font-pixel text-xs sm:text-sm font-bold tracking-wider rounded-lg text-[#f1eee7] hover:scale-105 transition-all cursor-pointer"
        >
          DELETE ACCOUNT
        </button>
      </motion.div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#232323]/70 backdrop-blur-xs">
          <div className="neo-card w-full max-w-md bg-[#f1eee7] p-6 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#232323] mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#22c55e]" />
                <h3 className="font-pixel text-base sm:text-lg font-bold text-[#232323]">
                  Upgrade to Premium
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="w-7 h-7 rounded-md bg-[#f1eee7] border-2 border-[#232323] flex items-center justify-center font-bold text-xs hover:bg-[#232323] hover:text-[#f1eee7] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#232323] font-bold mb-4 leading-relaxed">
              Unlock exclusive competitive perks, limitless conversation extensions, and full ad-free gameplay.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-xs font-bold text-[#232323]">
                <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
                <span>Unlimited game extensions and messages</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#232323]">
                <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
                <span>Ad-free queue and instant rematch</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#232323]">
                <ShieldCheck className="w-4 h-4 text-[#22c55e]" />
                <span>Exclusive verified Turing Master badge</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#232323] text-[#f1eee7] mb-6 flex items-center justify-between">
              <div>
                <div className="font-pixel text-xs text-[#22c55e] font-bold">MONTHLY PASS</div>
                <div className="text-xs text-slate-400 font-bold">Cancel anytime</div>
              </div>
              <div className="font-pixel text-lg font-bold text-[#22c55e]">
                50 Coins / mo
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowUpgradeModal(false)
                }}
                className="neo-btn neo-btn-green flex-1 py-3 font-pixel text-xs font-bold rounded-lg"
              >
                CONFIRM UPGRADE
              </button>
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="neo-btn bg-[#232323] text-[#f1eee7] px-4 py-3 font-pixel text-xs font-bold rounded-lg"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#232323]/70 backdrop-blur-xs">
          <div className="neo-card w-full max-w-md bg-[#f1eee7] p-6 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#232323] mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-pixel text-base font-bold text-[#232323]">
                  Confirm Account Reset
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-7 h-7 rounded-md bg-[#f1eee7] border-2 border-[#232323] flex items-center justify-center font-bold text-xs hover:bg-[#232323] hover:text-[#f1eee7] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#232323] font-bold mb-6 leading-relaxed">
              This will reset your guest identification key, remove all local game statistics, and clear your balance. This action cannot be reversed.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  navigate('/')
                }}
                className="neo-btn neo-btn-red flex-1 py-3 font-pixel text-xs font-bold rounded-lg border-2 border-[#232323]"
              >
                YES, RESET ACCOUNT
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="neo-btn bg-[#f1eee7] text-[#232323] px-4 py-3 font-pixel text-xs font-bold rounded-lg"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
