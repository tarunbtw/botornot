import { useState, useEffect, useRef } from 'react'
import type { GameState, OpponentType, Message } from './types'
import { Navbar } from './components/Navbar'
import { fetchAIResponse, resetMatchPersona } from './lib/ai-client'
import { Home } from './screens/Home'
import { Matchmaking } from './screens/Matchmaking'
import { Chat } from './screens/Chat'
import { Guess } from './screens/Guess'
import { Leaderboard } from './screens/Leaderboard'
import { Profile } from './screens/Profile'
import { Quests } from './screens/Quests'
import { AnimatePresence, motion } from 'framer-motion'
import { gameSocket, type ServerEvent } from './lib/game-socket.js'
import {
  fetchMe,
  fetchStats,
  createGuestSession,
  fetchQuests,
  claimServerQuest,
  type UserProfileResponse,
} from './lib/api.js'
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
  const [user, setUser] = useState<UserProfileResponse | null>(null)
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
  const [isVerdictPending, setIsVerdictPending] = useState<boolean>(false)
  const [verdictInfo, setVerdictInfo] = useState<{
    isCorrect: boolean
    actualOpponent: OpponentType
    reward: number
  } | null>(null)
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
  const [questsData, setQuestsData] = useState<DailyQuestsData>(() => loadQuestsData())
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('botornot_theme')
    if (saved === 'dark' || saved === 'light') return saved
    return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    localStorage.setItem('botornot_theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

  // Sync daily quests whenever day changes or mounts
  useEffect(() => {
    setQuestsData(loadQuestsData())
  }, [])

  const handleClaimQuest = async (questId: string, reward: number) => {
    // 1. Authoritative Server Claim
    const res = await claimServerQuest(questId)
    if (res && res.success) {
      handleCoinsChange(res.balance)
      playReward()
      setQuestsData((prev) => ({
        ...prev,
        claimedQuestIds: res.quests.claimedQuestIds,
        matchesPlayed: res.quests.matchesPlayed,
        correctGuesses: res.quests.correctGuesses,
      }))
      return
    }

    // 2. Offline fallback
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

  const handleClaimLogin = async (reward: number) => {
    // 1. Authoritative Server Daily Check-In
    const res = await claimServerQuest('login')
    if (res && res.success) {
      handleCoinsChange(res.balance)
      playReward()
      setQuestsData((prev) => ({
        ...prev,
        loginClaimedToday: true,
        loginStreak: res.quests.loginStreak,
      }))
      return
    }

    // 2. Offline fallback
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

  const handleClaimAllBonus = async (reward: number) => {
    // 1. Authoritative Server Bonus Claim
    const res = await claimServerQuest('bonus')
    if (res && res.success) {
      handleCoinsChange(res.balance)
      playReward()
      setQuestsData((prev) => ({
        ...prev,
        allClaimed: true,
      }))
      return
    }

    // 2. Offline fallback
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
    setIsVerdictPending(false)
    setVerdictInfo(null)
    if (activeBackendGameIdRef.current) {
      try {
        gameSocket.send({
          type: 'game.leave',
          payload: { gameId: activeBackendGameIdRef.current },
        })
      } catch {}
      activeBackendGameIdRef.current = null
    }
    setGameState('HOME')
  }

  // Track active backend game ID if connected to Fastify backend
  const activeBackendGameIdRef = useRef<string | null>(null)

  // Sync user profile & token balance from backend
  useEffect(() => {
    fetchMe().then((me) => {
      if (me) {
        setUser(me)
        if (typeof me.tokenBalance === 'number') {
          setCoins(me.tokenBalance)
        }
      } else {
        createGuestSession().then((guest) => {
          if (guest) {
            setUser(guest)
            if (typeof guest.tokenBalance === 'number') {
              setCoins(guest.tokenBalance)
            }
          }
        }).catch(() => {})
      }
    }).catch(() => {})

    fetchStats().then((st) => {
      if (st && typeof st.tokenBalance === 'number') {
        setCoins(st.tokenBalance)
      }
    }).catch(() => {})

    fetchQuests().then((sq) => {
      if (sq) {
        setQuestsData((prev) => ({
          ...prev,
          loginStreak: sq.loginStreak,
          loginClaimedToday: sq.loginClaimedToday,
          matchesPlayed: sq.matchesPlayed,
          correctGuesses: sq.correctGuesses,
          claimedQuestIds: sq.claimedQuestIds,
          allClaimed: sq.allClaimed,
          adsWatchedToday: sq.adsWatchedToday,
        }))
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

  // --- Persistent GameSocket Lifecycle & Live Protocol Handlers ---
  useEffect(() => {
    gameSocket.connect()

    const unsubscribe = gameSocket.subscribe((event: ServerEvent) => {
      if (event.type === 'connection.ready') {
        if (typeof event.payload.tokenBalance === 'number') {
          setCoins(event.payload.tokenBalance)
        }
      }

      if (event.type === 'game.matched') {
        playMatchFound()
      }

      if (event.type === 'game.started') {
        activeBackendGameIdRef.current = event.payload.gameId
        playMatchFound()
        clearAiTimers()
        setChatMessages([])
        setChatTimeLeft(120)
        setIsExtendedChat(false)
        setFreeExtendedMessagesLeft(0)
        setIsOpponentFirstTurn(!event.payload.isFirstSender)
        setOpponentTyping(false)
        setUserGuess(null)
        setIsVerdictPending(false)
        setVerdictInfo(null)
        setGameState('CHAT')
      }

      if (event.type === 'chat.typing') {
        setOpponentTyping(event.payload.isTyping)
      }

      if (event.type === 'chat.message') {
        if (!event.payload.isSelf) {
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === event.payload.id)) return prev
            return [
              ...prev,
              {
                id: event.payload.id,
                sender: 'opponent',
                text: event.payload.content,
                timestamp: new Date(event.payload.createdAt).getTime(),
              },
            ]
          })
          setIsOpponentFirstTurn(false)
          setOpponentTyping(false)
        }
      }

      if (event.type === 'chat.ai_delta') {
        setOpponentTyping(true)
      }

      if (event.type === 'chat.ai_done') {
        setOpponentTyping(false)
        setChatMessages((prev) => {
          if (prev.some((m) => m.id === event.payload.id)) return prev
          return [
            ...prev,
            {
              id: event.payload.id,
              sender: 'opponent',
              text: event.payload.content,
              timestamp: Date.now(),
            },
          ]
        })
        setIsOpponentFirstTurn(false)
      }

      if (event.type === 'session.ended' || event.type === 'guess.request') {
        setGameState('GUESS')
      }

      if (event.type === 'guess.result') {
        setOpponent(event.payload.actualOpponentType)
        setCoins(event.payload.balanceAfter)
        setIsVerdictPending(false)
        setVerdictInfo({
          isCorrect: event.payload.isCorrect,
          actualOpponent: event.payload.actualOpponentType,
          reward: event.payload.reward,
        })
        if (event.payload.isCorrect) {
          setStreak((prev) => prev + 1)
          setWins((prev) => prev + 1)
        } else {
          setStreak(0)
          setLosses((prev) => prev + 1)
        }

        // Update quests on authoritative backend result
        setQuestsData((prev) => {
          const updated = {
            ...prev,
            matchesPlayed: prev.matchesPlayed + 1,
            correctGuesses: event.payload.isCorrect ? prev.correctGuesses + 1 : prev.correctGuesses,
          }
          saveQuestsData(updated)
          return updated
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // --- Matchmaking Queue Trigger with Resilient Fallback ---
  useEffect(() => {
    if (gameState !== 'MATCHMAKING') return

    activeBackendGameIdRef.current = null
    gameSocket.joinQueue()

    // Safety timeout: if backend does not match after 10s, start local offline simulation
    const fallbackTimer = setTimeout(() => {
      if (gameState === 'MATCHMAKING' && !activeBackendGameIdRef.current) {
        console.warn('[Matchmaking] Backend queue timeout; starting offline simulation')
        playMatchFound()
        clearAiTimers()
        const isAI = Math.random() > 0.45
        const opponentStarts = Math.random() > 0.5
        setIsOpponentFirstTurn(opponentStarts)
        setOpponent(isAI ? 'AI' : 'HUMAN')
        setChatMessages([])
        setChatTimeLeft(120)
        setIsExtendedChat(false)
        setFreeExtendedMessagesLeft(0)
        setGameState('CHAT')
        resetMatchPersona()

        if (opponentStarts) {
          const thisGen = ++aiGenerationIdRef.current
          const openingTimer = setTimeout(() => {
            if (thisGen !== aiGenerationIdRef.current) return
            triggerAiOpponentReply([])
          }, 1200 + Math.floor(Math.random() * 400))
          aiTimersRef.current.push(openingTimer)
        }
      }
    }, 10000)

    return () => {
      clearTimeout(fallbackTimer)
      if (gameState === 'MATCHMAKING' && !activeBackendGameIdRef.current) {
        gameSocket.cancelQueue()
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

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmed,
      timestamp: Date.now(),
    }

    const updated = [...chatMessages, newMsg]
    setChatMessages(updated)

    // Forward to backend game socket if active game exists
    if (activeBackendGameIdRef.current) {
      try {
        gameSocket.sendMessage(activeBackendGameIdRef.current, trimmed)
      } catch {
        // local fallback
      }
    } else {
      // Opponent replies on their turn only during offline fallback simulation
      triggerAiOpponentReply(updated)
    }
  }

  // --- Handle Verdict Guess ---
  const handleGuess = (guess: OpponentType) => {
    setUserGuess(guess)

    if (activeBackendGameIdRef.current) {
      setIsVerdictPending(true)
      try {
        gameSocket.submitGuess(activeBackendGameIdRef.current, guess)
      } catch {
        // local fallback
      }
    } else {
      const isCorrect = guess === opponent
      setIsVerdictPending(false)
      setVerdictInfo({
        isCorrect,
        actualOpponent: opponent,
        reward: isCorrect ? 10 : 5,
      })

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
  }

  // --- Handle Extend Chat ---
  const handleExtendChat = () => {
    setIsExtendedChat(true)
    setFreeExtendedMessagesLeft(1)
    setChatTimeLeft(300) // add 5 minutes extended
    setGameState('CHAT')
  }

  return (
    <div
      className={`bg-[#FAFAF8] dark:bg-[#0E0E12] text-black dark:text-white flex flex-col font-body selection:bg-black selection:text-[#FFD100] transition-colors duration-200 ${
        gameState === 'CHAT' ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'
      }`}
    >
      {/* Top Navbar in Yellow & White Neo-Brutalist Theme - Hidden during Chat for distractionless experience */}
      {gameState !== 'CHAT' && (
        <Navbar
          coins={coins}
          streak={streak}
          user={user}
          currentPage={gameState}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
          onOpenProfile={() => setGameState('PROFILE')}
          onHomeClick={() => {
            setUserGuess(null)
            setGameState('HOME')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onOpenQuests={() => setGameState('QUESTS')}
          unclaimedQuestsCount={getUnclaimedCount(questsData)}
          isDark={theme === 'dark'}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* Main Game Screen Viewport */}
      <main
        className={`flex-1 flex flex-col relative ${
          gameState === 'CHAT' ? 'h-full max-h-full overflow-hidden' : 'overflow-x-hidden'
        }`}
      >
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
                onOpenProfile={() => setGameState('PROFILE')}
                showSettings={showSettingsModal}
                onCloseSettings={() => setShowSettingsModal(false)}
                onOpenQuests={() => setGameState('QUESTS')}
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
              className="w-full flex-1 flex flex-col h-full max-h-full overflow-hidden"
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
                onTyping={(isTyping) => {
                  if (activeBackendGameIdRef.current) {
                    gameSocket.sendTyping(activeBackendGameIdRef.current, isTyping)
                  }
                }}
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
                  setIsVerdictPending(false)
                  setVerdictInfo(null)
                  setGameState('MATCHMAKING')
                }}
                onHome={() => {
                  setUserGuess(null)
                  setIsVerdictPending(false)
                  setVerdictInfo(null)
                  setGameState('HOME')
                }}
                isVerdictPending={isVerdictPending}
                verdictInfo={verdictInfo}
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

          {gameState === 'PROFILE' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="w-full flex-1"
            >
              <Profile
                onBack={() => setGameState('HOME')}
                user={user}
                onUserUpdate={setUser}
                coins={coins}
                streak={streak}
                wins={wins}
                losses={losses}
                onCoinsChange={handleCoinsChange}
              />
            </motion.div>
          )}

          {gameState === 'QUESTS' && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25 }}
              className="w-full flex-1"
            >
              <Quests
                onBack={() => setGameState('HOME')}
                questsData={questsData}
                onClaimQuest={handleClaimQuest}
                onClaimLogin={handleClaimLogin}
                onClaimAllBonus={handleClaimAllBonus}
                onWatchAd={handleRecordAdWatched}
                onStartMatch={() => {
                  setUserGuess(null)
                  setGameState('MATCHMAKING')
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
