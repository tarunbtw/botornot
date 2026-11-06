import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  Gift,
  PlaySolid,
  Clock,
  Flash,
  PrecisionTool,
  FireFlame,
  ChatBubble,
} from 'iconoir-react'
import { Button } from '../components/UI'
import { CoinIcon } from '../components/CoinIcon'
import {
  type DailyQuestsData,
  type DailyQuest,
  getQuestsList,
  getAdsWatchedInWindow,
  formatCooldownTime,
  LOGIN_STREAK_REWARDS,
  ALL_QUESTS_BONUS,
} from '../lib/quests'
import { playReward } from '../lib/audio'

interface QuestsProps {
  onBack: () => void
  questsData: DailyQuestsData
  onClaimQuest: (questId: string, reward: number) => void
  onClaimLogin: (reward: number) => void
  onClaimAllBonus: (reward: number) => void
  onWatchAd: () => void
  onStartMatch: () => void
}

export const Quests: React.FC<QuestsProps> = ({
  onBack,
  questsData,
  onClaimQuest,
  onClaimLogin,
  onClaimAllBonus,
  onWatchAd,
  onStartMatch,
}) => {
  const [watchingAd, setWatchingAd] = useState(false)
  const [adCooldownTimer, setAdCooldownTimer] = useState<string>('')

  const quests: DailyQuest[] = getQuestsList(questsData)
  const adInfo = getAdsWatchedInWindow(questsData.adWatchTimestamps)

  useEffect(() => {
    const updateTimer = () => {
      const current = getAdsWatchedInWindow(questsData.adWatchTimestamps)
      if (!current.canWatch && current.remainingTimeMs > 0) {
        setAdCooldownTimer(formatCooldownTime(current.remainingTimeMs))
      } else {
        setAdCooldownTimer('')
      }
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [questsData.adWatchTimestamps])

  const handleWatchAd = () => {
    if (!adInfo.canWatch || watchingAd) return
    setWatchingAd(true)
    setTimeout(() => {
      setWatchingAd(false)
      onWatchAd()
      playReward()
    }, 1800)
  }

  const regularQuests = quests.filter((q) => q.id !== 'daily_login')
  const completedCount = regularQuests.filter((q) => q.isCompleted).length
  const allRegularClaimed = regularQuests.every((q) => q.isClaimed)
  const canClaimAllBonus = questsData.loginClaimedToday && allRegularClaimed && !questsData.allClaimed

  const getQuestIcon = (type: DailyQuest['icon']) => {
    switch (type) {
      case 'login':
        return <Gift className="w-4 h-4 text-amber-500" />
      case 'play1':
        return <Flash className="w-4 h-4 text-[#FFD100]" />
      case 'correct1':
        return <PrecisionTool className="w-4 h-4 text-emerald-500" />
      case 'play3':
        return <FireFlame className="w-4 h-4 text-orange-500" />
      case 'ad':
        return <PlaySolid className="w-4 h-4 text-purple-500" />
      default:
        return <ChatBubble className="w-4 h-4 text-black dark:text-white" />
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col flex-1 select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
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
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FFD100] fill-[#FFD100]" />
            <h1 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-black dark:text-white">
              Daily Quests
            </h1>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400 bg-white dark:bg-[#181820] border border-black/20 dark:border-neutral-700 px-3 py-1 rounded-full">
          Resets at midnight
        </span>
      </div>

      <div className="space-y-4">
        {/* 7-Day Login Streak Tracker */}
        <div className="bg-white dark:bg-[#181820] border border-black/15 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-black dark:text-white" />
              <h2 className="font-display font-black text-sm uppercase text-black dark:text-white">
                7-Day Login Streak
              </h2>
            </div>
            <span className="font-mono text-xs font-black bg-[#FFD100] text-black px-2.5 py-0.5 rounded-lg border border-black shadow-[1px_1px_0px_0px_#000]">
              Day {questsData.loginStreak} / 7
            </span>
          </div>

          {/* 7 Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {LOGIN_STREAK_REWARDS.map((rew, idx) => {
              const dayNum = idx + 1
              const isPast = dayNum < questsData.loginStreak
              const isCurrent = dayNum === questsData.loginStreak
              const isClaimedToday = isCurrent && questsData.loginClaimedToday

              return (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-between text-[10px] font-mono font-bold transition-all ${
                    isClaimedToday
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-700 opacity-80 text-black dark:text-white'
                      : isCurrent
                      ? 'bg-[#FFD100] text-black border-black ring-2 ring-black font-black scale-105 shadow-[1px_1px_0px_0px_#000]'
                      : isPast
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 border-black dark:border-neutral-700 opacity-60'
                      : 'bg-[#FAFAF8] dark:bg-[#121218] text-black dark:text-white border-black dark:border-neutral-700'
                  }`}
                >
                  <span className="text-[10px] font-bold">D{dayNum}</span>
                  <div className="my-1 flex items-center justify-center">
                    {isClaimedToday ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <CoinIcon size="xs" />
                    )}
                  </div>
                  <span className="text-[11px]">+{rew}</span>
                </div>
              )
            })}
          </div>

          {!questsData.loginClaimedToday && (
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                const rew =
                  LOGIN_STREAK_REWARDS[
                    (questsData.loginStreak - 1) % LOGIN_STREAK_REWARDS.length
                  ] || 5
                onClaimLogin(rew)
              }}
              className="mt-3 py-2.5 text-xs font-black uppercase tracking-wider border border-black/80 shadow-xs"
            >
              <Gift className="w-4 h-4 mr-1.5" />
              Claim Day {questsData.loginStreak} (+{LOGIN_STREAK_REWARDS[(questsData.loginStreak - 1) % LOGIN_STREAK_REWARDS.length]} Coins)
            </Button>
          )}
        </div>

        {/* Quests List */}
        <div className="bg-white dark:bg-[#181820] border border-black/15 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-black/10 dark:border-neutral-700">
            <h2 className="font-display font-black text-sm uppercase text-black dark:text-white">
              Today's Objectives
            </h2>
            <span className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400">
              {completedCount}/{regularQuests.length} Completed
            </span>
          </div>

          <div className="space-y-2.5">
            {regularQuests.map((quest) => (
              <div
                key={quest.id}
                className={`p-3.5 rounded-xl border border-black/15 dark:border-neutral-700 flex items-center justify-between gap-3 transition-all ${
                  quest.isClaimed
                    ? 'bg-neutral-50 dark:bg-[#121218] opacity-70'
                    : quest.isCompleted
                    ? 'bg-[#FFF8D6] dark:bg-[#201F12] shadow-xs'
                    : 'bg-[#FAFAF8] dark:bg-[#14141C]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E1E28] border border-black dark:border-neutral-700 flex items-center justify-center shrink-0 shadow-[1px_1px_0px_0px_#000] dark:shadow-none">
                    {getQuestIcon(quest.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-black text-sm text-black dark:text-white leading-tight">
                        {quest.title}
                      </h3>
                      <span className="font-mono text-[10px] font-black bg-[#FFD100] text-black px-1.5 py-0.5 rounded border border-black flex items-center gap-1">
                        +{quest.reward} <CoinIcon size="xs" />
                      </span>
                    </div>
                    <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 leading-snug mt-0.5">
                      {quest.description}
                    </p>
                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-24 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full border border-black/30 dark:border-neutral-700 overflow-hidden">
                        <div
                          className="h-full bg-[#FFD100] rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                        {quest.progress}/{quest.target}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="shrink-0">
                  {quest.isClaimed ? (
                    <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-600 dark:border-emerald-700 rounded-lg text-emerald-800 dark:text-emerald-400 font-mono text-xs font-black">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </div>
                  ) : quest.isCompleted ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onClaimQuest(quest.id, quest.reward)}
                      className="px-4 py-1.5 text-xs font-black uppercase tracking-wider"
                    >
                      Claim!
                    </Button>
                  ) : quest.id === 'watch_ad_1' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleWatchAd}
                      disabled={!adInfo.canWatch || watchingAd}
                      className="px-3 py-1.5 text-xs font-bold"
                    >
                      <PlaySolid className="w-3.5 h-3.5 mr-1" />
                      {watchingAd ? 'Watching...' : adInfo.canWatch ? 'Watch Ad' : (adCooldownTimer || 'Cooldown')}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={onStartMatch}
                      className="px-3 py-1.5 text-xs font-bold"
                    >
                      Play
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Master Completion Bonus Card */}
          <div
            className={`p-4 rounded-xl border border-black/15 dark:border-neutral-700 flex items-center justify-between gap-3 mt-4 ${
              questsData.allClaimed
                ? 'bg-neutral-100 dark:bg-[#121218] opacity-80'
                : canClaimAllBonus
                ? 'bg-[#FFD100] shadow-xs text-black'
                : 'bg-[#FAFAF8] dark:bg-[#14141C]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 text-black dark:text-white shrink-0" />
              <div>
                <h3 className="font-display font-black text-sm uppercase text-black dark:text-white leading-tight">
                  Master Bonus (+{ALL_QUESTS_BONUS} Coins)
                </h3>
                <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Complete all daily objectives to claim the grand chest.
                </p>
              </div>
            </div>

            <div>
              {questsData.allClaimed ? (
                <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-600 dark:border-emerald-700 rounded-lg text-emerald-800 dark:text-emerald-400 font-mono text-xs font-black">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Claimed</span>
                </div>
              ) : canClaimAllBonus ? (
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => onClaimAllBonus(ALL_QUESTS_BONUS)}
                  className="py-2 px-4 text-xs font-black uppercase tracking-wider"
                >
                  Claim All
                </Button>
              ) : (
                <div className="font-mono text-xs font-bold text-neutral-500 dark:text-neutral-400 bg-white dark:bg-[#181820] px-3 py-1 rounded-lg border border-black/20 dark:border-neutral-700">
                  {completedCount}/{regularQuests.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer tip */}
        <div className="flex items-center justify-center gap-1 text-xs font-mono font-bold text-neutral-400 pt-2">
          <Clock className="w-3.5 h-3.5" />
          <span>New quests unlock every 24 hours</span>
        </div>
      </div>
    </div>
  )
}

