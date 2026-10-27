import React, { useState } from 'react'
import type { OpponentType } from '../types'
import { Button } from '../components/UI'
import { AdSlot } from '../components/AdSlot'
import { CoinIcon } from '../components/CoinIcon'
import {
  Bot,
  User,
  PlaySquare,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home as HomeIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playCorrect, playIncorrect } from '../lib/audio'

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
}) => {
  const [watchingVideo, setWatchingVideo] = useState(false)

  const isCorrect = userGuess === opponent

  const handleGuessClick = (guess: OpponentType) => {
    if (userGuess !== null) return
    if (guess === opponent) {
      playCorrect()
    } else {
      playIncorrect()
    }
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
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-between flex-1 select-none relative min-h-[85vh]">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-6 relative">
        <div className="inline-flex items-center gap-1.5 bg-red-500 text-white font-mono font-black text-xs uppercase px-3.5 py-1.5 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_#000]">
          2-Minute Timer Expired!
        </div>

        <div className="flex items-center gap-2 bg-[#FFD100] border-3 border-black rounded-xl px-3.5 py-1.5 font-mono font-black text-sm shadow-[3px_3px_0px_0px_#000]">
          <CoinIcon size="sm" />
          <span>{coins}</span>
        </div>

        {/* Floating Coin Indicator */}
        <AnimatePresence>
          {coinAnimAmount !== 0 && (
            <motion.div
              key={Date.now()}
              initial={{ opacity: 0, y: 10, scale: 0.5 }}
              animate={{ opacity: 1, y: -25, scale: 1.2 }}
              exit={{ opacity: 0, y: -40, scale: 0.8 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`absolute right-0 -top-2 font-mono font-black text-lg drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] z-50 flex items-center gap-1 ${
                coinAnimAmount > 0 ? 'text-[#FFD100]' : 'text-red-500'
              }`}
              style={{ WebkitTextStroke: '1px black' }}
            >
              <span>{coinAnimAmount > 0 ? `+${coinAnimAmount}` : coinAnimAmount}</span>
              <CoinIcon size="xs" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Verdict Deduction Section */}
      <div className="flex-1 flex flex-col justify-center items-center gap-6 my-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-2"
        >
          <span className="font-mono text-xs font-black uppercase tracking-widest text-neutral-600 bg-white border-2 border-black px-3.5 py-1 rounded-full shadow-[2px_2px_0px_0px_#000]">
            The Turing Deduction
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-black mt-2">
            Who were you{' '}
            <span className="bg-[#FFD100] px-3.5 py-0.5 border-3 border-black rounded-2xl inline-block shadow-[4px_4px_0px_0px_#000]">
              talking to?
            </span>
          </h1>
          <p className="text-sm sm:text-base font-bold text-neutral-700 max-w-md mx-auto">
            Based on your 2-minute conversation, decide if your opponent was an AI or a real human.
          </p>
        </motion.div>

        {/* Choice Buttons: Symmetrical PC Grid in Yellow & Cyber Styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-2xl">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="secondary"
              size="xl"
              fullWidth
              disabled={userGuess !== null || watchingVideo}
              onClick={() => handleGuessClick('AI')}
              className="h-44 sm:h-52 flex-col gap-3 bg-blue-100 hover:bg-blue-200 border-4 p-6 shadow-[6px_6px_0px_0px_#000] rounded-3xl"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-400 rounded-2xl border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
              </div>
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-display font-black tracking-tight text-black block">
                  AI Bot
                </span>
                <span className="text-xs font-mono font-bold text-neutral-600">
                  Large Language Model
                </span>
              </div>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="secondary"
              size="xl"
              fullWidth
              disabled={userGuess !== null || watchingVideo}
              onClick={() => handleGuessClick('HUMAN')}
              className="h-44 sm:h-52 flex-col gap-3 bg-[#FFF8D6] hover:bg-[#FFE57F] border-4 p-6 shadow-[6px_6px_0px_0px_#000] rounded-3xl"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FFD100] rounded-2xl border-3 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000]">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-black" />
              </div>
              <div className="text-center">
                <span className="text-2xl sm:text-3xl font-display font-black tracking-tight text-black block">
                  Real Human
                </span>
                <span className="text-xs font-mono font-bold text-neutral-600">
                  Living Person
                </span>
              </div>
            </Button>
          </motion.div>
        </div>

        {/* Extend Chat Option */}
        <div className="w-full max-w-md">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleExtendWithVideo}
            disabled={watchingVideo || userGuess !== null}
            className="py-3.5 text-base font-black border-4 shadow-[4px_4px_0px_0px_#000]"
          >
            <PlaySquare className="w-5 h-5 mr-1" />
            {watchingVideo ? 'Watching Ad & Extending...' : 'Watch Ad, Extend Chat'}
          </Button>
          <div className="text-[11px] font-mono font-bold text-center text-neutral-600 mt-2">
            1st message is FREE • Then 1 coin / msg (Watch ads for +10 coins anytime)
          </div>
        </div>
      </div>

      {/* Responsive Ad Slot at bottom */}
      <div className="mt-6 mb-2">
        <div className="hidden sm:block">
          <AdSlot format="leaderboard" id="guess-desktop-ad" />
        </div>
        <div className="sm:hidden">
          <AdSlot format="mobile_banner" id="guess-mobile-ad" />
        </div>
      </div>

      {/* Pop-Up Result Box Overlay with 3D Rotating Coin Celebration */}
      <AnimatePresence>
        {userGuess !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.65, y: 70, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: 40, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.42, duration: 0.65 }}
              className="w-full max-w-md"
            >
              <div className="w-full bg-white rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden text-center">
                {/* Verdict Banner in Theme Colors */}
                <div
                  className={`p-6 border-b-4 border-black flex flex-col items-center gap-3 ${
                    isCorrect ? 'bg-[#FFD100] text-black' : 'bg-red-500 text-white'
                  }`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: isCorrect ? 360 : 0 }}
                    transition={{ type: 'spring', delay: 0.1, duration: 0.5 }}
                    className="w-16 h-16 bg-white rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-10 h-10 text-black stroke-[3]" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-600 stroke-[3]" />
                    )}
                  </motion.div>

                  <h2
                    className={`text-3xl sm:text-4xl font-display font-black uppercase tracking-tight leading-none ${
                      isCorrect ? 'text-black' : 'text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                    }`}
                  >
                    {isCorrect ? 'CORRECT DEDUCTION!' : 'YOU WERE FOOLED!'}
                  </h2>

                  {/* 3D Rotating Coin Pop-Up Animation on Correct Guess */}
                  {isCorrect ? (
                    <motion.div
                      initial={{ scale: 0, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                      className="flex flex-col items-center justify-center pt-1"
                    >
                      {/* 3D Rotating Coin */}
                      <motion.div
                        animate={{ rotateY: [0, 360, 720, 1080] }}
                        transition={{ duration: 1.8, ease: 'easeOut' }}
                        className="relative flex items-center justify-center"
                        style={{ perspective: 1000 }}
                      >
                        <div className="absolute -inset-2 bg-white/40 rounded-full blur-sm" />
                        <CoinIcon size="xl" />
                      </motion.div>

                      {/* +1 Pop Badge */}
                      <motion.div
                        initial={{ scale: 0, y: 10 }}
                        animate={{ scale: [0, 1.3, 1], y: 0 }}
                        transition={{ delay: 0.35, type: 'spring', bounce: 0.6 }}
                        className="mt-2.5 bg-black text-[#FFD100] font-display font-black text-xl sm:text-2xl px-5 py-1 rounded-2xl border-3 border-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-2"
                      >
                        <span className="text-white">+1</span>
                        <span className="text-xs font-mono font-black uppercase tracking-wider text-[#FFD100]">
                          COIN
                        </span>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <div className="font-mono text-xs font-black px-3.5 py-1 rounded-full bg-black text-white border-2 border-black">
                      Streak Reset • Better Luck Next Match!
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4 bg-[#FFFDF5] text-black">
                  <div
                    className={`p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-4 ${
                      opponent === 'AI' ? 'bg-blue-100' : 'bg-[#FFF8D6]'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl border-3 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        opponent === 'AI' ? 'bg-blue-400' : 'bg-[#FFD100]'
                      }`}
                    >
                      {opponent === 'AI' ? (
                        <Bot className="w-8 h-8 text-black" />
                      ) : (
                        <User className="w-8 h-8 text-black" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-mono font-black uppercase tracking-wider text-neutral-600">
                        Opponent Identity
                      </div>
                      <div className="font-display font-black text-2xl text-black leading-tight">
                        {opponent === 'AI' ? 'AI Bot 🤖' : 'Real Human 👤'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-4 py-2.5 bg-white rounded-2xl border-2 border-black font-mono font-bold text-xs shadow-[2px_2px_0px_0px_#000]">
                    <span>Current Streak:</span>
                    <span className="text-orange-500 font-black flex items-center gap-1">
                      🔥 {streak}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2.5 pt-2">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={onPlayAgain}
                      className="py-3.5 text-base bg-[#FFD100] text-black border-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <RotateCcw className="w-5 h-5 mr-1" />
                      Play Again (2 Min Chat)
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={onHome}
                      className="py-2.5 text-sm text-black border-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <HomeIcon className="w-4 h-4 mr-1" />
                      Back to Home
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
