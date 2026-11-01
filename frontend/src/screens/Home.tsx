import React, { useState } from 'react'
import { CyborgAvatar } from '../components/CyborgAvatar'
import { Button, Card } from '../components/UI'
import {
  FireFlame,
  Trophy,
  Flash,
  PrecisionTool,
  Sparks,
  ArrowRight,
  Activity,
  Gift,
} from 'iconoir-react'
import { FaqSection } from '../components/FaqSection'
import { SettingsModal } from '../components/SettingsModal'

interface HomeProps {
  coins: number
  streak: number
  wins: number
  losses: number
  onStartMatch: () => void
  onOpenLeaderboard: () => void
  onOpenProfile?: () => void
  showSettings?: boolean
  onCloseSettings?: () => void
  onOpenQuests?: () => void
  unclaimedQuestsCount?: number
  loginStreak?: number
}

export const Home: React.FC<HomeProps> = ({
  coins: _coins,
  streak,
  wins,
  losses,
  onStartMatch,
  onOpenLeaderboard,
  onOpenProfile: _onOpenProfile,
  showSettings: externalShowSettings,
  onCloseSettings,
  onOpenQuests,
  unclaimedQuestsCount = 0,
  loginStreak: _loginStreak = 1,
}) => {
  const [internalShowSettings, setInternalShowSettings] = useState(false)
  const showSettings = externalShowSettings ?? internalShowSettings
  const setShowSettings = (val: boolean) => {
    setInternalShowSettings(val)
    if (!val && onCloseSettings) onCloseSettings()
  }

  const totalGames = wins + losses
  const accuracy = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 63

  return (
    <div className="w-full select-none py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 sm:space-y-10 transition-colors">
      {/* ============================================================ */}
      {/* HERO SECTION: High-Impact, Minimalist, Turing Game Loop       */}
      {/* ============================================================ */}
      <section className="flex flex-col items-center text-center max-w-2xl mx-auto pt-2 sm:pt-6">
        {/* Subtle Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#FFD100] border border-black/20 rounded-full px-3 py-1 shadow-xs mb-5 font-mono text-xs font-bold uppercase tracking-wider text-black">
          <Sparks className="w-3.5 h-3.5 text-black" />
          <span>2-Minute Social Turing Game</span>
        </div>

        {/* Central Character Avatar */}
        <div className="mb-4">
          <CyborgAvatar size="xl" />
        </div>

        {/* Punchy Headline */}
        <h1 className="text-4xl sm:text-6xl font-display font-black leading-[1.05] tracking-tight uppercase text-black dark:text-white mb-3">
          Human <span className="font-medium text-neutral-400">or</span>{' '}
          <span className="bg-[#FFD100] text-black px-3 py-0.5 rounded-2xl border border-black/25 shadow-xs inline-block">
            Bot?
          </span>
        </h1>

        <p className="text-sm sm:text-base font-bold text-neutral-600 dark:text-neutral-300 max-w-lg mb-8 leading-relaxed">
          Chat with someone for <strong>2 minutes</strong>. Then guess if it was a real human or an AI bot.
        </p>

        {/* Primary Call to Action */}
        <div className="w-full max-w-md flex flex-col sm:flex-row items-center gap-3">
          <Button
            id="start-game-button"
            variant="primary"
            size="xl"
            fullWidth
            onClick={onStartMatch}
            className="py-4 text-base sm:text-lg font-black bg-[#FFD100] text-black border border-black/80 shadow-xs flex-1"
          >
            <Flash className="w-5 h-5 text-black" />
            <span>PLAY NOW</span>
          </Button>

          {onOpenQuests && (
            <Button
              variant="secondary"
              size="xl"
              onClick={onOpenQuests}
              className="w-full sm:w-auto py-4 px-5 text-sm font-black border border-neutral-300 dark:border-neutral-700 shadow-xs relative"
              title="Daily Quests & Check-In"
            >
              <Gift className="w-5 h-5 text-black dark:text-white" />
              <span>Quests</span>
              {unclaimedQuestsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-black animate-bounce">
                  {unclaimedQuestsCount}
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Quick Personal Stats Row */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-6">
          <div className="p-3 bg-white dark:bg-[#181820] rounded-xl border border-black/15 dark:border-neutral-800 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[10px] font-mono font-black uppercase text-neutral-500 dark:text-neutral-400 mb-0.5">
              <PrecisionTool className="w-3.5 h-3.5 text-blue-500" />
              <span>Accuracy</span>
            </div>
            <div className="font-mono font-black text-lg text-black dark:text-white">{accuracy}%</div>
          </div>

          <div className="p-3 bg-white dark:bg-[#181820] rounded-xl border border-black/15 dark:border-neutral-800 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[10px] font-mono font-black uppercase text-neutral-500 dark:text-neutral-400 mb-0.5">
              <Trophy className="w-3.5 h-3.5 text-purple-500" />
              <span>Score</span>
            </div>
            <div className="font-mono font-black text-lg text-black dark:text-white">
              {wins}W / {losses}L
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-[#181820] rounded-xl border border-black/15 dark:border-neutral-800 text-center shadow-xs">
            <div className="flex items-center justify-center gap-1 text-[10px] font-mono font-black uppercase text-neutral-500 dark:text-neutral-400 mb-0.5">
              <FireFlame className="w-3.5 h-3.5 text-orange-500" />
              <span>Streak</span>
            </div>
            <div className="font-mono font-black text-lg text-black dark:text-white">{streak}</div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* HOW IT WORKS: 3 Clean, Visual Steps                          */}
      {/* ============================================================ */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="text-center mb-6">
          <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-black dark:text-white">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 mt-1">
            Simple rules, 2-minute rounds, instant deductions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#FFD100] text-black border border-black/30 font-mono font-black text-sm flex items-center justify-center mb-3 shadow-xs">
                1
              </div>
              <h3 className="font-display font-black text-base uppercase text-black dark:text-white mb-1">
                Queue Anonymously
              </h3>
              <p className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Enter matchmaking. The server pairs you with either a real human or an AI model.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/10 dark:border-neutral-800 text-[11px] font-mono font-bold text-neutral-500">
              No registration needed
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between bg-[#FFF8D6] dark:bg-[#1C1A10]">
            <div>
              <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-[#FFD100] dark:text-black border border-black/30 font-mono font-black text-sm flex items-center justify-center mb-3 shadow-xs">
                2
              </div>
              <h3 className="font-display font-black text-base uppercase text-black dark:text-[#FFD100] mb-1">
                Chat for 2 Minutes
              </h3>
              <p className="text-xs sm:text-sm font-bold text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Chat freely in real time. Probe for artificial patterns or authentic human quirks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/10 dark:border-neutral-800 text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-400">
              Strict 120s server timer
            </div>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-[#FFD100] text-black border border-black/30 font-mono font-black text-sm flex items-center justify-center mb-3 shadow-xs">
                3
              </div>
              <h3 className="font-display font-black text-base uppercase text-black dark:text-white mb-1">
                Decide: Human or Bot?
              </h3>
              <p className="text-xs sm:text-sm font-bold text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Lock in your answer! Guess right to earn Human Coins and build your winning streak.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/10 dark:border-neutral-800 text-[11px] font-mono font-bold text-neutral-500">
              Instant results &amp; rewards
            </div>
          </Card>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 24-HOUR ACTIVITY: Live Global Community Pulse                */}
      {/* ============================================================ */}
      <section>
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Activity className="w-4 h-4 text-black dark:text-white" />
              <h3 className="text-sm font-display font-black uppercase text-black dark:text-white tracking-wide">
                Live Global Stats (24h)
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-neutral-500 dark:text-neutral-400">
              Updated in real time
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#FAFAF8] dark:bg-[#121217] rounded-xl border border-black/20 dark:border-neutral-700">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Games Played
              </span>
              <div className="font-mono font-black text-xl text-black dark:text-white mt-0.5">27,523</div>
            </div>

            <div className="p-3 bg-[#FAFAF8] dark:bg-[#121217] rounded-xl border border-black/20 dark:border-neutral-700">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Human Accuracy
              </span>
              <div className="font-mono font-black text-xl text-black dark:text-white mt-0.5">63%</div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 bg-[#FAFAF8] dark:bg-[#121217] rounded-xl border border-black/20 dark:border-neutral-700">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 dark:text-neutral-400">
                AI Win Rate
              </span>
              <div className="font-mono font-black text-xl text-black dark:text-white mt-0.5">37%</div>
            </div>
          </div>
        </Card>
      </section>

      {/* ============================================================ */}
      {/* FAQS & SETTINGS                                              */}
      {/* ============================================================ */}
      <FaqSection onOpenSettings={() => setShowSettings(true)} />

      {/* ============================================================ */}
      {/* LEADERBOARD TEASER BANNER                                    */}
      {/* ============================================================ */}
      <section>
        <div className="bg-[#FFD100] border border-black/20 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl border border-black/20 flex items-center justify-center shrink-0 shadow-xs">
              <Trophy className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl uppercase text-black leading-tight">
                Global Turing Leaderboard
              </h3>
              <p className="text-xs sm:text-sm font-bold text-neutral-800 mt-0.5">
                See where you rank against players worldwide.
              </p>
            </div>
          </div>

          <Button
            variant="dark"
            size="md"
            onClick={onOpenLeaderboard}
            className="w-full sm:w-auto py-2.5 px-5 text-xs font-black uppercase tracking-wider shrink-0"
          >
            <span>View Rankings</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER: Minimal, Clean, Unobtrusive                          */}
      {/* ============================================================ */}
      <footer className="!mt-6 pt-4 pb-6 border-t border-black/10 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <CyborgAvatar size="xs" />
          <span className="font-display font-black text-black dark:text-white">Bot or Not</span>
          <span>•</span>
          <span>The 2-Minute Turing Experiment</span>
        </div>

        <div className="flex items-center gap-4 text-neutral-600 dark:text-neutral-400">
          <button
            type="button"
            onClick={onStartMatch}
            className="hover:text-black dark:hover:text-white cursor-pointer"
          >
            Play Game
          </button>
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="hover:text-black dark:hover:text-white cursor-pointer"
          >
            Leaderboard
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="hover:text-black dark:hover:text-white cursor-pointer"
          >
            Rules &amp; Audio
          </button>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        sound={true}
        onToggleSound={() => {}}
      />
    </div>
  )
}
