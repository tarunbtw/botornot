import { useState, useEffect, useRef } from 'react'
import type { GameState, OpponentType, Message } from './types'
import { Navbar } from './components/Navbar'
import { fetchAIResponse, resetMatchPersona } from './lib/ai-client'
import { Home } from './screens/Home'
import { Matchmaking } from './screens/Matchmaking'
import { Chat } from './screens/Chat'
import { Guess } from './screens/Guess'
import { Leaderboard } from './screens/Leaderboard'
import { DailyQuestsModal } from './components/DailyQuestsModal'
import { AnimatePresence, motion } from 'framer-motion'
import { gameSocket, type ServerEvent } from './lib/game-socket.js'
import { fetchMe, fetchStats } from './lib/api.js'
import { playMatchFound, playReward } from './lib/audio'
import {
  loadQuestsData,
  saveQuestsData,
  getUnclaimedCount,
  getAdsWatchedInWindow,
  type DailyQuestsData,
} from './lib/quests'

export default function App() {
  const [gameState, setGameState] = useState<GameState>('HOME')
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('botornot_coins')
    return saved !== null ? parseInt(saved, 10) : 10
  })
  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem('botornot_streak')
    return saved !== null ? parseInt(saved, 10) : 0
  })
  const [wins, setWins] = useState<number>(() => {
    const saved = localStorage.getItem('botornot_wins')
    return saved !== null ? parseInt(saved, 10) : 4
  })
  const [losses, setLosses] = useState<number>(() => {
    const saved = localStorage.getItem('botornot_losses')
    return saved !== null ? parseInt(saved, 10) : 2
  })

  const [opponent, setOpponent] = useState<OpponentType>('AI')
  const [userGuess, setUserGuess] = useState<OpponentType | null>(null)
  const [chatMessages, setChatMessages] = useState<Message[]>([])
  // 2 Minutes (120 seconds) per chat as requested!
  const [chatTimeLeft, setChatTimeLeft] = useState<number>(120)
  const [coinAnimAmount, setCoinAnimAmount] = useState<number>(0)
  const [isExtendedChat, setIsExtendedChat] = useState<boolean>(false)
  const [freeExtendedMessagesLeft, setFreeExtendedMessagesLeft] = useState<number>(0)
  const [opponentTyping, setOpponentTyping] = useState<boolean>(false)
  const [isOpponentFirstTurn, setIsOpponentFirstTurn] = useState<boolean>(false)
  const isAiRespondingRef = useRef<boolean>(false)
  const aiTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const aiGenerationIdRef = useRef<number>(0)

  const clearAiTimers = () => {
    aiTimersRef.current.forEach(clearTimeout)
    aiTimersRef.current = []
    setOpponentTyping(false)
    aiGenerationIdRef.current++
  }

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
  const [showQuestsModal, setShowQuestsModal] = useState<boolean>(false)
  const [questsData, setQuestsData] = useState<DailyQuestsData>(() => loadQuestsData())

  // Sync daily quests whenever day changes or mounts
  useEffect(() => {
    setQuestsData(loadQuestsData())
  }, [])

  const handleClaimQuest = (questId: string, reward: number) => {
    setQuestsData((prev) => {
      if (prev.claimedQuestIds.includes(questId)) return prev
      const updated = {
        ...prev,
        claimedQuestIds: [...prev.claimedQuestIds, questId],
      }
      saveQuestsData(updated)
      return updated
    })
    handleCoinsChange(coins + reward)
    playReward()
  }

  const handleClaimLogin = (reward: number) => {
    setQuestsData((prev) => {
      if (prev.loginClaimedToday) return prev
      const updated = {
        ...prev,
        loginClaimedToday: true,
      }
      saveQuestsData(updated)
      return updated
    })
    handleCoinsChange(coins + reward)
    playReward()
  }

  const handleClaimAllBonus = (reward: number) => {
    setQuestsData((prev) => {
      if (prev.allClaimed) return prev
      const updated = {
        ...prev,
        allClaimed: true,
      }
      saveQuestsData(updated)
      return updated
    })
    handleCoinsChange(coins + reward)
    playReward()
  }

  // Centrally handles watching an ad and tracks 12-hour limit (max 5 ads per 12h)
  const handleRecordAdWatched = () => {
    const adInfo = getAdsWatchedInWindow(questsData.adWatchTimestamps)
    if (!adInfo.canWatch) {
      alert(`Daily limit reached: Maximum 5 ads per 12 hours. Please check back later!`)
      return
    }

    const now = Date.now()
    setQuestsData((prev) => {
      const updated = {
        ...prev,
        adsWatchedToday: prev.adsWatchedToday + 1,
        adWatchTimestamps: [...(prev.adWatchTimestamps || []), now],
      }
      saveQuestsData(updated)
      return updated
    })
    handleCoinsChange(coins + 10)
  }

  const handleForfeitMatch = () => {
    clearAiTimers()
    isAiRespondingRef.current = false
    setIsOpponentFirstTurn(false)
    setStreak((prev) => Math.max(0, prev - 1))
    setUserGuess(null)
    setGameState('HOME')
  }

  // Track active backend game ID if connected to Fastify backend
  const activeBackendGameIdRef = useRef<string | null>(null)

  // Sync token balance from backend if available
  useEffect(() => {
    fetchMe().then((me) => {
      if (me && typeof me.tokenBalance === 'number') {
        setCoins(me.tokenBalance)
      }
    }).catch(() => {})
    fetchStats().then((st) => {
      if (st && typeof st.tokenBalance === 'number') {
        setCoins(st.tokenBalance)
      }
    }).catch(() => {})
  }, [])

  // Persist local stats
  useEffect(() => {
    localStorage.setItem('botornot_coins', coins.toString())
    localStorage.setItem('botornot_streak', streak.toString())
    localStorage.setItem('botornot_wins', wins.toString())
    localStorage.setItem('botornot_losses', losses.toString())
  }, [coins, streak, wins, losses])

  const handleCoinsChange = (newCoins: number) => {
    const diff = newCoins - coins
    setCoins(newCoins)
    if (diff !== 0) {
      setCoinAnimAmount(diff)
      setTimeout(() => setCoinAnimAmount(0), 2200)
    }
  }

  // --- Matchmaking Effect with Real Backend + Resilient Fallback ---
  useEffect(() => {
    if (gameState !== 'MATCHMAKING') return

    let isSubscribed = true
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null

    const handleMatchFound = () => {
      if (!isSubscribed) return
      playMatchFound()
      clearAiTimers()
      const isAI = Math.random() > 0.45
      const opponentStarts = Math.random() > 0.5
      setIsOpponentFirstTurn(opponentStarts)
      setOpponent(isAI ? 'AI' : 'HUMAN')
      setChatMessages([])
      setChatTimeLeft(120) // Full 2 minutes (120s)!
      setIsExtendedChat(false)
      setFreeExtendedMessagesLeft(0)
      setGameState('CHAT')
      resetMatchPersona()

      // If opponent starts the game, initiate their opening greeting with tracked timer
      if (opponentStarts) {
        const thisGen = ++aiGenerationIdRef.current
        const openingTimer = setTimeout(() => {
          if (thisGen !== aiGenerationIdRef.current) return
          triggerAiOpponentReply([])
        }, 1200 + Math.floor(Math.random() * 400))
        aiTimersRef.current.push(openingTimer)
      }
    }

    try {
      gameSocket.connect()
      gameSocket.joinQueue()

      const unsubscribe = gameSocket.subscribe((event: ServerEvent) => {
        if (!isSubscribed) return
        if (event.type === 'game.matched') {
          playMatchFound()
        }
        if (event.type === 'game.started') {
          activeBackendGameIdRef.current = event.payload.gameId
          if (fallbackTimer) clearTimeout(fallbackTimer)
          handleMatchFound()
        }
      })

      // If backend DB/Redis is not running or takes > 3.5s, gracefully proceed
      fallbackTimer = setTimeout(() => {
        if (isSubscribed && gameState === 'MATCHMAKING') {
          handleMatchFound()
        }
      }, 3500)

      return () => {
        isSubscribed = false
        if (fallbackTimer) clearTimeout(fallbackTimer)
        unsubscribe()
        gameSocket.cancelQueue()
      }
    } catch {
      fallbackTimer = setTimeout(() => {
        if (isSubscribed && gameState === 'MATCHMAKING') {
          handleMatchFound()
        }
      }, 3000)

      return () => {
        isSubscribed = false
        if (fallbackTimer) clearTimeout(fallbackTimer)
      }
    }
  }, [gameState])

  // --- Chat Timer Effect (2 Minutes / 120 Seconds) ---
  useEffect(() => {
    if (gameState === 'CHAT' && !isExtendedChat) {
      if (chatTimeLeft > 0) {
        const timer = setTimeout(() => setChatTimeLeft((prev) => prev - 1), 1000)
        return () => clearTimeout(timer)
      } else {
        setGameState('GUESS')
      }
    }
  }, [gameState, chatTimeLeft, isExtendedChat])

  // --- Opponent Conversational AI (Groq Cloud + Persistent Persona) ---
  // Clean up timers on unmount or screen transition
  useEffect(() => {
    if (gameState !== 'CHAT') {
      clearAiTimers()
      isAiRespondingRef.current = false
    }
  }, [gameState])

  const triggerAiOpponentReply = async (history: Message[]) => {
    // STRICT TURN-TAKING: Don't reply if last message was already from opponent
    const lastMsg = history[history.length - 1]
    if (lastMsg && lastMsg.sender === 'opponent') return

    const thisGenId = ++aiGenerationIdRef.current
    isAiRespondingRef.current = true

    try {
      const result = await fetchAIResponse(
        history.map((m) => ({
          sender: m.sender,
          text: m.text,
        }))
      )

      if (thisGenId !== aiGenerationIdRef.current) return

      // 1. Reading pause — human reads the incoming message first
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, result.readingDelayMs)
        aiTimersRef.current.push(timer)
      })

      if (thisGenId !== aiGenerationIdRef.current) return

      // 2. Typing indicator ON — human starts typing their reply
      setOpponentTyping(true)

      // 3. Typing duration — proportional to response length
      await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, result.typingDelayMs)
        aiTimersRef.current.push(timer)
      })

      setOpponentTyping(false)

      if (thisGenId !== aiGenerationIdRef.current) return

      // 4. Deliver SINGLE message with strict invariant: NEVER two opponent messages in a row
      if (result.text) {
        setChatMessages((prev) => {
          if (prev.length > 0 && prev[prev.length - 1].sender === 'opponent') {
            return prev
          }
          return [
            ...prev,
            {
              id: Date.now().toString(),
              sender: 'opponent',
              text: result.text,
              timestamp: Date.now(),
            },
          ]
        })
      }
      setIsOpponentFirstTurn(false)
    } catch (err) {
      console.warn('[AI] Error in reply generation:', err)
      setOpponentTyping(false)
    } finally {
      if (thisGenId === aiGenerationIdRef.current) {
        isAiRespondingRef.current = false
      }
    }
  }

  // --- Handle User Sending a Message ---
  const handleSendMessage = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    // Can't send if it's the opponent's first turn to start
    if (chatMessages.length === 0 && isOpponentFirstTurn) return

    // STRICT TURN-TAKING: User can't send if last message was already from user
    const lastMsg = chatMessages[chatMessages.length - 1]
    if (lastMsg && lastMsg.sender === 'user') return

    // Cancel any pending AI timers/generations
    clearAiTimers()
    isAiRespondingRef.current = false
    setIsOpponentFirstTurn(false)

    if (isExtendedChat) {
      if (freeExtendedMessagesLeft > 0) {
        setFreeExtendedMessagesLeft((prev) => prev - 1)
      } else {
        if (coins < 1) return
        handleCoinsChange(coins - 1)
      }
    }

    // Forward to backend game socket if active game exists
    if (activeBackendGameIdRef.current) {
      try {
        gameSocket.sendMessage(activeBackendGameIdRef.current, trimmed)
      } catch {
        // local fallback
      }
    }

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: Date.now(),
    }

    const updated = [...chatMessages, newMsg]
    setChatMessages(updated)

    // Opponent replies on their turn (strictly 1 message)
    triggerAiOpponentReply(updated)
  }

  // --- Handle Verdict Guess ---
  const handleGuess = (guess: OpponentType) => {
    setUserGuess(guess)
    const isCorrect = guess === opponent

    if (activeBackendGameIdRef.current) {
      try {
        gameSocket.submitGuess(activeBackendGameIdRef.current, guess)
      } catch {
        // local fallback
      }
    }

    if (isCorrect) {
      handleCoinsChange(coins + 10)
      setStreak((prev) => prev + 1)
      setWins((prev) => prev + 1)
    } else {
      handleCoinsChange(coins + 5)
      setStreak(0)
      setLosses((prev) => prev + 1)
    }

    // Update Daily Quests progress (Matches played and correct guesses)
    setQuestsData((prev) => {
      const updated = {
        ...prev,
        matchesPlayed: prev.matchesPlayed + 1,
        correctGuesses: isCorrect ? prev.correctGuesses + 1 : prev.correctGuesses,
      }
      saveQuestsData(updated)
      return updated
    })
  }

  // --- Handle Extend Chat ---
  const handleExtendChat = () => {
    setIsExtendedChat(true)
    setFreeExtendedMessagesLeft(1)
    setChatTimeLeft(300) // add 5 minutes extended
    setGameState('CHAT')
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black flex flex-col font-body selection:bg-black selection:text-[#FFD100]">
      {/* Top Navbar in Yellow & White Neo-Brutalist Theme - Hidden during Chat for distractionless experience */}
      {gameState !== 'CHAT' && (
        <Navbar
          coins={coins}
          streak={streak}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
          onOpenSettings={() => {
            if (gameState !== 'HOME') setGameState('HOME')
            setShowSettingsModal(true)
          }}
          onHomeClick={() => {
            setUserGuess(null)
            setGameState('HOME')
          }}
          onOpenQuests={() => setShowQuestsModal(true)}
          unclaimedQuestsCount={getUnclaimedCount(questsData)}
        />
      )}

      {/* Main Game Screen Viewport */}
      <main className="flex-1 flex flex-col relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          {gameState === 'HOME' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full flex-1"
            >
              <Home
                coins={coins}
                streak={streak}
                wins={wins}
                losses={losses}
                onStartMatch={() => {
                  setUserGuess(null)
                  setGameState('MATCHMAKING')
                }}
                onOpenLeaderboard={() => setGameState('LEADERBOARD')}
                showSettings={showSettingsModal}
                onCloseSettings={() => setShowSettingsModal(false)}
                onOpenQuests={() => setShowQuestsModal(true)}
                unclaimedQuestsCount={getUnclaimedCount(questsData)}
                loginStreak={questsData.loginStreak}
              />
            </motion.div>
          )}

          {gameState === 'MATCHMAKING' && (
            <motion.div
              key="matchmaking"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.25 }}
              className="w-full flex-1"
            >
              <Matchmaking onCancel={() => setGameState('HOME')} />
            </motion.div>
          )}

          {gameState === 'CHAT' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="w-full flex-1 flex flex-col min-h-screen"
            >
              <Chat
                messages={chatMessages}
                timeLeft={chatTimeLeft}
                onSendMessage={handleSendMessage}
                isExtended={isExtendedChat}
                freeExtendedMessagesLeft={freeExtendedMessagesLeft}
                coins={coins}
                onEndExtendedChat={() => setGameState('GUESS')}
                opponentTyping={opponentTyping}
                isOpponentFirstTurn={isOpponentFirstTurn}
                onForfeitMatch={handleForfeitMatch}
                onWatchAdForCoins={handleRecordAdWatched}
              />
            </motion.div>
          )}

          {gameState === 'GUESS' && (
            <motion.div
              key="guess"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.08 }}
              transition={{ duration: 0.25 }}
              className="w-full flex-1"
            >
              <Guess
                onGuess={handleGuess}
                onExtendChat={handleExtendChat}
                coins={coins}
                userGuess={userGuess}
                opponent={opponent}
                streak={streak}
                coinAnimAmount={coinAnimAmount}
                onPlayAgain={() => {
                  setUserGuess(null)
                  setGameState('MATCHMAKING')
                }}
                onHome={() => {
                  setUserGuess(null)
                  setGameState('HOME')
                }}
              />
            </motion.div>
          )}

          {gameState === 'LEADERBOARD' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="w-full flex-1"
            >
              <Leaderboard
                onBack={() => setGameState('HOME')}
                userCoins={coins}
                userStreak={streak}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Daily Quests, 7-Day Login Streak & 12h Sponsor Ad Modal */}
      <DailyQuestsModal
        isOpen={showQuestsModal}
        onClose={() => setShowQuestsModal(false)}
        questsData={questsData}
        onClaimQuest={handleClaimQuest}
        onClaimLogin={handleClaimLogin}
        onClaimAllBonus={handleClaimAllBonus}
        onWatchAd={handleRecordAdWatched}
        onStartMatch={() => {
          setShowQuestsModal(false)
          setUserGuess(null)
          setGameState('MATCHMAKING')
        }}
      />
    </div>
  )
}
