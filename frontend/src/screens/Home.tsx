import React, { useState } from 'react'
import { CyborgAvatar } from '../components/CyborgAvatar'
import { Button, Card } from '../components/UI'
import { AdSlot } from '../components/AdSlot'
import {
  Flame,
  Trophy,
  Zap,
  Target,
  Sparkles,
  Brain,
  X,
  BookOpen,
  ArrowRight,
  Activity,
  Gift,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { isSoundEnabled, setSoundEnabled } from '../lib/audio'
import { FaqSection } from '../components/FaqSection'
import { SettingsModal } from '../components/SettingsModal'

interface HomeProps {
  coins: number
  streak: number
  wins: number
  losses: number
  onStartMatch: () => void
  onOpenLeaderboard: () => void
  showSettings?: boolean
  onCloseSettings?: () => void
  onOpenQuests?: () => void
  unclaimedQuestsCount?: number
  loginStreak?: number
}



const RESEARCH_TOPICS = [
  {
    id: 'turing',
    title: 'The Turing Test: Explained Through Bot or Not',
    read: '4 min read • Analysis',
    summary:
      'In 1950, Alan Turing published "Computing Machinery and Intelligence," introducing what is now known as the Turing Test. Rather than asking "Can machines think?", Turing proposed evaluating whether an interrogator could distinguish a machine from a human through text conversation alone. Our 2-minute round puts this exact philosophical test into practice.',
  },
  {
    id: 'llm',
    title: 'When Large Language Models Pass the Turing Test',
    read: '5 min read • Research',
    summary:
      'Modern LLMs utilize deep transformer architectures capable of producing convincing colloquialisms, emotional nuance, and intentional hesitations. In our live stats, over 37% of players are fooled into believing a bot is human, marking a historic milestone in natural language generation.',
  },
  {
    id: 'history',
    title: 'The Imitation Game: Alan Turing’s 1950 Legacy',
    read: '6 min read • History',
    summary:
      'From wartime Bletchley Park codebreaking to modern computational intelligence, Alan Turing foresaw the day when synthetic conversationalists would become indistinguishable from natural dialogue partners. This platform serves as a public, real-time benchmark of that prediction.',
  },
]

export const Home: React.FC<HomeProps> = ({
  coins: _coins,
  streak,
  wins,
  losses,
  onStartMatch,
  onOpenLeaderboard,
  showSettings: externalShowSettings,
  onCloseSettings,
  onOpenQuests,
  unclaimedQuestsCount = 0,
  loginStreak = 1,
}) => {
  const [internalShowSettings, setInternalShowSettings] = useState(false)
  const showSettings = externalShowSettings ?? internalShowSettings
  const setShowSettings = (val: boolean) => {
    setInternalShowSettings(val)
    if (!val && onCloseSettings) onCloseSettings()
  }
  const [activeArticle, setActiveArticle] = useState<{ title: string; summary: string } | null>(null)
  const [sound, setSound] = useState(isSoundEnabled())

  const toggleSound = () => {
    const next = !sound
    setSound(next)
    setSoundEnabled(next)
  }

  const totalGames = wins + losses
  const accuracy = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 63

  return (
    <div className="w-full select-none">
      {/* ============================================================ */}
      {/* 📱 MOBILE VIEW: The Classic Mobile-First Layout from the App */}
      {/* ============================================================ */}
      <div className="block lg:hidden max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Mobile Hero Header */}
        <div className="flex flex-col items-center text-center pt-2">
          <CyborgAvatar size="lg" className="mb-2" />
          <h1 className="text-4xl font-display font-black leading-[0.9] tracking-tighter uppercase mb-2 drop-shadow-[3px_3px_0px_rgba(255,209,0,1)]">
            Bot
            <br />
            <span className="text-[#FFD100] drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] [-webkit-text-stroke:2px_black]">
              OR Not?
            </span>
          </h1>
          <p className="text-xs font-bold text-neutral-700 max-w-[260px] mx-auto">
            Can you spot the AI in 2 minutes?
          </p>
        </div>

        {/* Quick Match Card (Exact style from mobile design) */}
        <Card className="w-full bg-white flex flex-col items-center gap-3 p-4 relative overflow-hidden border-3 shadow-[4px_4px_0px_0px_#000]">
          <div className="flex items-center gap-3 w-full">
            <div className="w-11 h-11 bg-[#FFD100] rounded-xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
              <Zap className="w-6 h-6 fill-black" />
            </div>
            <div className="text-left">
              <h2 className="text-base font-display font-black leading-tight text-black">Quick Match</h2>
              <p className="text-xs text-neutral-600 font-bold">2-Minute Turing Chat</p>
            </div>
          </div>

          <Button
            variant="dark"
            size="lg"
            fullWidth
            onClick={onStartMatch}
            className="text-base py-3 border-2 shadow-[3px_3px_0px_0px_#000]"
          >
            Play Now
          </Button>
        </Card>

        {/* Mobile Daily Quests & Check-In Widget */}
        {onOpenQuests && (
          <div
            onClick={onOpenQuests}
            className="w-full bg-[#FFF8D6] hover:bg-[#FFE57F] transition-all p-3.5 rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#FFD100] rounded-2xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] shrink-0">
                <Gift className="w-6 h-6 text-black" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-black text-sm text-black uppercase">
                    Daily Quests
                  </span>
                  <span className="font-mono text-[10px] font-black bg-black text-[#FFD100] px-1.5 py-0.5 rounded">
                    Day {loginStreak}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-neutral-700 leading-tight">
                  {unclaimedQuestsCount > 0
                    ? `🎉 ${unclaimedQuestsCount} reward${unclaimedQuestsCount > 1 ? 's' : ''} ready to claim!`
                    : 'Earn up to +75 Coins daily'}
                </p>
              </div>
            </div>

            <Button
              variant={unclaimedQuestsCount > 0 ? 'primary' : 'secondary'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onOpenQuests()
              }}
              className="py-1.5 px-3 text-xs font-black uppercase tracking-wider shrink-0 border-2 shadow-[2px_2px_0px_0px_#000]"
            >
              {unclaimedQuestsCount > 0 ? 'Claim!' : 'View'}
            </Button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <Card className="p-3 flex flex-col items-center justify-center text-center bg-white border-3 shadow-[3px_3px_0px_0px_#000]">
            <div className="w-8 h-8 bg-blue-100 rounded-lg border-2 border-black flex items-center justify-center mb-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Target className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-mono font-black text-xl text-black">{accuracy}%</div>
            <div className="text-[10px] font-black uppercase text-neutral-500">Accuracy</div>
          </Card>

          <Card className="p-3 flex flex-col items-center justify-center text-center bg-white border-3 shadow-[3px_3px_0px_0px_#000]">
            <div className="w-8 h-8 bg-purple-100 rounded-lg border-2 border-black flex items-center justify-center mb-1 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <Trophy className="w-4 h-4 text-purple-600" />
            </div>
            <div className="font-mono font-black text-xl text-black">
              {wins}W / {losses}L
            </div>
            <div className="text-[10px] font-black uppercase text-neutral-500">Win / Loss</div>
          </Card>
        </div>

        {/* View Leaderboard Button */}
        <Button
          variant="secondary"
          size="md"
          fullWidth
          onClick={onOpenLeaderboard}
          className="py-2.5 text-xs font-black uppercase tracking-wider border-3 shadow-[3px_3px_0px_0px_#000]"
        >
          <Trophy className="w-4 h-4 text-[#FFD100] fill-[#FFD100]" />
          View Leaderboards
        </Button>

        {/* What is Bot or Not & Facts on Mobile */}
        <div className="p-4 bg-white rounded-3xl border-3 border-black shadow-[3px_3px_0px_0px_#000] space-y-2.5">
          <h3 className="font-display font-black text-sm uppercase text-black flex items-center gap-2">
            <Brain className="w-4 h-4 text-black" /> What is Bot or Not?
          </h3>
          <p className="text-xs font-bold text-neutral-700 leading-relaxed">
            Chat with a stranger for 2 minutes. Decide if you were talking to an AI or a real human!
          </p>
        </div>

        {/* How It Works on Mobile */}
        <div id="how-it-works-mobile" className="p-4 bg-[#FFD100]/25 rounded-3xl border-3 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
          <h3 className="font-display font-black text-sm uppercase text-black flex items-center gap-2">
            <span className="w-5 h-5 bg-[#FFD100] rounded-md border border-black flex items-center justify-center text-[10px] font-mono font-black">3</span>
            How It Works
          </h3>
          <ol className="text-xs font-bold text-neutral-800 space-y-1 list-decimal pl-4">
            <li>Queue up to match anonymously.</li>
            <li>Chat freely for 2 minutes (120s).</li>
            <li>Decide: Human or Bot to earn coins!</li>
          </ol>
        </div>

        {/* Mobile Persistent Banner Ad */}
        <div className="pt-2 pb-4">
          <AdSlot format="mobile_banner" id="mobile-home-ad" />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 💻 PC VIEW: Wide, Rich Multi-Column Desktop Experience       */}
      {/* ============================================================ */}
      <div className="hidden lg:block max-w-6xl mx-auto px-6 lg:px-8 py-6">
        {/* 1. PC HERO: 12-Column Grid */}
        <section className="relative mt-4 mb-10">
          <div className="grid grid-cols-12 gap-6 items-stretch">
            {/* Left Column: Hero Game Card (7 Cols) */}
            <div className="col-span-7 flex flex-col justify-between bg-white border-4 border-black rounded-3xl p-8 shadow-[6px_6px_0px_0px_#000] relative">
              <div className="flex items-start justify-between gap-4 mb-4">
                <CyborgAvatar size="lg" />
                <div className="flex gap-2">
                  <span className="bg-[#FFD100] text-black font-mono font-black text-xs uppercase px-3 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    Social Turing Game
                  </span>
                  <span className="bg-white text-black font-mono font-bold text-xs uppercase px-2.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    2-Min Rounds
                  </span>
                </div>
              </div>

              <div className="my-auto py-2">
                <h1 className="text-5xl font-display font-black leading-[0.95] tracking-tight uppercase text-black mb-3">
                  Bot{' '}
                  <span className="text-black bg-[#FFD100] px-3 py-0.5 border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_#000] inline-block">
                    OR Not?
                  </span>
                </h1>
                <p className="text-base font-bold text-neutral-700 max-w-lg leading-relaxed mb-6">
                  Chat with an anonymous partner for <strong>two minutes</strong>. Try to figure out if it was a real human or an AI bot. Think you can tell the difference?
                </p>

                <div className="flex items-center gap-3 mb-6">
                  <Button
                    id="start-game-button-pc"
                    variant="primary"
                    size="xl"
                    onClick={onStartMatch}
                    className="py-4 px-8 text-lg font-black bg-[#FFD100] text-black border-4 border-black shadow-[5px_5px_0px_0px_#000] flex-1"
                  >
                    <Zap className="w-6 h-6 fill-black" />
                    START GAME (2 MINS)
                  </Button>
                  <Button
                    variant="secondary"
                    size="xl"
                    onClick={onOpenLeaderboard}
                    className="py-4 px-5 text-sm font-black border-4 border-black shadow-[5px_5px_0px_0px_#000]"
                    title="View Leaderboard"
                  >
                    <Trophy className="w-5 h-5 text-[#FFD100] fill-[#FFD100]" />
                    <span>Ranks</span>
                  </Button>
                  {onOpenQuests && (
                    <Button
                      variant={unclaimedQuestsCount > 0 ? 'primary' : 'secondary'}
                      size="xl"
                      onClick={onOpenQuests}
                      className="py-4 px-5 text-sm font-black border-4 border-black shadow-[5px_5px_0px_0px_#000] relative"
                      title="Daily Quests & Check-In"
                    >
                      <Gift className="w-5 h-5 text-black" />
                      <span>Quests</span>
                      {unclaimedQuestsCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white font-mono font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-black shadow-[1px_1px_0px_0px_#000] animate-bounce">
                          {unclaimedQuestsCount}
                        </span>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Player Stats Bar inside Hero */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t-3 border-black/10">
                <div className="p-2.5 bg-[#FFFDF5] rounded-2xl border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-mono font-black uppercase text-neutral-500 mb-0.5">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    <span>Accuracy</span>
                  </div>
                  <div className="font-mono font-black text-xl text-black">{accuracy}%</div>
                </div>

                <div className="p-2.5 bg-[#FFFDF5] rounded-2xl border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-mono font-black uppercase text-neutral-500 mb-0.5">
                    <Trophy className="w-3.5 h-3.5 text-purple-600" />
                    <span>Record</span>
                  </div>
                  <div className="font-mono font-black text-xl text-black">
                    {wins}W / {losses}L
                  </div>
                </div>

                <div className="p-2.5 bg-[#FFFDF5] rounded-2xl border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-mono font-black uppercase text-neutral-500 mb-0.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    <span>Streak</span>
                  </div>
                  <div className="font-mono font-black text-xl text-black">{streak}</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Global Stats & Research (5 Cols) */}
            <div className="col-span-5 flex flex-col justify-between gap-5">
              {/* 24h Activity Card */}
              <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider text-black">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FFD100] border-2 border-black animate-pulse" />
                    <Activity className="w-4 h-4 text-black" />
                    24-Hour Live Activity
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-[#FFD100] px-2 py-0.5 rounded border border-black">
                    Global
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-2">
                  <div className="p-3 bg-[#FFFDF5] rounded-2xl border-2 border-black">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                      Games Played
                    </span>
                    <div className="font-mono font-black text-2xl text-black mt-0.5">27,523</div>
                  </div>

                  <div className="p-3 bg-[#FFFDF5] rounded-2xl border-2 border-black">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">
                      Human Accuracy
                    </span>
                    <div className="font-mono font-black text-2xl text-black mt-0.5">63%</div>
                  </div>
                </div>

                {/* Accuracy meter */}
                <div className="mt-2">
                  <div className="flex justify-between text-xs font-bold text-neutral-600 mb-1">
                    <span>Accuracy meter</span>
                    <span>AI win rate: 37%</span>
                  </div>
                  <div className="w-full h-4 bg-[#FFFDF5] border-2 border-black rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-[#FFD100] border-r-2 border-black rounded-full transition-all duration-700 w-[63%]" />
                  </div>
                </div>
              </div>

              {/* Research Articles Card */}
              <div className="bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_#000] flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-mono font-black tracking-wider text-black uppercase mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-black" />
                    Understanding Humans and AI
                  </h3>

                  <div className="space-y-2.5">
                    {RESEARCH_TOPICS.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => setActiveArticle(topic)}
                        className="group flex items-start gap-3 p-2.5 rounded-2xl bg-[#FFFDF5] border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFD100]/20 hover:-translate-y-0.5 transition-all cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-xl bg-white border-2 border-black flex items-center justify-center shrink-0 mt-0.5 shadow-[1px_1px_0px_0px_#000]">
                          <Brain className="w-4 h-4 text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-black leading-snug group-hover:text-black line-clamp-2">
                            {topic.title}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-neutral-500">
                            {topic.read}
                          </span>
                        </div>
                        <span className="text-xs font-black text-black self-center">→</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-black/10 mt-3 flex justify-between items-center text-xs font-bold text-neutral-600">
                  <span>Empirical Turing Insights</span>
                  <button
                    type="button"
                    onClick={() => setActiveArticle(RESEARCH_TOPICS[0])}
                    className="font-mono font-black text-black hover:underline cursor-pointer"
                  >
                    Read Studies →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PC Ad Slot: 728x90 Leaderboard */}
        <section className="my-8">
          <AdSlot format="leaderboard" id="pc-home-leaderboard-ad" />
        </section>

        {/* 3. PC How It Works (3 Columns) */}
        <section id="how-it-works" className="mb-10 scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black flex items-center gap-2">
              <span className="w-7 h-7 bg-[#FFD100] rounded-xl border-2 border-black flex items-center justify-center text-xs font-mono font-black shadow-[2px_2px_0px_0px_#000]">
                3
              </span>
              How It Works
            </h2>
            <span className="text-xs font-mono font-bold text-neutral-600">120-SECOND ROUNDS</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-2xl bg-[#FFFDF5] border-2 border-black font-mono font-black text-sm flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_#000]">
                  1
                </div>
                <h3 className="font-display font-black text-base uppercase text-black mb-1">
                  Queue Up Anonymously
                </h3>
                <p className="text-xs sm:text-sm font-bold text-neutral-600 leading-relaxed">
                  Enter the matchmaking lobby. The server randomly pairs you with either a real human participant or an AI model.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-black/10 text-[11px] font-mono font-bold text-neutral-500">
                No registration needed
              </div>
            </div>

            <div className="p-5 bg-[#FFD100]/25 rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-2xl bg-[#FFD100] border-2 border-black font-mono font-black text-sm flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_#000]">
                  2
                </div>
                <h3 className="font-display font-black text-base uppercase text-black mb-1">
                  Talk for 2 Minutes
                </h3>
                <p className="text-xs sm:text-sm font-bold text-neutral-700 leading-relaxed">
                  Chat freely in real time. Ask clever, contextual, or offbeat questions to probe for synthetic patterns or authentic human quirks.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-black/10 text-[11px] font-mono font-bold text-neutral-600">
                Strict 120s server timer
              </div>
            </div>

            <div className="p-5 bg-white rounded-3xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="w-9 h-9 rounded-2xl bg-black text-white border-2 border-black font-mono font-black text-sm flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_#000]">
                  3
                </div>
                <h3 className="font-display font-black text-base uppercase text-black mb-1">
                  Decide: Human or Bot?
                </h3>
                <p className="text-xs sm:text-sm font-bold text-neutral-600 leading-relaxed">
                  Lock in your verdict! Guess right to earn +10 Human Coins and grow your Streak. Guess wrong and uncover the imitation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t-2 border-black/10 text-[11px] font-mono font-bold text-neutral-500">
                Instant revelation &amp; rewards
              </div>
            </div>
          </div>
        </section>

        {/* 4. PC Two-Column Grid: What is Bot or Not & Facts */}
        <section className="mb-10">
          <div className="grid grid-cols-2 gap-6 items-stretch">
            <Card className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[#FFD100] rounded-2xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                    <Brain className="w-5 h-5 text-black" />
                  </div>
                  <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
                    What is Bot or Not?
                  </h2>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm font-bold text-neutral-800 leading-relaxed">
                  <p>
                    <strong>Bot or Not</strong> is a live, real-time social Turing experiment. Every round pairs you with a random online stranger—human or AI—for a rapid <strong>two-minute</strong> conversation.
                  </p>
                  <p>
                    Inspired by British mathematician Alan Turing&apos;s iconic 1950 <em>Imitation Game</em>, the project explores how closely generative artificial intelligence can replicate human communication, and tests our collective ability to perceive real personhood through text.
                  </p>
                  <p>
                    Unlike fixed quizzes or scripted bots, every session is a genuine live interaction with unscripted answers and real stakes.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-black/10 flex items-center justify-between text-xs font-bold text-neutral-600">
                <span>Inspired by Alan Turing (1950)</span>
                <span className="font-mono font-black text-black">Live Matchmaking</span>
              </div>
            </Card>

            <Card className="bg-[#FFD100]/20 border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white rounded-2xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                    <Sparkles className="w-5 h-5 text-black" />
                  </div>
                  <h2 className="font-display font-black text-2xl uppercase tracking-tight text-black">
                    Turing Facts &amp; Clues
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <h4 className="font-display font-black text-sm text-black mb-1">
                      🤖 The 63% Turing Barrier
                    </h4>
                    <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                      Across thousands of played rounds, humans guess correctly only ~63% of the time. Modern AI models fool over 37% of players in 2 minutes!
                    </p>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <h4 className="font-display font-black text-sm text-black mb-1">
                      💬 The &quot;Too Human&quot; Paradox
                    </h4>
                    <p className="text-xs font-bold text-neutral-700 leading-relaxed">
                      Real humans frequently give abrupt answers, slang, and emojis, making them appear robotic. Conversely, advanced models are trained to mimic natural hesitation and self-correction!
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t-2 border-black/10 flex items-center justify-between text-xs font-bold text-neutral-600">
                <span>Tips &amp; Psychological Insights</span>
                <button
                  type="button"
                  onClick={onStartMatch}
                  className="font-mono font-black text-black hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Test Yourself</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          </div>
        </section>

        {/* 5. PC FAQs */}
        <FaqSection onOpenSettings={() => setShowSettings(true)} />

        {/* 6. PC Bottom Leaderboard Banner */}
        <section className="mb-12">
          <div className="bg-[#FFD100] border-4 border-black rounded-3xl p-8 shadow-[6px_6px_0px_0px_#000] flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-2xl border-3 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#000]">
                <Trophy className="w-8 h-8 text-[#FFD100] fill-[#FFD100]" />
              </div>
              <div>
                <h3 className="font-display font-black text-2xl uppercase text-black leading-tight">
                  Global Turing Leaderboard
                </h3>
                <p className="text-sm font-bold text-neutral-800 mt-1">
                  Compete with players worldwide. Build your win streak and earn your title!
                </p>
              </div>
            </div>

            <Button
              variant="dark"
              size="lg"
              onClick={onOpenLeaderboard}
              className="py-3 px-6 text-sm font-black whitespace-nowrap border-3 shadow-[4px_4px_0px_0px_#000] shrink-0"
            >
              VIEW LEADERBOARD →
            </Button>
          </div>
        </section>

        {/* 7. PC Wide Footer */}
        <footer className="pt-8 pb-12 mt-8 border-t-4 border-black text-black">
          <div className="grid grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <CyborgAvatar size="xs" />
                <span className="font-display font-black text-xl tracking-tight">
                  Bot<span className="bg-[#FFD100] px-1.5 py-0.5 rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_#000]">OR Not?</span>
                </span>
              </div>
              <p className="text-xs font-bold text-neutral-600 leading-relaxed">
                The real-time social Turing deduction game. Two minutes of anonymous chat to decide: Human or AI?
              </p>
              <div className="text-[11px] font-mono font-bold text-neutral-500">
                Inspired by Alan Turing (1950)
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-black mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-1.5 text-xs font-bold text-neutral-700">
                <li>
                  <button
                    type="button"
                    onClick={onStartMatch}
                    className="hover:underline hover:text-black cursor-pointer"
                  >
                    Start 2-Minute Game
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenLeaderboard}
                    className="hover:underline hover:text-black cursor-pointer"
                  >
                    Global Leaderboard
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="hover:underline hover:text-black cursor-pointer"
                  >
                    Game Rules &amp; Audio
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-display font-black text-xs uppercase tracking-wider text-black mb-3">
                Transparency &amp; Privacy
              </h4>
              <p className="text-xs font-bold text-neutral-600 leading-relaxed">
                All chat transcripts are ephemeral and anonymous. Advertisements displayed adhere to standard non-intrusive layout guidelines without blocking gameplay.
              </p>
              <div className="text-[10px] font-mono font-bold text-neutral-500 mt-2">
                © {new Date().getFullYear()} Bot or Not. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>



      {/* Article Detail Modal */}
      <AnimatePresence>
        {activeArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="relative bg-[#FFFDF5] p-6 border-4 shadow-[8px_8px_0px_0px_#000]">
                <button
                  onClick={() => setActiveArticle(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <span className="font-mono text-[10px] font-black uppercase tracking-wider bg-[#FFD100] px-2 py-0.5 rounded-md border border-black inline-block mb-2">
                  Turing Research Article
                </span>

                <h3 className="text-xl font-display font-black text-black mb-3 leading-snug">
                  {activeArticle.title}
                </h3>

                <p className="text-xs sm:text-sm font-bold text-neutral-700 leading-relaxed mb-5">
                  {activeArticle.summary}
                </p>

                <Button
                  variant="primary"
                  fullWidth
                  className="text-xs sm:text-sm py-2.5"
                  onClick={() => setActiveArticle(null)}
                >
                  Done Reading
                </Button>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        sound={sound}
        onToggleSound={toggleSound}
      />
    </div>
  )
}
