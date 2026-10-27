export interface DailyQuest {
  id: string
  title: string
  description: string
  progress: number
  target: number
  reward: number
  isCompleted: boolean
  isClaimed: boolean
  icon: 'login' | 'play1' | 'correct1' | 'play3' | 'ad'
}

export interface DailyQuestsData {
  lastDate: string // YYYY-MM-DD
  loginStreak: number // 1 to 7
  loginClaimedToday: boolean
  matchesPlayed: number
  correctGuesses: number
  adsWatchedToday: number
  adWatchTimestamps: number[] // timestamps of ads watched in recent 24h
  claimedQuestIds: string[]
  allClaimed: boolean
}

export const MAX_ADS_12H = 5
export const AD_WINDOW_MS = 12 * 60 * 60 * 1000 // 12 hours in milliseconds
export const LOGIN_STREAK_REWARDS = [5, 10, 15, 20, 25, 35, 50]
export const ALL_QUESTS_BONUS = 25

export function getTodayDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getYesterdayDateString(): string {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const year = yesterday.getFullYear()
  const month = String(yesterday.getMonth() + 1).padStart(2, '0')
  const day = String(yesterday.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const STORAGE_KEY = 'botornot_daily_quests_v1'

export function loadQuestsData(): DailyQuestsData {
  const today = getTodayDateString()
  const yesterday = getYesterdayDateString()

  const defaultData: DailyQuestsData = {
    lastDate: today,
    loginStreak: 1,
    loginClaimedToday: false,
    matchesPlayed: 0,
    correctGuesses: 0,
    adsWatchedToday: 0,
    adWatchTimestamps: [],
    claimedQuestIds: [],
    allClaimed: false,
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData
    const parsed: DailyQuestsData = JSON.parse(raw)

    // Filter ad timestamps older than 24h to keep localStorage clean
    const recentAdTimestamps = (parsed.adWatchTimestamps || []).filter(
      (ts) => Date.now() - ts < 24 * 60 * 60 * 1000
    )

    // Same day check
    if (parsed.lastDate === today) {
      return {
        ...parsed,
        adWatchTimestamps: recentAdTimestamps,
      }
    }

    // New day has arrived! Calculate login streak
    let newStreak = 1
    if (parsed.lastDate === yesterday && parsed.loginClaimedToday) {
      // Retained streak, advance (cap at 7)
      newStreak = (parsed.loginStreak % 7) + 1
    } else {
      // Streak broken, reset to 1
      newStreak = 1
    }

    const resetData: DailyQuestsData = {
      lastDate: today,
      loginStreak: newStreak,
      loginClaimedToday: false,
      matchesPlayed: 0,
      correctGuesses: 0,
      adsWatchedToday: 0,
      adWatchTimestamps: recentAdTimestamps,
      claimedQuestIds: [],
      allClaimed: false,
    }

    saveQuestsData(resetData)
    return resetData
  } catch {
    return defaultData
  }
}

export function saveQuestsData(data: DailyQuestsData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // silent catch for private browsing
  }
}

/**
 * Calculates how many ads were watched in the 12-hour sliding window.
 */
export function getAdsWatchedInWindow(timestamps: number[]): {
  count: number
  remainingTimeMs: number
  canWatch: boolean
} {
  const now = Date.now()
  const windowTimestamps = (timestamps || []).filter((ts) => now - ts < AD_WINDOW_MS)
  const count = windowTimestamps.length

  if (count < MAX_ADS_12H) {
    return {
      count,
      remainingTimeMs: 0,
      canWatch: true,
    }
  }

  // If 5 ads reached, find earliest timestamp that will expire out of the 12h window
  const oldestInWindow = Math.min(...windowTimestamps)
  const remainingTimeMs = Math.max(0, oldestInWindow + AD_WINDOW_MS - now)

  return {
    count,
    remainingTimeMs,
    canWatch: false,
  }
}

export function formatCooldownTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m ${seconds}s`
}

/**
 * Generates the full quest list with current progress & claimed states.
 */
export function getQuestsList(data: DailyQuestsData): DailyQuest[] {
  const isClaimed = (id: string) => data.claimedQuestIds.includes(id)

  return [
    {
      id: 'daily_login',
      title: 'Daily Check-In',
      description: 'Open the game and claim your daily presence reward',
      icon: 'login',
      progress: data.loginClaimedToday ? 1 : 0,
      target: 1,
      reward: LOGIN_STREAK_REWARDS[(data.loginStreak - 1) % LOGIN_STREAK_REWARDS.length] || 5,
      isCompleted: !data.loginClaimedToday, // Ready to claim if not claimed today!
      isClaimed: data.loginClaimedToday,
    },
    {
      id: 'play_1',
      title: 'First Contact',
      description: 'Complete 1 match against an unknown opponent',
      icon: 'play1',
      progress: Math.min(data.matchesPlayed, 1),
      target: 1,
      reward: 10,
      isCompleted: data.matchesPlayed >= 1,
      isClaimed: isClaimed('play_1'),
    },
    {
      id: 'guess_correct_1',
      title: 'Sharp Instincts',
      description: 'Make 1 correct deduction (AI or Real Human)',
      icon: 'correct1',
      progress: Math.min(data.correctGuesses, 1),
      target: 1,
      reward: 15,
      isCompleted: data.correctGuesses >= 1,
      isClaimed: isClaimed('guess_correct_1'),
    },
    {
      id: 'play_3',
      title: 'The Turing Probe',
      description: 'Engage in 3 total matches today',
      icon: 'play3',
      progress: Math.min(data.matchesPlayed, 3),
      target: 3,
      reward: 20,
      isCompleted: data.matchesPlayed >= 3,
      isClaimed: isClaimed('play_3'),
    },
    {
      id: 'watch_ad_1',
      title: 'Sponsor Supporter',
      description: `Watch 1 sponsor ad (Max ${MAX_ADS_12H} ads per 12 hrs)`,
      icon: 'ad',
      progress: Math.min(data.adsWatchedToday, 1),
      target: 1,
      reward: 15,
      isCompleted: data.adsWatchedToday >= 1,
      isClaimed: isClaimed('watch_ad_1'),
    },
  ]
}

/**
 * Counts how many quests are completed and waiting to be claimed.
 */
export function getUnclaimedCount(data: DailyQuestsData): number {
  const quests = getQuestsList(data)
  let count = 0

  // 1. Daily login claimable
  if (!data.loginClaimedToday) {
    count++
  }

  // 2. Regular quests (excluding daily_login which is checked above)
  for (const q of quests) {
    if (q.id !== 'daily_login' && q.isCompleted && !q.isClaimed) {
      count++
    }
  }

  // 3. All quests completion bonus
  const regularQuests = quests.filter((q) => q.id !== 'daily_login')
  const allRegularClaimed = regularQuests.every((q) => q.isClaimed)
  if (data.loginClaimedToday && allRegularClaimed && !data.allClaimed) {
    count++
  }

  return count
}
