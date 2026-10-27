import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Trophy,
  CheckCircle2,
  Gift,
  PlaySquare,
  Clock,
  Sparkles,
  Zap,
  Target,
  Flame,
  MessageSquare,
} from 'lucide-react'
import { Button } from './UI'
import { CoinIcon } from './CoinIcon'
import {
  type DailyQuestsData,
  type DailyQuest,
  getQuestsList,
  getAdsWatchedInWindow,
  formatCooldownTime,
  LOGIN_STREAK_REWARDS,
  ALL_QUESTS_BONUS,
  MAX_ADS_12H,
} from '../lib/quests'
import { playReward } from '../lib/audio'

interface DailyQuestsModalProps {
  isOpen: boolean
  onClose: () => void
  questsData: DailyQuestsData
  onClaimQuest: (questId: string, reward: number) => void
  onClaimLogin: (reward: number) => void
  onClaimAllBonus: (reward: number) => void
  onWatchAd: () => void
  onStartMatch: () => void
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({
  isOpen,
  onClose,
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

  // 12-hour cooldown timer ticker
  useEffect(() => {
    if (!isOpen) return
    const updateTimer = () => {
      const currentAdInfo = getAdsWatchedInWindow(questsData.adWatchTimestamps)
      if (!currentAdInfo.canWatch && currentAdInfo.remainingTimeMs > 0) {
        setAdCooldownTimer(formatCooldownTime(currentAdInfo.remainingTimeMs))
      } else {
        setAdCooldownTimer('')
      }
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [isOpen, questsData.adWatchTimestamps])

  const handleWatchAd = () => {
    if (!adInfo.canWatch || watchingAd) return
    setWatchingAd(true)
    setTimeout(() => {
      setWatchingAd(false)
      onWatchAd()
      playReward()
    }, 1800)
  }

  // Count total completed and claimed
  const regularQuests = quests.filter((q) => q.id !== 'daily_login')
  const completedCount = regularQuests.filter((q) => q.isCompleted).length
  const allRegularClaimed = regularQuests.every((q) => q.isClaimed)
  const canClaimAllBonus = questsData.loginClaimedToday && allRegularClaimed && !questsData.allClaimed

  const getQuestIcon = (type: DailyQuest['icon']) => {
    switch (type) {
      case 'login':
        return <Gift className="w-5 h-5 text-amber-500" />
      case 'play1':
        return <Zap className="w-5 h-5 text-[#FFD100] fill-black" />
      case 'correct1':
        return <Target className="w-5 h-5 text-emerald-500" />
      case 'play3':
        return <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
      case 'ad':
        return <PlaySquare className="w-5 h-5 text-purple-500" />
      default:
        return <MessageSquare className="w-5 h-5 text-black" />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs select-none"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            className="w-full max-w-xl max-h-[90vh] flex flex-col bg-[#FFFDF5] border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_#000] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-[#FFD100] border-b-4 border-black p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-2xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                  <Trophy className="w-6 h-6 text-black fill-[#FFD100]" />
                </div>
                <div>
                  <h2 className="font-display font-black text-xl leading-none text-black uppercase">
                    Daily Quests &amp; Rewards
                  </h2>
                  <span className="font-mono text-[11px] font-bold text-neutral-800">
                    Resets daily at midnight • Easy coins &amp; streaks
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 bg-white hover:bg-neutral-100 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* 7-Day Login Streak Tracker */}
              <div className="bg-white border-3 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_0px_#000]">
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-black" />
                    <span className="font-display font-black text-xs uppercase text-black">
                      7-Day Login Streak
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-black bg-[#FFD100] px-2 py-0.5 rounded-md border border-black shadow-[1px_1px_0px_0px_#000]">
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
                        className={`p-1.5 sm:p-2 rounded-xl border-2 border-black flex flex-col items-center justify-between text-[10px] font-mono font-bold transition-all ${
                          isClaimedToday
                            ? 'bg-emerald-100 border-emerald-600 shadow-none opacity-80'
                            : isCurrent
                            ? 'bg-[#FFD100] ring-2 ring-black scale-105 shadow-[2px_2px_0px_0px_#000]'
                            : isPast
                            ? 'bg-neutral-100 text-neutral-400 opacity-60'
                            : 'bg-white text-black'
                        }`}
                      >
                        <span className="text-[9px] font-black uppercase">D{dayNum}</span>
                        <div className="my-1 flex items-center justify-center">
                          {isClaimedToday ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <CoinIcon size="xs" />
                          )}
                        </div>
                        <span className="font-black">+{rew}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Claim Today's Login Button */}
                {!questsData.loginClaimedToday && (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      const rew =
                        LOGIN_STREAK_REWARDS[
                          (questsData.loginStreak - 1) % LOGIN_STREAK_REWARDS.length
                        ] || 5
                      onClaimLogin(rew)
                    }}
                    className="mt-3 py-2 text-xs font-black uppercase tracking-wider border-2 shadow-[2px_2px_0px_0px_#000]"
                  >
                    <Gift className="w-4 h-4 mr-1" />
                    Claim Day {questsData.loginStreak} Login (+
                    {LOGIN_STREAK_REWARDS[(questsData.loginStreak - 1) % LOGIN_STREAK_REWARDS.length]} Coins)
                  </Button>
                )}
              </div>

              {/* Quests List */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                  <span className="font-display font-black text-xs uppercase text-neutral-700">
                    Daily Quests ({completedCount}/{regularQuests.length} Done)
                  </span>
                  <span className="font-mono text-[10px] font-bold text-neutral-500">
                    Midnight Reset
                  </span>
                </div>

                {regularQuests.map((quest) => (
                  <div
                    key={quest.id}
                    className={`p-3 sm:p-3.5 rounded-2xl border-3 border-black flex items-center justify-between gap-3 shadow-[3px_3px_0px_0px_#000] transition-all ${
                      quest.isClaimed
                        ? 'bg-neutral-50 opacity-75'
                        : quest.isCompleted
                        ? 'bg-[#FFF8D6]'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] shrink-0">
                        {getQuestIcon(quest.icon)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display font-black text-sm text-black leading-tight">
                            {quest.title}
                          </h4>
                          <span className="font-mono text-[10px] font-black bg-[#FFD100] px-1.5 py-0.5 rounded border border-black flex items-center gap-1">
                            +{quest.reward} <CoinIcon size="xs" />
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-neutral-600 leading-snug mt-0.5">
                          {quest.description}
                        </p>
                        {/* Progress Bar */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="w-24 h-2 bg-neutral-100 rounded-full border border-black overflow-hidden p-0.5">
                            <div
                              className="h-full bg-[#FFD100] rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-neutral-600">
                            {quest.progress}/{quest.target}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="shrink-0">
                      {quest.isClaimed ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 border-2 border-emerald-600 rounded-xl text-emerald-800 font-mono text-xs font-black">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Claimed</span>
                        </div>
                      ) : quest.isCompleted ? (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onClaimQuest(quest.id, quest.reward)}
                          className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider border-2 shadow-[2px_2px_0px_0px_#000] animate-bounce"
                        >
                          Claim!
                        </Button>
                      ) : quest.id === 'watch_ad_1' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleWatchAd}
                          disabled={!adInfo.canWatch || watchingAd}
                          className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border-2"
                        >
                          <PlaySquare className="w-3.5 h-3.5 mr-1" />
                          Watch Ad
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            onClose()
                            onStartMatch()
                          }}
                          className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border-2"
                        >
                          Play
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 12-Hour Ad Watching Sponsor Box */}
              <div className="bg-purple-50 border-3 border-black rounded-2xl p-3.5 shadow-[3px_3px_0px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-10 h-10 bg-purple-200 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000]">
                    <PlaySquare className="w-5 h-5 text-purple-900" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-xs uppercase text-purple-950">
                        Sponsor Ad Refill (+10 🪙 each)
                      </span>
                      <span className="font-mono text-[10px] font-black bg-white px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#000]">
                        {adInfo.count}/{MAX_ADS_12H} in 12 hrs
                      </span>
                    </div>
                    <div className="text-[11px] font-bold text-neutral-600 mt-0.5">
                      {adInfo.canWatch
                        ? `${MAX_ADS_12H - adInfo.count} ad watches remaining in this 12h window`
                        : `12h window reached! Cooldown active: ${adCooldownTimer}`}
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleWatchAd}
                  disabled={!adInfo.canWatch || watchingAd}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-black uppercase tracking-wider border-2 shadow-[2px_2px_0px_0px_#000] shrink-0"
                >
                  <PlaySquare className="w-4 h-4 mr-1.5" />
                  {watchingAd
                    ? 'Watching (+10 🪙)...'
                    : adInfo.canWatch
                    ? 'Watch Ad (+10 🪙)'
                    : `Cooldown (${adCooldownTimer})`}
                </Button>
              </div>

              {/* Daily Master Completion Chest */}
              <div
                className={`p-4 rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between gap-4 transition-all ${
                  questsData.allClaimed
                    ? 'bg-neutral-100 opacity-80'
                    : canClaimAllBonus
                    ? 'bg-[#FFD100]'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-2xl border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000] shrink-0">
                    <Sparkles className="w-7 h-7 text-[#FFD100] fill-black" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-sm uppercase text-black leading-tight">
                      Master Detective Bonus
                    </h4>
                    <p className="text-xs font-bold text-neutral-700 leading-snug">
                      Complete all daily quests to claim the grand reward!
                    </p>
                    <span className="font-mono text-xs font-black text-black inline-flex items-center gap-1 mt-1">
                      Reward: +{ALL_QUESTS_BONUS} Coins <CoinIcon size="xs" />
                    </span>
                  </div>
                </div>

                <div>
                  {questsData.allClaimed ? (
                    <div className="flex items-center gap-1 px-3.5 py-2 bg-emerald-100 border-2 border-emerald-600 rounded-xl text-emerald-800 font-mono text-xs font-black">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>All Claimed</span>
                    </div>
                  ) : canClaimAllBonus ? (
                    <Button
                      variant="dark"
                      size="sm"
                      onClick={() => onClaimAllBonus(ALL_QUESTS_BONUS)}
                      className="py-2.5 px-4 text-xs font-black uppercase tracking-wider border-2 shadow-[2px_2px_0px_0px_#000] animate-pulse"
                    >
                      Claim All (+{ALL_QUESTS_BONUS} 🪙)
                    </Button>
                  ) : (
                    <div className="font-mono text-xs font-black text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-xl border border-black/20">
                      Locked ({completedCount}/{regularQuests.length})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-neutral-50 border-t-3 border-black flex justify-between items-center text-xs font-mono font-bold text-neutral-600 shrink-0">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Play daily to build your 7-day bonus!
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="py-1 px-3 text-xs font-black border-2"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
