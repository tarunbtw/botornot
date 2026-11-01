import React, { useState, useRef, useEffect } from 'react'
import type { Message } from '../types'
import { CoinIcon } from '../components/CoinIcon'
import {
  Send,
  Clock,
  Sparks,
  WarningTriangle,
  Xmark,
  PlaySolid,
} from 'iconoir-react'
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

  const chatScrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hasFreeMessage = isExtended && freeExtendedMessagesLeft > 0
  const isOutOfCoinsForNextMessage = isExtended && !hasFreeMessage && coins < 1

  // Strict Turn-Taking:
  // User cannot send if:
  // 1. It's match start and opponent has the first turn
  // 2. The last sent message was from the user (waiting for opponent reply)
  // 3. Opponent is currently typing
  const lastMessage = messages[messages.length - 1]
  const isWaitingForOpponent =
    (messages.length === 0 && isOpponentFirstTurn) ||
    lastMessage?.sender === 'user' ||
    opponentTyping

  // Track previous waiting state to detect when opponent finished replying
  const prevWaitingRef = useRef(isWaitingForOpponent)

  // Dynamic mobile viewport calculation for iOS Safari (keyboard handling & visual viewport locking)
  const [viewportHeight, setViewportHeight] = useState<number | null>(null)
  const [viewportTop, setViewportTop] = useState<number>(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const handleViewportChange = () => {
      if (window.innerWidth < 640) {
        setViewportHeight(vv.height)
        setViewportTop(vv.offsetTop)
        if (window.scrollY !== 0 || window.scrollX !== 0) {
          window.scrollTo(0, 0)
        }
      } else {
        setViewportHeight(null)
        setViewportTop(0)
      }
    }

    handleViewportChange()
    vv.addEventListener('resize', handleViewportChange)
    vv.addEventListener('scroll', handleViewportChange)
    window.addEventListener('resize', handleViewportChange)

    return () => {
      vv.removeEventListener('resize', handleViewportChange)
      vv.removeEventListener('scroll', handleViewportChange)
      window.removeEventListener('resize', handleViewportChange)
    }
  }, [])

  // Lock body scroll and window position completely while Chat is mounted
  useEffect(() => {
    window.scrollTo(0, 0)
    const prevOverflow = document.body.style.overflow
    const prevPosition = document.body.style.position
    const prevWidth = document.body.style.width
    const prevHeight = document.body.style.height
    const prevOverscroll = document.body.style.overscrollBehavior

    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.height = '100%'
    document.body.style.overscrollBehavior = 'none'

    const handleScroll = () => {
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.position = prevPosition
      document.body.style.width = prevWidth
      document.body.style.height = prevHeight
      document.body.style.overscrollBehavior = prevOverscroll
      window.removeEventListener('scroll', handleScroll)
      window.scrollTo(0, 0)
    }
  }, [])

  // Auto-focus the input box as soon as it becomes user's turn (with preventScroll so iOS doesn't pan viewport)
  useEffect(() => {
    // When transitioning from waiting (true) -> user's turn (false)
    if (prevWaitingRef.current && !isWaitingForOpponent && !isOutOfCoinsForNextMessage) {
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true })
      }, 50)
      return () => clearTimeout(timer)
    }
    prevWaitingRef.current = isWaitingForOpponent
  }, [isWaitingForOpponent, isOutOfCoinsForNextMessage])

  // Initial focus on mount if it's user's turn
  useEffect(() => {
    if (!isWaitingForOpponent && !isOutOfCoinsForNextMessage) {
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleWatchAdForCoins = () => {
    if (watchingAdForCoins) return
    setShowOutOfCoinsModal(false)
    setWatchingAdForCoins(true)
    setTimeout(() => {
      setWatchingAdForCoins(false)
      onWatchAdForCoins?.()
    }, 1800)
  }

  // Pure container scrolling: NEVER calls scrollIntoView which would jump the mobile browser window
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior,
      })
    }
  }

  useEffect(() => {
    scrollToBottom('smooth')
  }, [messages, opponentTyping])

  // Instantly keep latest messages visible on viewport resize (e.g. mobile keyboard pops open)
  useEffect(() => {
    if (viewportHeight !== null) {
      scrollToBottom('auto')
    }
  }, [viewportHeight])

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

  // Warn if user attempts to leave browser tab during regular 2-minute chat
  useEffect(() => {
    if (isExtended) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = 'Leaving the match early will reset your streak!'
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isExtended])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isWaitingForOpponent) return
    const trimmed = inputText.trim()
    if (!trimmed) return

    if (isOutOfCoinsForNextMessage) {
      setShowOutOfCoinsModal(true)
      return
    }

    onSendMessage(trimmed)
    setInputText('')
  }

  const isUrgent = !isExtended && timeLeft <= 15
  const isCritical = !isExtended && timeLeft <= 5

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

  return (
    <div
      style={
        viewportHeight !== null
          ? { height: `${viewportHeight}px`, top: `${viewportTop}px` }
          : undefined
      }
      className="w-full flex-1 flex flex-col justify-center items-center px-0 sm:px-4 py-0 sm:py-3 select-none fixed inset-x-0 z-30 sm:relative sm:inset-auto sm:z-auto sm:top-auto h-[100dvh] sm:h-[94vh] max-h-[100dvh] overflow-hidden"
    >
      {/* Sleek Instagram DM-style Chat Container */}
      <div className="w-full max-w-xl flex-1 flex flex-col h-full bg-white dark:bg-black sm:border sm:border-neutral-200 sm:dark:border-neutral-800 sm:rounded-3xl overflow-hidden">
        {/* Header: Clean Instagram Top Bar with Safe Area Inset for iOS Notch & Dynamic Island */}
        <div className="bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800 shrink-0 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-0">
          <div className="h-14 px-3.5 sm:px-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* Mystery Avatar */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-sm">
                  ?
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black" />
              </div>

              <div className="min-w-0">
                <h2 className="font-bold text-sm sm:text-base text-black dark:text-white leading-tight truncate">
                  Anonymous Stranger
                </h2>
                <span className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 block leading-tight">
                  {opponentTyping ? 'Typing...' : 'Active now'}
                </span>
              </div>
            </div>

            {/* Right Header: Timer & Leave Match (X) */}
            <div className="flex items-center gap-2 shrink-0">
              {!isExtended ? (
                <motion.div
                  animate={
                    isCritical
                      ? { scale: [1, 1.08, 1] }
                      : isUrgent
                      ? { scale: [1, 1.04, 1] }
                      : {}
                  }
                  transition={{ repeat: Infinity, duration: isCritical ? 0.4 : 0.8 }}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full font-mono font-medium text-[11px] sm:text-xs transition-colors ${
                    isUrgent
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200'
                  }`}
                  title="Remaining round time"
                >
                  {isUrgent ? <WarningTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                  <span>{formattedTime}</span>
                </motion.div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full font-mono font-medium text-[11px] sm:text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  <Sparks className="w-3.5 h-3.5 text-[#FFD100]" />
                  <span>Extended</span>
                </div>
              )}

              {isExtended && onEndExtendedChat ? (
                <button
                  type="button"
                  onClick={onEndExtendedChat}
                  className="p-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded-full transition-colors cursor-pointer"
                  title="Leave extended chat"
                >
                  <Xmark className="w-5 h-5 stroke-[2]" />
                </button>
              ) : onForfeitMatch && !isExtended ? (
                <button
                  type="button"
                  onClick={() => setShowForfeitModal(true)}
                  className="p-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded-full transition-colors cursor-pointer"
                  title="Abandon Match (-1 Streak)"
                >
                  <Xmark className="w-5 h-5 stroke-[2]" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Extended Mode Banner */}
        {isExtended && (
          <div
            className={`border-b border-neutral-200 dark:border-neutral-800 px-3.5 sm:px-4 py-2 flex items-center justify-between text-xs font-semibold shrink-0 ${
              hasFreeMessage
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                : coins < 1
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparks className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                {hasFreeMessage
                  ? '1st message is FREE!'
                  : coins < 1
                  ? 'Coins finished! Watch ad for +10 coins'
                  : 'Extended: 1 Coin / msg'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[11px] bg-white dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700 flex items-center gap-1">
                {hasFreeMessage ? (
                  'FREE'
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
                  className="font-mono text-[10px] font-bold bg-[#FFD100] text-black px-2.5 py-1 rounded-full hover:bg-[#E6BC00] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <PlaySolid className="w-3 h-3" />
                  <span>+10 🪙</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Message Stream: Solid Instagram Canvas */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-5 py-3 space-y-2 bg-white dark:bg-black touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="text-center my-2">
            <span className="text-[11px] sm:text-[12px] font-normal text-neutral-400 dark:text-neutral-500">
              {isExtended ? 'Extended Match' : '2-Minute Turing Chat • Decide at zero'}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.sender === 'user'
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-[14px] sm:text-[15px] leading-snug select-text ${
                      isUser
                        ? 'bg-[#FFD100] text-black font-medium rounded-br-xs'
                        : 'bg-[#EFEFEF] dark:bg-[#262626] text-black dark:text-white rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {/* Typing Indicator Bubble */}
          {opponentTyping && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-[#EFEFEF] dark:bg-[#262626] rounded-2xl rounded-bl-xs px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce [animation-delay:0.3s]" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Bar: Solid Instagram DM Capsule (With Safe Area Insets for Mobile) */}
        {isOutOfCoinsForNextMessage ? (
          <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Out of coins for extended chat!
            </div>
            <button
              type="button"
              onClick={handleWatchAdForCoins}
              disabled={watchingAdForCoins}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-[#FFD100] text-black rounded-full hover:bg-[#E6BC00] transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <PlaySolid className="w-3.5 h-3.5" />
              <span>{watchingAdForCoins ? 'Watching...' : 'Watch Ad (+10 🪙)'}</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-2.5 sm:p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2 shrink-0"
          >
            {/* Pill Container: Solid flat capsule, NO borders, NO glow */}
            <div
              className={`flex-1 flex items-center bg-[#EFEFEF] dark:bg-[#262626] rounded-full px-3.5 sm:px-4 py-1.5 sm:py-2 transition-opacity ${
                isWaitingForOpponent ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
              }`}
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isWaitingForOpponent}
                placeholder={
                  isWaitingForOpponent
                    ? messages.length === 0 && isOpponentFirstTurn
                      ? 'Waiting for opponent...'
                      : opponentTyping
                      ? 'Opponent is typing...'
                      : "Opponent's turn..."
                    : 'Message...'
                }
                className="w-full bg-transparent text-[16px] sm:text-[15px] font-normal text-black dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 outline-none disabled:cursor-not-allowed"
                autoComplete="off"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isWaitingForOpponent}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                inputText.trim() && !isWaitingForOpponent
                  ? 'bg-[#FFD100] text-black hover:scale-105 active:scale-95 cursor-pointer'
                  : 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-30'
              }`}
              title={isWaitingForOpponent ? "Opponent's turn" : 'Send message'}
            >
              <Send className="w-4 h-4 stroke-[2.2]" />
            </button>
          </form>
        )}
      </div>

      {/* Forfeit Modal */}
      <ForfeitModal
        isOpen={showForfeitModal}
        onClose={() => setShowForfeitModal(false)}
        onConfirm={() => onForfeitMatch?.()}
      />

      {/* Out of Coins Modal */}
      <OutOfCoinsModal
        isOpen={showOutOfCoinsModal}
        onClose={() => setShowOutOfCoinsModal(false)}
        onWatchAd={handleWatchAdForCoins}
      />
    </div>
  )
}
