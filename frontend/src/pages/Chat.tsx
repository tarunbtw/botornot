import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Clock, Sparkles, Check, X, Coins, User, Bot } from 'lucide-react'
import { gameSocket, type ServerEvent } from '../lib/game-socket.js'
import { fetchActiveGame, fetchGameMessages, fetchStats } from '../lib/api.js'
import { sounds } from '../lib/sound.js'

interface Message {
  id: string
  isSelf: boolean
  content: string
}

interface IncomingExtension {
  requestId: string
  cost: number
  expiresAt: string
}

interface GuessResult {
  guess: 'HUMAN' | 'AI'
  isCorrect: boolean
  reward: number
  actualOpponentType: 'HUMAN' | 'AI'
  balanceAfter: number
}

// General Lucide Avatar (Same on both user and opponent sides, matching website theme)
function GeneralAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#f1eee7] border-2 border-[#232323] shadow-[1.5px_1.5px_0px_#232323] flex items-center justify-center flex-shrink-0 text-[#232323]">
      <User className="w-4 h-4" />
    </div>
  )
}

export default function Chat() {
  const { gameId: paramGameId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const state = (location.state as {
    gameId?: string
    endsAt?: string
    isFirstSender?: boolean
  } | null) || null

  const effectiveGameId = paramGameId || state?.gameId || null

  const [gameId, setGameId] = useState<string | null>(effectiveGameId)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (state?.endsAt) {
      const endsAtMs = new Date(state.endsAt).getTime()
      return Math.max(0, Math.round((endsAtMs - Date.now()) / 1000)) || 120
    }
    return 120
  })
  const [isFirstSender, setIsFirstSender] = useState(state?.isFirstSender ?? false)
  const [hasFirstMessageSent, setHasFirstMessageSent] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [opponentTyping, setOpponentTyping] = useState(false)
  const [isTimeUp, setIsTimeUp] = useState(false)

  // Modals & Result State
  const [showResultModal, setShowResultModal] = useState(false)
  const [guessResult, setGuessResult] = useState<GuessResult | null>(null)
  const [canExtend, setCanExtend] = useState(false)
  const [extensionStatus, setExtensionStatus] = useState<'idle' | 'requested' | 'active'>('idle')
  const [incomingExtension, setIncomingExtension] = useState<IncomingExtension | null>(null)
  const [statsCoins, setStatsCoins] = useState<number>(10)

  // Dedicated container ref for internal message scrolling (prevents full-page jumping)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // 1. Restore active game if reloaded or if URL param is present
  useEffect(() => {
    fetchStats().then((st) => {
      if (st) setStatsCoins(st.tokenBalance)
    })

    if (!effectiveGameId) {
      fetchActiveGame().then((res) => {
        if (res?.active && res.game) {
          setGameId(res.game.id)
          setIsFirstSender(Boolean(res.game.isFirstSender))
          navigate(`/chat/${res.game.id}`, { replace: true })

          const endsAtMs = new Date(res.game.initialEndsAt).getTime()
          const diff = Math.max(0, Math.round((endsAtMs - Date.now()) / 1000))
          setSecondsRemaining(diff)
          if (diff <= 0) setIsTimeUp(true)

          fetchGameMessages(res.game.id).then((msgs) => {
            if (msgs.length > 0) {
              setHasFirstMessageSent(true)
              setMessages(
                msgs.map((m: { id: string; isSelf: boolean; content: string }) => ({
                  id: m.id,
                  isSelf: m.isSelf,
                  content: m.content,
                })),
              )
            }
          })
        } else {
          // No active game found; return to search
          navigate('/search', { replace: true })
        }
      })
    } else {
      if (!paramGameId) {
        navigate(`/chat/${effectiveGameId}`, { replace: true, state })
      }
      // Load messages if directly accessing /chat/:gameId
      fetchGameMessages(effectiveGameId).then((msgs) => {
        if (msgs.length > 0) {
          setHasFirstMessageSent(true)
          setMessages(
            msgs.map((m: { id: string; isSelf: boolean; content: string }) => ({
              id: m.id,
              isSelf: m.isSelf,
              content: m.content,
            })),
          )
        }
      })
    }
  }, [effectiveGameId, paramGameId, state, navigate])

  // 2. WebSocket listener
  useEffect(() => {
    gameSocket.connect()

    const unsubscribe = gameSocket.subscribe((event: ServerEvent) => {
      switch (event.type) {
        case 'game.started': {
          setGameId(event.payload.gameId)
          setIsFirstSender(event.payload.isFirstSender)
          navigate(`/chat/${event.payload.gameId}`, { replace: true })
          const endsAtMs = new Date(event.payload.endsAt).getTime()
          const diff = Math.max(0, Math.round((endsAtMs - Date.now()) / 1000))
          setSecondsRemaining(diff || 120)
          break
        }

        case 'chat.message': {
          sounds.message()
          setOpponentTyping(false)
          setHasFirstMessageSent(true)
          setMessages((prev) => [
            ...prev,
            {
              id: event.payload.id,
              isSelf: event.payload.isSelf,
              content: event.payload.content,
            },
          ])
          break
        }

        case 'chat.ai_delta': {
          setOpponentTyping(true)
          break
        }

        case 'chat.ai_done': {
          sounds.message()
          setOpponentTyping(false)
          setHasFirstMessageSent(true)
          setMessages((prev) => [
            ...prev,
            {
              id: event.payload.id,
              isSelf: false,
              content: event.payload.content,
            },
          ])
          break
        }

        case 'guess.request': {
          setIsTimeUp(true)
          break
        }

        case 'guess.result': {
          if (event.payload.isCorrect) {
            sounds.win()
          } else {
            sounds.loss()
          }
          setGuessResult(event.payload)
          setShowResultModal(true)
          if (event.payload.balanceAfter !== undefined) {
            setStatsCoins(event.payload.balanceAfter)
          }
          break
        }

        case 'game.resolved': {
          setCanExtend(event.payload.canExtend)
          break
        }

        case 'extension.requested': {
          setIncomingExtension({
            requestId: event.payload.requestId,
            cost: event.payload.cost,
            expiresAt: event.payload.expiresAt,
          })
          break
        }

        case 'extension.started': {
          setIncomingExtension(null)
          setIsTimeUp(false)
          setShowResultModal(false)
          setExtensionStatus('active')
          const endsAtMs = new Date(event.payload.endsAt).getTime()
          const diff = Math.max(0, Math.round((endsAtMs - Date.now()) / 1000))
          setSecondsRemaining(diff || 300)
          break
        }

        case 'extension.declined': {
          setIncomingExtension(null)
          setExtensionStatus('idle')
          break
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [navigate])

  // 3. Countdown timer
  useEffect(() => {
    if (isTimeUp) return
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsTimeUp(true)
          return 0
        }
        if (prev <= 10) {
          sounds.tick()
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isTimeUp])

  // 4. Dedicated internal container scroll (does NOT scroll the outer page or shift the input box)
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages, opponentTyping])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !gameId || isTimeUp) return
    sounds.message()
    gameSocket.sendMessage(gameId, inputText.trim())
    setInputText('')
  }

  const handleGuess = (guess: 'HUMAN' | 'AI') => {
    if (!gameId) return
    gameSocket.submitGuess(gameId, guess)
  }

  const handleRequestExtension = () => {
    if (!gameId) return
    setExtensionStatus('requested')
    gameSocket.requestExtension(gameId)
  }

  const handleRespondExtension = (accept: boolean) => {
    if (!incomingExtension) return
    gameSocket.respondExtension(incomingExtension.requestId, accept)
    setIncomingExtension(null)
  }

  const handlePlayAgain = () => {
    navigate('/search')
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  const canSend = !isTimeUp && (hasFirstMessageSent || isFirstSender)

  return (
    <div className="min-h-screen bg-[#f1eee7] text-[#232323] px-4 sm:px-6 pt-2 pb-16 flex flex-col items-center">
      {/* Top Status Header Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between py-3 mb-4 border-b-2 border-[#232323]/20">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-pixel font-bold text-[#232323]">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isTimeUp ? 'bg-rose-500' : 'bg-[#22c55e] animate-pulse'
            }`}
          />
          <span>{isTimeUp ? 'ROUND COMPLETED' : 'ROUND IN PROGRESS'}</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ffffff] border-2 border-[#232323] shadow-[2px_2px_0px_#232323] rounded-full text-xs sm:text-sm font-pixel font-bold">
          <Clock className="w-4 h-4 text-[#22c55e]" />
          <span>{formatTimer(secondsRemaining)}</span>
        </div>
      </div>

      {/* Incoming Extension Request Modal */}
      <AnimatePresence>
        {incomingExtension && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 bg-[#232323]/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="neo-card p-6 sm:p-8 max-w-sm w-full text-center bg-[#f1eee7] border-2 border-[#232323] shadow-[4px_4px_0px_#232323]">
              <Sparkles className="w-10 h-10 text-[#22c55e] mx-auto mb-3 animate-bounce" />
              <h3 className="font-pixel text-lg sm:text-xl font-bold text-[#232323] mb-2">
                EXTENSION REQUESTED!
              </h3>
              <p className="font-pixel text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
                Your partner requested a 5-minute chat extension.
                <br />
                Cost: <span className="text-[#22c55e] font-bold">{incomingExtension.cost} coins</span>.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleRespondExtension(true)}
                  className="flex-1 neo-btn neo-btn-green py-3 rounded-xl font-pixel text-xs sm:text-sm font-bold text-[#232323] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>ACCEPT</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRespondExtension(false)}
                  className="flex-1 neo-btn py-3 rounded-xl font-pixel text-xs sm:text-sm font-bold bg-[#ffffff] text-[#232323] hover:bg-rose-500 hover:text-white flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>DECLINE</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Result Modal with Background Blur */}
      <AnimatePresence>
        {showResultModal && guessResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#232323]/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="neo-card p-6 sm:p-8 max-w-sm w-full text-center bg-[#f1eee7] border-2 border-[#232323] shadow-[4px_4px_0px_#232323] relative"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowResultModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-[#232323] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Status Header (WRONG! / CORRECT!) */}
              <div className="mb-2">
                {guessResult.isCorrect ? (
                  <span className="inline-flex items-center gap-1.5 font-pixel font-bold text-sm sm:text-base text-[#16a34a] tracking-wider">
                    <Check className="w-4 h-4" /> CORRECT!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-pixel font-bold text-sm sm:text-base text-rose-600 tracking-wider">
                    <X className="w-4 h-4" /> WRONG!
                  </span>
                )}
              </div>

              <div className="font-pixel text-xs text-slate-600 font-bold mb-3">
                You just talked to
              </div>

              {/* Opponent Identity Avatar Badge (General Lucide) */}
              <div className="flex flex-col items-center justify-center gap-2 mb-3">
                <div className="w-14 h-14 rounded-full bg-[#ffffff] border-2 border-[#232323] shadow-[2px_2px_0px_#232323] flex items-center justify-center text-[#232323]">
                  {guessResult.actualOpponentType === 'HUMAN' ? (
                    <User className="w-7 h-7 text-[#22c55e]" />
                  ) : (
                    <Bot className="w-7 h-7 text-rose-500" />
                  )}
                </div>
                <span className="font-pixel text-xl font-black text-[#232323] tracking-wider">
                  {guessResult.actualOpponentType === 'HUMAN' ? 'HUMAN' : 'AI BOT'}
                </span>
              </div>

              {/* Tagline */}
              <p className="font-pixel text-xs text-slate-600 mb-6 font-bold">
                {guessResult.isCorrect
                  ? 'Spot on! You saw right through the imitation.'
                  : 'You were fooled by the Turing player!'}
              </p>

              {/* Required Data Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6 text-left">
                <div className="bg-[#ffffff] border-2 border-[#232323] shadow-[2px_2px_0px_#232323] rounded-lg p-2.5">
                  <div className="text-[10px] font-pixel text-slate-500 font-bold mb-0.5">REWARD</div>
                  <div className="text-xs sm:text-sm font-pixel font-bold text-[#16a34a] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    +{guessResult.reward} TOKENS
                  </div>
                </div>

                <div className="bg-[#ffffff] border-2 border-[#232323] shadow-[2px_2px_0px_#232323] rounded-lg p-2.5">
                  <div className="text-[10px] font-pixel text-slate-500 font-bold mb-0.5">BALANCE</div>
                  <div className="text-xs sm:text-sm font-pixel font-bold text-[#232323] flex items-center gap-1">
                    <Coins className="w-3 h-3 text-[#22c55e]" />
                    {guessResult.balanceAfter ?? statsCoins} COINS
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {canExtend && (
                  <button
                    type="button"
                    disabled={extensionStatus !== 'idle'}
                    onClick={handleRequestExtension}
                    className="w-full neo-btn py-3 rounded-xl bg-[#ffffff] hover:bg-[#22c55e] text-[#232323] font-pixel text-xs sm:text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {extensionStatus === 'requested' ? 'REQUEST SENT...' : 'EXTEND CHAT (+5 MIN)'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePlayAgain}
                  className="w-full neo-btn neo-btn-green py-3.5 rounded-xl text-[#232323] font-pixel text-xs sm:text-sm font-bold hover:scale-[1.02] transition-all cursor-pointer"
                >
                  NEW GAME
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs font-pixel text-slate-500 hover:text-[#232323] underline cursor-pointer mt-1"
                >
                  Return to Home
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat View (Open layout directly on #f1eee7 background) */}
      <div className="w-full max-w-2xl flex flex-col items-stretch flex-1">
        {/* Conversation Header */}
        <div className="text-center mb-4">
          <div className="text-xs font-pixel font-bold text-slate-500">Conversation started</div>
          <div className="text-xs font-pixel font-bold text-[#16a34a] mt-0.5">
            {isFirstSender ? 'Started by you' : 'Waiting for partner to send first message'}
          </div>
        </div>

        {/* Dedicated Message Scroll Area (Internal scroll container avoids whole-page jumping) */}
        <div
          ref={messagesContainerRef}
          data-lenis-prevent
          style={{ overflowAnchor: 'none' }}
          className="w-full flex-1 overflow-y-auto max-h-[50vh] min-h-[300px] space-y-4 px-1 py-3 border-y border-[#232323]/10"
        >
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-xs sm:text-sm text-slate-400 font-pixel font-bold py-12">
              Say hello to start the 2-minute conversation!
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-end gap-2.5 ${m.isSelf ? 'justify-end' : 'justify-start'}`}
              >
                {/* General Avatar on Opponent Side (Left) */}
                {!m.isSelf && <GeneralAvatar />}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2.5 font-pixel text-xs sm:text-sm font-bold border-2 border-[#232323] shadow-[2px_2px_0px_#232323] rounded-sm max-w-[75%] sm:max-w-[70%] break-words ${
                    m.isSelf
                      ? 'bg-[#22c55e] text-[#232323]'
                      : 'bg-[#ffffff] text-[#232323]'
                  }`}
                >
                  {m.content}
                </div>

                {/* General Avatar on User Side (Right) - Same Avatar style */}
                {m.isSelf && <GeneralAvatar />}
              </div>
            ))
          )}

          {/* Typing Indicator Bar */}
          {opponentTyping && (
            <div className="flex items-end gap-2.5 justify-start">
              <GeneralAvatar />
              <div className="bg-[#ffffff] text-slate-600 px-4 py-2 font-pixel text-xs italic border-2 border-[#232323] shadow-[2px_2px_0px_#232323] rounded-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
                User is typing...
              </div>
            </div>
          )}
        </div>

        {/* Bottom Chat Input Bar (Firmly positioned below message scroll area) */}
        {!isTimeUp ? (
          <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2.5 pt-4 pb-2 bg-[#f1eee7]">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!canSend}
              placeholder={
                canSend ? 'Type your message...' : 'Waiting for first message...'
              }
              className="flex-1 bg-[#ffffff] text-[#232323] border-2 border-[#232323] shadow-[2px_2px_0px_#232323] rounded-xl px-4 py-3 text-xs sm:text-sm font-pixel focus:outline-none focus:border-[#22c55e] transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!canSend || !inputText.trim()}
              className="neo-btn neo-btn-green p-3.5 rounded-xl text-[#232323] disabled:opacity-40 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Conversation Finished Section & Guess Buttons (When 2 min ended) */
          <div className="w-full pt-4 pb-2 text-center flex flex-col items-center bg-[#f1eee7]">
            <div className="text-xs font-pixel font-bold text-slate-500 mb-0.5">
              Conversation ended
            </div>
            <div className="text-xs font-pixel font-bold text-[#c026d3] mb-4">
              a few seconds ago
            </div>

            <h3 className="font-pixel text-sm sm:text-base font-bold text-[#232323] mb-4">
              Who did you talk to?
            </h3>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <button
                type="button"
                onClick={() => handleGuess('HUMAN')}
                className="neo-btn neo-btn-green py-3.5 rounded-xl font-pixel text-xs sm:text-sm font-bold text-[#232323] flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>HUMAN</span>
              </button>

              <button
                type="button"
                onClick={() => handleGuess('AI')}
                className="neo-btn py-3.5 rounded-xl font-pixel text-xs sm:text-sm font-bold bg-[#ffffff] text-[#232323] border-2 border-[#232323] shadow-[2px_2px_0px_#232323] flex items-center justify-center gap-2 hover:scale-105 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>AI BOT</span>
              </button>
            </div>
          </div>
        )}

        {/* How the Challenges Work Section (Kept without "The Turing Test" paragraphs) */}
        <section className="w-full mt-10 pt-6 border-t-2 border-[#232323]/20">
          <h3 className="font-pixel text-base sm:text-lg font-bold text-[#232323] mb-3">
            How the Challenges Work
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-[#555] font-pixel">
            <li>
              • <strong className="text-[#232323]">The Interaction:</strong> Users enter a two-minute text conversation with an unknown entity.
            </li>
            <li>
              • <strong className="text-[#232323]">The Analysis:</strong> Participants evaluate word choice and emotional tone.
            </li>
            <li>
              • <strong className="text-[#232323]">The Verdict:</strong> Users identify the participant as a person or a Large Language Model.
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
