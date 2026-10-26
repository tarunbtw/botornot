import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, LogIn } from 'lucide-react'
import { gameSocket, type ServerEvent } from '../lib/game-socket.js'
import { fetchMe, createGuestSession } from '../lib/api.js'
import { authClient } from '../lib/auth-client.js'
import { sounds } from '../lib/sound.js'

export default function Search() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'loading' | 'auth_required' | 'searching'>('loading')
  const [searchPercent, setSearchPercent] = useState(14)

  const startMatchmaking = () => {
    setPhase('searching')
    setSearchPercent(14)
    gameSocket.connect()
    gameSocket.joinQueue()
  }

  // Smooth search percentage counter during matchmaking queue
  useEffect(() => {
    if (phase !== 'searching') return
    const interval = setInterval(() => {
      setSearchPercent((prev) => {
        if (prev >= 96) return prev
        const increment = Math.floor(Math.random() * 8) + 4
        return Math.min(96, prev + increment)
      })
    }, 400)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    let mounted = true

    // Check player auth status; auto-create guest session if not signed in
    fetchMe()
      .then(async (me) => {
        if (!mounted) return
        if (!me) {
          const guestOk = await createGuestSession()
          if (guestOk && mounted) {
            startMatchmaking()
          } else if (mounted) {
            setPhase('auth_required')
          }
        } else {
          startMatchmaking()
        }
      })
      .catch(async () => {
        if (!mounted) return
        const guestOk = await createGuestSession()
        if (guestOk && mounted) {
          startMatchmaking()
        } else if (mounted) {
          setPhase('auth_required')
        }
      })

    const unsubscribe = gameSocket.subscribe((event: ServerEvent) => {
      if (event.type === 'error') {
        if (event.code === 'UNAUTHORIZED') {
          setPhase('auth_required')
          return
        }
        if (event.code === 'ACTION_ERROR' && event.message.includes('ALREADY_IN_ACTIVE_GAME')) {
          navigate('/chat', { replace: true })
          return
        }
      }

      switch (event.type) {
        case 'game.matched': {
          sounds.matchFound()
          setSearchPercent(100)
          break
        }

        case 'game.started': {
          setSearchPercent(100)
          // Smoothly transition directly to the dedicated chat page with gameId in URL
          navigate(`/chat/${event.payload.gameId}`, {
            state: {
              gameId: event.payload.gameId,
              endsAt: event.payload.endsAt,
              isFirstSender: event.payload.isFirstSender,
            },
          })
          break
        }
      }
    })

    return () => {
      mounted = false
      unsubscribe()
      gameSocket.cancelQueue()
    }
  }, [navigate])

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.href,
      })
    } catch (err) {
      console.error('Google sign-in error:', err)
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-[#f1eee7] text-[#232323] flex flex-col justify-center items-center px-4 py-12 select-none">
      <main className="w-full max-w-3xl flex items-center justify-center">
        {/* PHASE 0: Loading Auth Check */}
        {phase === 'loading' && (
          <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="w-12 h-12 rounded-full border-4 border-[#22c55e] border-t-transparent animate-spin mb-4" />
            <p className="font-pixel text-xs sm:text-sm text-[#232323] font-bold tracking-wider">
              CONNECTING TO TURING SERVER...
            </p>
          </div>
        )}

        {/* PHASE 1: Auth Required */}
        {phase === 'auth_required' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md neo-card p-6 sm:p-8 text-center bg-[#f1eee7] border-2 border-[#232323] shadow-[4px_4px_0px_#232323]"
          >
            <div className="w-14 h-14 rounded-full bg-[#22c55e]/20 border-2 border-[#232323] text-[#232323] flex items-center justify-center mx-auto mb-4">
              <User className="w-7 h-7 text-[#22c55e]" />
            </div>
            <h2 className="font-pixel text-xl sm:text-2xl font-bold text-[#232323] mb-2">
              SIGN IN REQUIRED
            </h2>
            <p className="font-pixel text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Sign in with Google to enter matchmaking rounds, earn Human Coins, and climb the leaderboard.
            </p>

            <div className="space-y-3.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full neo-btn neo-btn-green py-3.5 px-4 font-pixel text-xs sm:text-sm font-bold text-[#232323] rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>SIGN IN WITH GOOGLE</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-xs font-pixel text-slate-500 hover:text-[#232323] underline cursor-pointer mt-2 inline-block"
              >
                Return to Home
              </button>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: SEARCHING (Matches Reference Layout with Normal Cream Background) */}
        {phase === 'searching' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center w-full max-w-xl mx-auto py-6"
          >
            {/* Circular Segmented Radar Spinner */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6">
              <div className="w-full h-full animate-spin">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1.5 h-4 sm:w-2 sm:h-5 bg-[#22c55e] rounded-xs top-0 left-1/2 -ml-1 origin-[50%_200%]"
                    style={{
                      transform: `rotate(${i * 30}deg)`,
                      opacity: (i + 1) / 12,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Main Search Headline */}
            <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl font-bold text-[#232323] mb-3 tracking-tight">
              Searching for Humans or Robots...
            </h1>

            {/* Subtitle */}
            <p className="font-pixel text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6 font-bold">
              This will take just a few seconds.
              <br />
              Stay alert and keep this window open!
            </p>

            {/* Magenta Transmission Status Text */}
            <div className="mb-8">
              <span className="font-pixel text-xs sm:text-sm font-bold text-[#c026d3] tracking-wide animate-pulse">
                Transmitting Search Signal
              </span>
            </div>

            {/* Neobrutalist Progress Meter Container */}
            <div className="w-full max-w-md mx-auto mb-4">
              <div className="relative w-full h-16 sm:h-20 bg-[#e5e1d7] border-2 border-[#232323] rounded-lg overflow-hidden flex items-stretch shadow-[3px_3px_0px_#232323]">
                {/* Green Progress Fill Block with Percentage Text inside */}
                <motion.div
                  className="bg-[#22c55e] border-r-2 border-[#232323] flex items-center justify-center font-pixel font-black text-xl sm:text-2xl text-[#232323] transition-all duration-300"
                  style={{ width: `${searchPercent}%` }}
                >
                  <span className="px-2">{searchPercent}%</span>
                </motion.div>

                {/* Empty Track Underline / Line */}
                <div className="flex-1 flex items-end">
                  <div className="w-full h-0.5 bg-[#232323]" />
                </div>
              </div>

              {/* Progress Legend: ■ AI    □ Humans */}
              <div className="flex items-center justify-between text-xs font-pixel font-bold text-[#232323] px-1 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#22c55e] border border-[#232323] inline-block" />
                  <span>AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#f1eee7] border border-[#232323] inline-block" />
                  <span>Humans</span>
                </div>
              </div>
            </div>

            {/* Cancel Matchmaking Button */}
            <div className="mt-8">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="neo-btn px-8 py-3 rounded-xl bg-[#f1eee7] hover:bg-rose-500 hover:text-white text-[#232323] border-2 border-[#232323] shadow-[3px_3px_0px_#232323] font-pixel text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                CANCEL SEARCH
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
