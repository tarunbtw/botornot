import React, { useState, useEffect } from 'react'
import { Button } from '../components/UI'
import { CoinIcon } from '../components/CoinIcon'
import { ArrowLeft, Trophy, FireFlame, Crown } from 'iconoir-react'
import { fetchLeaderboard, type LeaderboardPlayer } from '../lib/api'

interface LeaderboardProps {
  onBack: () => void
  userCoins: number
  userStreak: number
}

const MOCK_LEADERBOARD_COINS = [
  { id: 1, name: 'TuringChamp_99', score: 2840, isUser: false },
  { id: 2, name: 'CyberIntuition', score: 2490, isUser: false },
  { id: 3, name: 'Socrates42', score: 2150, isUser: false },
  { id: 4, name: 'PixelWhisperer', score: 1980, isUser: false },
  { id: 5, name: 'Synthetik', score: 1820, isUser: false },
  { id: 6, name: 'HumanAfterAll', score: 1450, isUser: false },
  { id: 7, name: 'GhostInShell', score: 1120, isUser: false },
  { id: 8, name: 'Alan_T_1950', score: 980, isUser: false },
]

const MOCK_LEADERBOARD_STREAK = [
  { id: 1, name: 'CyberIntuition', score: 24, isUser: false },
  { id: 2, name: 'TuringChamp_99', score: 19, isUser: false },
  { id: 3, name: 'MindReader', score: 15, isUser: false },
  { id: 4, name: 'Socrates42', score: 12, isUser: false },
  { id: 5, name: 'PixelWhisperer', score: 9, isUser: false },
  { id: 6, name: 'VibeChecker', score: 7, isUser: false },
  { id: 7, name: 'LuckyGuesser', score: 5, isUser: false },
  { id: 8, name: 'NeoMatrix', score: 4, isUser: false },
]

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack, userCoins, userStreak }) => {
  const [tab, setTab] = useState<'coins' | 'streak'>('coins')
  const [livePlayers, setLivePlayers] = useState<LeaderboardPlayer[]>([])

  useEffect(() => {
    fetchLeaderboard()
      .then((players) => {
        if (players && players.length > 0) {
          setLivePlayers(players)
        }
      })
      .catch(() => {})
  }, [])

  const rawData =
    livePlayers.length >= 3
      ? livePlayers.map((p, idx) => ({
          id: idx + 1,
          name: p.name,
          score: tab === 'coins' ? p.coins : p.correctGuesses,
          isUser: false,
        }))
      : tab === 'coins'
      ? [...MOCK_LEADERBOARD_COINS]
      : [...MOCK_LEADERBOARD_STREAK]

  const userScore = tab === 'coins' ? userCoins : userStreak

  const allPlayers = [
    ...rawData,
    { id: 999, name: 'You', score: userScore, isUser: true },
  ].sort((a, b) => b.score - a.score)

  const top1 = allPlayers[0]
  const top2 = allPlayers[1]
  const top3 = allPlayers[2]

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col flex-1 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBack}
            className="p-2 rounded-xl shadow-xs"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight flex items-center gap-2 text-black dark:text-white">
            <Trophy className="w-6 h-6 text-[#FFD100] fill-[#FFD100]" />
            Leaderboard
          </h1>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-neutral-100 dark:bg-[#1E1E26] p-1 rounded-xl border border-black/15 dark:border-neutral-700">
          <button
            onClick={() => setTab('coins')}
            className={`px-3 py-1 rounded-lg font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              tab === 'coins'
                ? 'bg-[#FFD100] text-black border border-black/20 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <CoinIcon size="xs" />
            Coins
          </button>
          <button
            onClick={() => setTab('streak')}
            className={`px-3 py-1 rounded-lg font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              tab === 'streak'
                ? 'bg-[#FFD100] text-black border border-black/20 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white'
            }`}
          >
            <FireFlame className="w-3.5 h-3.5" />
            Streaks
          </button>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3 mb-8 items-end">
        {/* 2nd Place */}
        <div className="bg-white dark:bg-[#181820] border border-black/15 dark:border-neutral-800 rounded-2xl p-3 sm:p-4 text-center shadow-xs flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-700 border border-black/20 dark:border-neutral-600 font-mono font-black text-xs flex items-center justify-center mb-2 text-black dark:text-white">
            2
          </div>
          <div className="font-display font-black text-xs sm:text-sm text-black dark:text-white truncate max-w-full">
            {top2?.name}
          </div>
          <div className="font-mono font-black text-sm sm:text-base text-neutral-700 dark:text-neutral-300 mt-1">
            {top2?.score}
          </div>
        </div>

        {/* 1st Place */}
        <div className="bg-[#FFD100] border border-black/20 rounded-2xl p-4 sm:p-5 text-center shadow-xs flex flex-col items-center -translate-y-2">
          <Crown className="w-5 h-5 text-amber-600 mb-1" />
          <div className="w-8 h-8 rounded-full bg-white border border-black/20 font-mono font-black text-sm flex items-center justify-center mb-2 shadow-xs text-black">
            1
          </div>
          <div className="font-display font-black text-sm sm:text-base text-black truncate max-w-full">
            {top1?.name}
          </div>
          <div className="font-mono font-black text-base sm:text-lg text-black mt-1">
            {top1?.score}
          </div>
        </div>

        {/* 3rd Place */}
        <div className="bg-white dark:bg-[#181820] border border-black/15 dark:border-neutral-800 rounded-2xl p-3 sm:p-4 text-center shadow-xs flex flex-col items-center">
          <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-black/20 dark:border-neutral-600 font-mono font-black text-xs flex items-center justify-center mb-2 text-amber-800 dark:text-amber-400">
            3
          </div>
          <div className="font-display font-black text-xs sm:text-sm text-black dark:text-white truncate max-w-full">
            {top3?.name}
          </div>
          <div className="font-mono font-black text-sm sm:text-base text-neutral-700 dark:text-neutral-300 mt-1">
            {top3?.score}
          </div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="bg-white dark:bg-[#181820] border border-black/15 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="divide-y divide-black/10 dark:divide-neutral-800">
          {allPlayers.map((player, idx) => (
            <div
              key={player.id}
              className={`flex items-center justify-between px-4 sm:px-6 py-3.5 transition-colors ${
                player.isUser
                  ? 'bg-[#FFF8D6] dark:bg-[#252317] font-black'
                  : 'hover:bg-neutral-50 dark:hover:bg-[#1E1E28]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-black text-neutral-500 dark:text-neutral-400 w-5">
                  #{idx + 1}
                </span>
                <span className="font-display font-black text-sm sm:text-base text-black dark:text-white flex items-center gap-2">
                  {player.name}
                  {player.isUser && (
                    <span className="bg-black text-[#FFD100] text-[10px] px-2 py-0.5 rounded font-mono uppercase">
                      You
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono font-black text-sm sm:text-base text-black dark:text-white">
                <span>{player.score}</span>
                {tab === 'coins' ? (
                  <CoinIcon size="xs" />
                ) : (
                  <FireFlame className="w-3.5 h-3.5 text-orange-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
