import React, { useState } from 'react'
import { Button, Card } from '../components/UI'
import { AdSlot } from '../components/AdSlot'
import { CoinIcon } from '../components/CoinIcon'
import { ArrowLeft, Trophy, Flame, Medal, Crown } from 'lucide-react'
import { motion } from 'framer-motion'

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

  const rawData = tab === 'coins' ? [...MOCK_LEADERBOARD_COINS] : [...MOCK_LEADERBOARD_STREAK]
  const userScore = tab === 'coins' ? userCoins : userStreak

  const allPlayers = [
    ...rawData,
    { id: 999, name: 'You', score: userScore, isUser: true },
  ].sort((a, b) => b.score - a.score)

  const top1 = allPlayers[0]
  const top2 = allPlayers[1]
  const top3 = allPlayers[2]

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col flex-1 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBack}
            className="p-2 rounded-xl border-3 shadow-[3px_3px_0px_0px_#000]"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight flex items-center gap-2">
            <Trophy className="w-7 h-7 text-[#FFD100] fill-[#FFD100]" />
            Global Leaderboards
          </h1>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-black p-1 rounded-2xl border-2 border-black">
          <button
            onClick={() => setTab('coins')}
            className={`px-3 py-1.5 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              tab === 'coins'
                ? 'bg-[#FFD100] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <CoinIcon size="xs" />
            Coins
          </button>
          <button
            onClick={() => setTab('streak')}
            className={`px-3 py-1.5 rounded-xl font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              tab === 'streak'
                ? 'bg-[#FFD100] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Streaks
          </button>
        </div>
      </div>

      {/* Top 3 Podium (PC & Tablet Layout) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 items-end">
        {/* 2nd Place */}
        {top2 && (
          <div className="bg-white border-3 border-black rounded-3xl p-3 sm:p-4 text-center shadow-[4px_4px_0px_0px_#000]">
            <div className="w-9 h-9 sm:w-11 sm:h-11 mx-auto bg-neutral-100 rounded-2xl border-2 border-black flex items-center justify-center font-mono font-black text-sm mb-1.5 shadow-[2px_2px_0px_0px_#000]">
              🥈
            </div>
            <div className="font-display font-black text-xs sm:text-sm text-black truncate">
              {top2.name}
            </div>
            <div className="font-mono font-black text-sm sm:text-base text-neutral-800 mt-0.5">
              {top2.score.toLocaleString()} {tab === 'coins' ? '🪙' : '🔥'}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">2nd</span>
          </div>
        )}

        {/* 1st Place (Center Podium with Gold Highlight) */}
        {top1 && (
          <div className="bg-[#FFD100] border-4 border-black rounded-3xl p-4 sm:p-5 text-center shadow-[6px_6px_0px_0px_#000] -translate-y-2">
            <div className="w-11 h-11 sm:w-14 sm:h-14 mx-auto bg-white rounded-2xl border-3 border-black flex items-center justify-center font-mono font-black text-xl mb-1.5 shadow-[3px_3px_0px_0px_#000]">
              <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-[#FFD100] fill-[#FFD100]" />
            </div>
            <div className="font-display font-black text-sm sm:text-base text-black truncate">
              {top1.name}
            </div>
            <div className="font-mono font-black text-base sm:text-lg text-black mt-0.5">
              {top1.score.toLocaleString()} {tab === 'coins' ? '🪙' : '🔥'}
            </div>
            <span className="text-[10px] font-mono font-black uppercase text-black bg-white px-2 py-0.5 rounded-full border border-black inline-block mt-1">
              Champion
            </span>
          </div>
        )}

        {/* 3rd Place */}
        {top3 && (
          <div className="bg-white border-3 border-black rounded-3xl p-3 sm:p-4 text-center shadow-[4px_4px_0px_0px_#000]">
            <div className="w-9 h-9 sm:w-11 sm:h-11 mx-auto bg-amber-50 rounded-2xl border-2 border-black flex items-center justify-center font-mono font-black text-sm mb-1.5 shadow-[2px_2px_0px_0px_#000]">
              🥉
            </div>
            <div className="font-display font-black text-xs sm:text-sm text-black truncate">
              {top3.name}
            </div>
            <div className="font-mono font-black text-sm sm:text-base text-neutral-800 mt-0.5">
              {top3.score.toLocaleString()} {tab === 'coins' ? '🪙' : '🔥'}
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">3rd</span>
          </div>
        )}
      </div>

      {/* Full Leaderboard Table Card */}
      <Card className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 bg-white border-4 shadow-[6px_6px_0px_0px_#000] mb-6 min-h-[280px]">
        {allPlayers.map((player, index) => {
          const isTop3 = index < 3
          const medalColors = [
            'text-[#FFD100] fill-[#FFD100]',
            'text-neutral-400 fill-neutral-400',
            'text-amber-600 fill-amber-600',
          ]

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`flex items-center justify-between p-3.5 rounded-2xl border-3 border-black font-medium text-sm sm:text-base ${
                player.isUser
                  ? 'bg-[#FFD100] font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-neutral-50 hover:bg-neutral-100 transition-colors'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-8 text-center font-mono font-black text-base sm:text-lg">
                  {isTop3 ? (
                    <Medal className={`w-6 h-6 mx-auto ${medalColors[index]}`} />
                  ) : (
                    `#${index + 1}`
                  )}
                </div>
                <span className="truncate max-w-[200px] sm:max-w-xs font-bold">
                  {player.name} {player.isUser && '(You)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono font-bold bg-white px-3 py-1.5 rounded-xl border-2 border-black text-xs sm:text-sm shadow-[1px_1px_0px_0px_#000]">
                {tab === 'coins' ? (
                  <CoinIcon size="xs" />
                ) : (
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                )}
                <span>{player.score.toLocaleString()}</span>
              </div>
            </motion.div>
          )
        })}
      </Card>

      {/* Ad Placement at bottom */}
      <div className="mt-auto">
        <div className="hidden sm:block">
          <AdSlot format="leaderboard" id="leaderboard-desktop-ad" />
        </div>
        <div className="sm:hidden">
          <AdSlot format="mobile_banner" id="leaderboard-mobile-ad" />
        </div>
      </div>
    </div>
  )
}
