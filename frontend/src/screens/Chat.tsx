import React, { useState, useRef, useEffect } from 'react'
import type { Message } from '../types'
import { Button } from '../components/UI'
import { AdSlot } from '../components/AdSlot'
import { CoinIcon } from '../components/CoinIcon'
import {
  Send,
  Clock,
  Sparkles,
  AlertTriangle,
  Flag,
  PlaySquare,
  ArrowLeft,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { playTick, playTimerEnd } from '../lib/audio'
import { ForfeitModal } from '../components/ForfeitModal'
import { OutOfCoinsModal } from '../components/OutOfCoinsModal'

interface ChatProps {
  messages: Message[]
  timeLeft: number // in seconds (default 120s / 2 minutes)
  onSendMessage: (text: string) => void
  isExtended?: boolean
  freeExtendedMessagesLeft?: number
  coins: number
  opponentTyping?: boolean
  isOpponentFirstTurn?: boolean
  onForfeitMatch?: () => void
  onEndExtendedChat?: () => void
  onWatchAdForCoins?: () => void
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  timeLeft,
  onSendMessage,
  isExtended,
  freeExtendedMessagesLeft = 0,
  coins,
  opponentTyping = false,
  isOpponentFirstTurn = false,
  onForfeitMatch,
  onEndExtendedChat,
  onWatchAdForCoins,
}) => {
  const [inputText, setInputText] = useState('')
  const [showForfeitModal, setShowForfeitModal] = useState(false)
  const [showOutOfCoinsModal, setShowOutOfCoinsModal] = useState(false)
  const [watchingAdForCoins, setWatchingAdForCoins] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleWatchAdForCoins = () => {
    if (watchingAdForCoins) return
    setShowOutOfCoinsModal(false)
    setWatchingAdForCoins(true)
    setTimeout(() => {
      setWatchingAdForCoins(false)
      onWatchAdForCoins?.()
    }, 1800)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, opponentTyping])

  // Automatically show out-of-coins modal if coins hit 0 in extended chat
  useEffect(() => {
    if (isExtended && freeExtendedMessagesLeft <= 0 && coins < 1) {
      setShowOutOfCoinsModal(true)
    } else {
      setShowOutOfCoinsModal(false)
    }
  }, [isExtended, freeExtendedMessagesLeft, coins])

  // Play ticks when time is running low
  useEffect(() => {
    if (!isExtended && timeLeft <= 5 && timeLeft > 0) {
      playTick()
    } else if (!isExtended && timeLeft === 0) {
      playTimerEnd()
    }
  }, [timeLeft, isExtended])

  // Warn if user attempts to leave the browser tab during regular 2-minute chat
  useEffect(() => {
    if (isExtended) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Leaving the match early will penalize your streak!'
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isExtended])

  const hasFreeMessage = isExtended && freeExtendedMessagesLeft > 0
  const isOutOfCoinsForNextMessage = isExtended && !hasFreeMessage && coins < 1

  // Turn-taking: user can't send if waiting for opponent to reply OR if opponent has first turn to speak
  const lastMessage = messages[messages.length - 1]
  const isWaitingForOpponent =
    (messages.length === 0 && isOpponentFirstTurn) ||
    lastMessage?.sender === 'user' ||
    opponentTyping

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    if (isWaitingForOpponent) return // strict turn-taking
    if (isOutOfCoinsForNextMessage) {
      setShowOutOfCoinsModal(true)
      return
    }
    onSendMessage(inputText)
    setInputText('')
  }

  const isUrgent = !isExtended && timeLeft <= 15
  const isCritical = !isExtended && timeLeft <= 5

  // Format 120s into 2:00, 1:59, etc.
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center px-2 sm:px-6 py-3 select-none min-h-screen bg-[#FFFDF5]">
      {/* Symmetrical PC Layout: Left Skyscraper Ad + Spacious Center Chat + Right Skyscraper Ad */}
      <div className="w-full max-w-7xl flex items-center justify-center gap-6 flex-1 my-auto">
        {/* ========================================================== */}
        {/* LEFT VERTICAL AD RAIL (PC Only: 160x600 Skyscraper)        */}
        {/* ========================================================== */}
        <aside className="hidden xl:flex flex-col items-center justify-center shrink-0 w-[160px]">
          <AdSlot format="skyscraper" id="chat-left-rail-ad" />
        </aside>

        {/* ========================================================== */}
        {/* CENTER COLUMN: Spacious, Clean, Distractionless Chat Box   */}
        {/* ========================================================== */}
        <div className="w-full max-w-3xl flex-1 flex flex-col h-[82vh] sm:h-[85vh] bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_#000] overflow-hidden">
          {/* Distractionless Header: Stranger Info + 2-Min Timer only (NO Guess Now button!) */}
          <div className="bg-[#FFD100] border-b-4 border-black p-3.5 sm:p-4 flex justify-between items-center z-10 shadow-[0_4px_0_0_rgba(0,0,0,1)] shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Back / Leave button in Extended Chat */}
              {isExtended && onEndExtendedChat && (
                <button
                  type="button"
                  onClick={onEndExtendedChat}
                  className="px-2.5 sm:px-3 py-1.5 bg-white hover:bg-neutral-100 border-2 sm:border-3 border-black rounded-xl font-display font-black text-xs shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all shrink-0"
                  title="Leave extended chat and proceed to guess"
                >
                  <ArrowLeft className="w-4 h-4 text-black" />
                  <span>Leave</span>
                </button>
              )}

              <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white rounded-2xl border-3 border-black flex items-center justify-center font-display font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                ?
              </div>
              <div>
                <h2 className="font-display font-black text-base sm:text-lg leading-none text-black">
                  Anonymous Stranger
                </h2>
                <span className="text-[11px] font-bold text-neutral-800 flex items-center gap-1.5 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFD100] border border-black animate-pulse" />
                  Live Connected (Human or Bot?)
                </span>
              </div>
            </div>

            {/* Countdown Clock in Header - Removed from Extended Chat as requested! */}
            {!isExtended ? (
              <motion.div
                animate={
                  isCritical
                    ? { scale: [1, 1.15, 1], rotate: [-2, 2, 0] }
                    : isUrgent
                    ? { scale: [1, 1.05, 1] }
                    : {}
                }
                transition={{ repeat: Infinity, duration: isCritical ? 0.4 : 0.8 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border-3 border-black font-mono font-black text-base sm:text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                  isUrgent ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-black'
                }`}
              >
                {isUrgent ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                <span>{formattedTime}</span>
              </motion.div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-3 border-black font-mono font-black text-xs bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles className="w-4 h-4 text-[#FFD100] fill-[#FFD100]" />
                <span>EXTENDED CHAT</span>
              </div>
            )}
          </div>

          {/* Extended Mode Banner if active */}
          {isExtended && (
            <div
              className={`border-b-3 border-black px-4 py-2 flex items-center justify-between text-xs font-black shrink-0 ${
                hasFreeMessage
                  ? 'bg-emerald-300 text-black'
                  : coins < 1
                  ? 'bg-amber-300 text-black'
                  : 'bg-[#FFD100] text-black'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>
                  {hasFreeMessage
                    ? '1st Extended Message is FREE!'
                    : coins < 1
                    ? 'Coins finished! Watch ad to get +10 coins'
                    : 'Extended Chat: 1 Coin per message'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] bg-white px-2.5 py-0.5 rounded-md border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5">
                  {hasFreeMessage ? (
                    'FREE (1 left)'
                  ) : (
                    <>
                      <span>{coins}</span>
                      <CoinIcon size="xs" />
                    </>
                  )}
                </span>
                {coins < 1 && (
                  <button
                    type="button"
                    onClick={() => setShowOutOfCoinsModal(true)}
                    className="font-mono text-[10px] font-black bg-black text-[#FFD100] px-2.5 py-1 rounded-md hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <PlaySquare className="w-3.5 h-3.5" />
                    <span>Watch Ad (+10 🪙)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Messages Area (Clean, spacious, zero redundant icebreakers) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#FFFDF5]">
            <div className="text-center my-1">
              <span className="bg-white border-2 border-black px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">
                {isExtended ? 'Extended Time Active' : '2-Minute Turing Chat (120s)'}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isUser = msg.sender === 'user'
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] px-4 sm:px-5 py-3 rounded-2xl border-3 border-black font-bold text-sm sm:text-base shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] leading-relaxed select-text ${
                        isUser
                          ? 'bg-[#FFD100] text-black rounded-br-none'
                          : 'bg-white text-black rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {/* Opponent Typing Indicator */}
            {opponentTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white border-3 border-black rounded-2xl rounded-bl-none px-4 py-2 text-xs font-bold shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 text-neutral-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-bounce [animation-delay:0.3s]" />
                  <span>Stranger is typing...</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Clean Input Bar or Watch Ad Refill if Out of Coins */}
          {isOutOfCoinsForNextMessage ? (
            <div className="p-3 sm:p-4 bg-[#FFFDF5] border-t-4 border-black flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FFD100] border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_#000]">
                  <CoinIcon size="md" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-black">Out of Coins to Chat!</div>
                  <div className="text-[11px] font-bold text-neutral-600">
                    Watch a quick sponsor ad to get +10 coins and continue your conversation
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleWatchAdForCoins}
                disabled={watchingAdForCoins}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-black uppercase tracking-wider shrink-0 border-3 shadow-[3px_3px_0px_0px_#000]"
              >
                <PlaySquare className="w-4 h-4 mr-1.5" />
                {watchingAdForCoins ? 'Watching Ad (+10 🪙)...' : 'Watch Ad for +10 Coins'}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-3 sm:p-4 bg-white border-t-4 border-black flex gap-2.5 items-center shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isWaitingForOpponent
                    ? messages.length === 0
                      ? 'Opponent starts the chat... please wait'
                      : 'Opponent is typing... waiting for reply'
                    : hasFreeMessage
                    ? 'Send message (1st message is FREE)...'
                    : isExtended
                    ? `Send message (1 Coin • ${coins} coins left)...`
                    : 'Type message to test your opponent...'
                }
                className={`flex-1 border-3 border-black rounded-2xl px-4 sm:px-5 py-3 font-bold text-black placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#FFD100] transition-all text-sm sm:text-base ${isWaitingForOpponent ? 'bg-neutral-200 opacity-60 cursor-not-allowed' : 'bg-neutral-50 focus:bg-white'}`}
                autoFocus
                disabled={isWaitingForOpponent}
              />
              <Button
                type="submit"
                variant={hasFreeMessage ? 'success' : 'primary'}
                size="md"
                disabled={!inputText.trim() || isWaitingForOpponent}
                className="px-5 sm:px-6 py-3 rounded-2xl shrink-0 border-3"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
          )}
        </div>

        {/* ========================================================== */}
        {/* RIGHT VERTICAL AD RAIL (PC: 160x600 Skyscraper or 300x250) */}
        {/* ========================================================== */}
        <aside className="hidden lg:flex flex-col items-center justify-center shrink-0 w-[160px] xl:w-[160px]">
          <AdSlot format="skyscraper" id="chat-right-rail-ad" />
        </aside>
      </div>

      {/* Discrete bottom bar with Forfeit / Abandon option or Extended Leave option */}
      <div className="w-full max-w-3xl flex justify-between items-center text-[11px] font-mono font-bold text-neutral-500 pt-2 shrink-0">
        <span>
          {isExtended
            ? 'Extended conversation active • You can leave at any time'
            : 'No leaving mid-match • Full 2-minute immersion'}
        </span>
        {isExtended && onEndExtendedChat ? (
          <button
            type="button"
            onClick={onEndExtendedChat}
            className="text-neutral-800 hover:text-black font-bold flex items-center gap-1 cursor-pointer underline"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Leave Extended Chat</span>
          </button>
        ) : onForfeitMatch ? (
          <button
            type="button"
            onClick={() => setShowForfeitModal(true)}
            className="text-neutral-500 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1 font-bold"
          >
            <Flag className="w-3 h-3" />
            <span>Abandon Match (-1 Streak)</span>
          </button>
        ) : null}
      </div>

      {/* Mobile-only Ad Banner at bottom */}
      <div className="mt-2 w-full max-w-sm lg:hidden shrink-0">
        <AdSlot format="mobile_banner" id="chat-mobile-banner" />
      </div>

      {/* Forfeit Match Confirmation Modal */}
      <ForfeitModal
        isOpen={showForfeitModal}
        onClose={() => setShowForfeitModal(false)}
        onConfirm={() => onForfeitMatch?.()}
      />

      {/* Out of Coins Pop-Up Modal */}
      <OutOfCoinsModal
        isOpen={showOutOfCoinsModal && !watchingAdForCoins}
        onClose={() => setShowOutOfCoinsModal(false)}
        onWatchAd={handleWatchAdForCoins}
      />

      {/* Rewarded Ad Watching Modal (+10 Coins) */}
      <AnimatePresence>
        {watchingAdForCoins && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white border-4 border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_#000] text-center"
            >
              <div className="w-14 h-14 bg-[#FFD100] rounded-2xl border-3 border-black flex items-center justify-center mx-auto mb-3 shadow-[3px_3px_0px_0px_#000]">
                <PlaySquare className="w-7 h-7 text-black animate-pulse" />
              </div>
              <h3 className="font-display font-black text-xl text-black mb-1 uppercase">
                Sponsor Video Ad
              </h3>
              <p className="text-xs font-bold text-neutral-600 mb-4">
                Watching ad to earn coins for extended chat...
              </p>
              <div className="w-full h-3 bg-neutral-100 border-2 border-black rounded-full overflow-hidden p-0.5 mb-3">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.8, ease: 'linear' }}
                  className="h-full bg-[#FFD100] rounded-full"
                />
              </div>
              <div className="font-mono text-xs font-black text-black flex items-center justify-center gap-1.5 bg-[#FFFDF5] border-2 border-black rounded-xl py-1.5">
                <span>Reward:</span>
                <span className="text-[#FFD100] bg-black px-2 py-0.5 rounded-md font-mono">+10 COINS</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
