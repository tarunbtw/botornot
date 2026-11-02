import React, { useState, useRef, useEffect } from 'react'
import type { OpponentType } from '../types'
import { Button } from '../components/UI'
import { CoinIcon } from '../components/CoinIcon'
import {
  Cpu,
  User,
  PlaySolid,
  CheckCircle,
  XmarkCircle,
  Refresh,
  Home as HomeIcon,
} from 'iconoir-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playCorrect, playIncorrect } from '../lib/audio'

export interface VerdictInfo {
  isCorrect: boolean
  actualOpponent: OpponentType
  reward: number
}

interface GuessProps {
  onGuess: (guess: OpponentType) => void
  onExtendChat: () => void
  coins: number
  userGuess: OpponentType | null
  opponent: OpponentType
  streak: number
  coinAnimAmount: number
  onPlayAgain: () => void
  onHome: () => void
  isVerdictPending?: boolean
  verdictInfo?: VerdictInfo | null
}

export const Guess: React.FC<GuessProps> = ({
  onGuess,
  onExtendChat,
  coins,
  userGuess,
  opponent,
  streak,
  coinAnimAmount,
  onPlayAgain,
  onHome,
  isVerdictPending = false,
  verdictInfo = null,
}) => {
  const [watchingVideo, setWatchingVideo] = useState(false)
  const soundPlayedRef = useRef(false)

  const isPending = isVerdictPending || (userGuess !== null && !verdictInfo)
  const isCorrect = verdictInfo ? verdictInfo.isCorrect : userGuess === opponent
  const finalOpponent = verdictInfo ? verdictInfo.actualOpponent : opponent
  const rewardCoins = verdictInfo ? verdictInfo.reward : (isCorrect ? 10 : 5)

  useEffect(() => {
    if (!soundPlayedRef.current && verdictInfo) {
      soundPlayedRef.current = true
      if (verdictInfo.isCorrect) {
        playCorrect()
      } else {
        playIncorrect()
      }
    }
  }, [verdictInfo])

  const handleGuessClick = (guess: OpponentType) => {
    if (userGuess !== null) return
    onGuess(guess)
  }

  const handleExtendWithVideo = () => {
    if (watchingVideo || userGuess !== null) return
    setWatchingVideo(true)
    setTimeout(() => {
      setWatchingVideo(false)
      onExtendChat()
    }, 1800)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col justify-between flex-1 select-none relative min-h-[75vh]">
      {/* Top Status */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 bg-white dark:bg-[#181820] border border-black/20 dark:border-neutral-700 px-3 py-1 rounded-full">
          Time's Up!
        </span>

        <div className="flex items-center gap-1.5 bg-[#FFD100] border border-black/20 rounded-xl px-3 py-1 font-mono font-black text-xs sm:text-sm shadow-xs text-black">
          <CoinIcon size="xs" />
          <span>{coins}</span>
        </div>

        {/* Floating Coin Indicator */}
        <AnimatePresence>
          {coinAnimAmount !== 0 && (
            <motion.div
              key="floating-coin-anim"
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1.1 }}
              exit={{ opacity: 0, y: -30, scale: 0.8 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute right-0 -top-2 font-mono font-black text-sm z-50 flex items-center gap-1 text-black bg-[#FFD100] border border-black/30 rounded-lg px-2 py-0.5 shadow-xs"
            >
              <span>{coinAnimAmount > 0 ? `+${coinAnimAmount}` : coinAnimAmount}</span>
              <CoinIcon size="xs" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Question & Deduction Cards */}
      <div className="flex-1 flex flex-col justify-center items-center gap-6 my-auto">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-1.5"
        >
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-black dark:text-white">
            Who were you{' '}
            <span className="bg-[#FFD100] text-black px-3 py-0.5 border border-black/30 rounded-xl inline-block shadow-xs">
              talking to?
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400">
            Make your choice: Bot or Human?
          </p>
        </motion.div>

        {/* Binary Choice Cards (Clean, high contrast like humanornot.so) */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              type="button"
              disabled={userGuess !== null || watchingVideo}
              onClick={() => handleGuessClick('AI')}
              className="w-full h-40 sm:h-48 flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#181820] hover:bg-neutral-50 dark:hover:bg-[#20202C] active:bg-neutral-100 dark:active:bg-[#252536] border border-black/15 dark:border-neutral-700 rounded-2xl shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none p-4"
            >
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950/60 rounded-xl border border-black/20 dark:border-neutral-700 flex items-center justify-center shadow-xs">
                <Cpu className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-display font-black tracking-tight text-black dark:text-white block">
                  A BOT
                </span>
                <span className="text-[11px] font-mono font-bold text-neutral-500 dark:text-neutral-400">
                  AI Model
                </span>
              </div>
            </button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              type="button"
              disabled={userGuess !== null || watchingVideo}
              onClick={() => handleGuessClick('HUMAN')}
              className="w-full h-40 sm:h-48 flex flex-col items-center justify-center gap-3 bg-[#FFF8D6] dark:bg-[#201F12] hover:bg-[#FFE57F] dark:hover:bg-[#2A2714] active:bg-[#FFD100] border border-black/15 dark:border-neutral-700 rounded-2xl shadow-xs cursor-pointer transition-all disabled:opacity-50 disabled:pointer-events-none p-4"
            >
              <div className="w-14 h-14 bg-[#FFD100] rounded-xl border border-black/20 flex items-center justify-center shadow-xs">
                <User className="w-8 h-8 text-black" />
              </div>
              <div className="text-center">
                <span className="text-xl sm:text-2xl font-display font-black tracking-tight text-black dark:text-[#FFD100] block">
                  A HUMAN
                </span>
                <span className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-400">
                  Real Person
                </span>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Extend Chat Option */}
        <div className="w-full max-w-sm pt-2">
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleExtendWithVideo}
            disabled={watchingVideo || userGuess !== null}
            className="py-2.5 text-xs font-black uppercase tracking-wider shadow-xs"
          >
            <PlaySolid className="w-4 h-4 mr-1 text-black dark:text-white" />
            {watchingVideo ? 'Extending...' : 'Extend Chat (+5 Min)'}
          </Button>
        </div>
      </div>

      {/* Pop-Up Result Box Overlay */}
      <AnimatePresence>
        {userGuess !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
              className="w-full max-w-sm bg-white dark:bg-[#181820] rounded-2xl border border-black/15 dark:border-neutral-700 shadow-md overflow-hidden text-center"
            >
              {isPending ? (
                <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-[#FFD100] border-t-transparent animate-spin" />
                  <div>
                    <h3 className="text-xl font-display font-black uppercase text-black dark:text-white">
                      Verifying Deduction...
                    </h3>
                    <p className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 mt-1">
                      Checking match telemetry & identity
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Verdict Header */}
                  <div
                    className={`p-5 border-b border-black/20 flex flex-col items-center gap-2.5 ${
                      isCorrect ? 'bg-[#FFD100] text-black' : 'bg-red-500 text-white'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white rounded-full border border-black/20 flex items-center justify-center shadow-xs">
                      {isCorrect ? (
                        <CheckCircle className="w-7 h-7 text-emerald-600 stroke-[3]" />
                      ) : (
                        <XmarkCircle className="w-7 h-7 text-red-600 stroke-[3]" />
                      )}
                    </div>

                    <h2 className="text-2xl font-display font-black uppercase tracking-tight leading-none">
                      {isCorrect ? 'YOU WERE RIGHT!' : 'YOU WERE FOOLED!'}
                    </h2>

                    <div className="font-mono text-xs font-black px-3 py-0.5 rounded-full bg-black text-[#FFD100]">
                      {isCorrect ? `+${rewardCoins} Coins Earned` : `+${rewardCoins} Coins (Streak Reset)`}
                    </div>
                  </div>

                  {/* Reveal Body */}
                  <div className="p-5 space-y-4 bg-[#FAFAF8] dark:bg-[#121218] text-black dark:text-white">
                    <div className="p-3.5 rounded-xl border border-black/15 dark:border-neutral-700 bg-white dark:bg-[#181820] flex items-center justify-center gap-3 shadow-xs">
                      <div
                        className={`w-10 h-10 rounded-lg border border-black/20 flex items-center justify-center shrink-0 ${
                          finalOpponent === 'AI' ? 'bg-blue-100 text-blue-600' : 'bg-[#FFD100] text-black'
                        }`}
                      >
                        {finalOpponent === 'AI' ? <Cpu className="w-6 h-6" /> : <User className="w-6 h-6" />}
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                          Opponent was
                        </div>
                        <div className="font-display font-black text-lg text-black dark:text-white leading-tight">
                          {finalOpponent === 'AI' ? 'An AI Bot' : 'A Real Human'}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center px-3.5 py-2 bg-white dark:bg-[#181820] rounded-xl border border-black/20 dark:border-neutral-700 font-mono font-bold text-xs">
                      <span className="text-neutral-600 dark:text-neutral-400">Streak:</span>
                      <span className="text-orange-500 font-black flex items-center gap-1">
                        🔥 {streak}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-1">
                      <Button
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={onPlayAgain}
                        className="py-3 text-sm font-black uppercase tracking-wider"
                      >
                        <Refresh className="w-4 h-4 mr-1" />
                        Play Again
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onClick={onHome}
                        className="py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300"
                      >
                        <HomeIcon className="w-3.5 h-3.5 mr-1" />
                        Home
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
