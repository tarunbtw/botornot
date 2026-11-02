import crypto from 'crypto'
import { eq, and, sql, gte } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { userDailyQuest } from '../../db/schema/quests.js'
import { gamePlayer } from '../../db/schema/games.js'
import { tokenLedgerService } from '../tokens/ledger.js'

export const LOGIN_STREAK_REWARDS = [5, 10, 15, 20, 25, 35, 50]
export const ALL_QUESTS_BONUS = 25
export const MAX_ADS_PER_DAY = 5

export function getTodayUTC(): string {
  const now = new Date()
  return now.toISOString().slice(0, 10)
}

export function getYesterdayUTC(): string {
  const yesterday = new Date(Date.now() - 86400000)
  return yesterday.toISOString().slice(0, 10)
}

export interface QuestStatus {
  date: string
  loginStreak: number
  loginClaimedToday: boolean
  matchesPlayed: number
  correctGuesses: number
  adsWatchedToday: number
  claimedQuestIds: string[]
  allClaimed: boolean
}

export class QuestsService {
  /**
   * Retrieves or initializes today's quest record for the user,
   * calculating real match progress from the database.
   */
  async getTodayQuests(userId: string): Promise<QuestStatus> {
    const today = getTodayUTC()
    const yesterday = getYesterdayUTC()

    // 1. Fetch today's record
    let record = await db.query.userDailyQuest.findFirst({
      where: and(eq(userDailyQuest.userId, userId), eq(userDailyQuest.date, today)),
    })

    if (!record) {
      // Check yesterday's login record for streak continuity
      const prevRecord = await db.query.userDailyQuest.findFirst({
        where: and(eq(userDailyQuest.userId, userId), eq(userDailyQuest.date, yesterday)),
      })

      const nextStreak =
        prevRecord && prevRecord.loginClaimed
          ? prevRecord.loginStreak >= 7
            ? 1
            : prevRecord.loginStreak + 1
          : 1

      const newId = crypto.randomUUID()
      await db
        .insert(userDailyQuest)
        .values({
          id: newId,
          userId,
          date: today,
          loginStreak: nextStreak,
          loginClaimed: false,
          claimedQuestIds: [],
          allClaimed: false,
          adsWatchedCount: 0,
        })
        .onConflictDoNothing()

      record = await db.query.userDailyQuest.findFirst({
        where: and(eq(userDailyQuest.userId, userId), eq(userDailyQuest.date, today)),
      })
    }

    // 2. Count matches and correct guesses played TODAY (UTC)
    const todayStart = new Date(`${today}T00:00:00.000Z`)

    const [stats] = await db
      .select({
        matchesPlayed: sql<number>`count(*)::int`,
        correctGuesses: sql<number>`count(case when ${gamePlayer.guessCorrect} = true then 1 end)::int`,
      })
      .from(gamePlayer)
      .where(and(eq(gamePlayer.userId, userId), gte(gamePlayer.createdAt, todayStart)))

    return {
      date: today,
      loginStreak: record?.loginStreak ?? 1,
      loginClaimedToday: record?.loginClaimed ?? false,
      matchesPlayed: stats?.matchesPlayed ?? 0,
      correctGuesses: stats?.correctGuesses ?? 0,
      adsWatchedToday: record?.adsWatchedCount ?? 0,
      claimedQuestIds: (record?.claimedQuestIds as string[]) ?? [],
      allClaimed: record?.allClaimed ?? false,
    }
  }

  /**
   * Atomically claims a quest and credits tokens via TokenLedger.
   * Throws error if already claimed or requirements not met.
   */
  async claimQuest(
    userId: string,
    questId: 'login' | 'play1' | 'correct1' | 'play3' | 'bonus' | 'ad',
  ): Promise<{ reward: number; balanceAfter: number; questsData: QuestStatus }> {
    const today = getTodayUTC()

    return db.transaction(async (tx) => {
      // 1. Fetch and lock user's daily record
      const [record] = await tx
        .select()
        .from(userDailyQuest)
        .where(and(eq(userDailyQuest.userId, userId), eq(userDailyQuest.date, today)))
        .for('update')

      if (!record) {
        throw new Error('QUEST_RECORD_NOT_FOUND')
      }

      let reward = 0
      const currentClaimed = (record.claimedQuestIds as string[]) || []

      // 2. Validate and compute reward per quest type
      if (questId === 'login') {
        if (record.loginClaimed) {
          throw new Error('LOGIN_ALREADY_CLAIMED_TODAY')
        }
        reward = LOGIN_STREAK_REWARDS[Math.min(record.loginStreak, 7) - 1] || 10

        await tx
          .update(userDailyQuest)
          .set({ loginClaimed: true, updatedAt: new Date() })
          .where(eq(userDailyQuest.id, record.id))
      } else if (questId === 'ad') {
        if (record.adsWatchedCount >= MAX_ADS_PER_DAY) {
          throw new Error('MAX_DAILY_ADS_REACHED')
        }
        reward = 10

        await tx
          .update(userDailyQuest)
          .set({
            adsWatchedCount: record.adsWatchedCount + 1,
            updatedAt: new Date(),
          })
          .where(eq(userDailyQuest.id, record.id))
      } else if (questId === 'bonus') {
        if (record.allClaimed) {
          throw new Error('BONUS_ALREADY_CLAIMED')
        }
        // Verify all 3 gameplay quests are claimed
        const required = ['play1', 'correct1', 'play3']
        const hasAll = required.every((id) => currentClaimed.includes(id)) && record.loginClaimed
        if (!hasAll) {
          throw new Error('REQUIREMENTS_NOT_MET')
        }
        reward = ALL_QUESTS_BONUS

        await tx
          .update(userDailyQuest)
          .set({ allClaimed: true, updatedAt: new Date() })
          .where(eq(userDailyQuest.id, record.id))
      } else {
        // Gameplay Quests ('play1', 'correct1', 'play3')
        if (currentClaimed.includes(questId)) {
          throw new Error('QUEST_ALREADY_CLAIMED')
        }

        // Verify requirements from today's matches
        const todayStart = new Date(`${today}T00:00:00.000Z`)
        const [stats] = await tx
          .select({
            matchesPlayed: sql<number>`count(*)::int`,
            correctGuesses: sql<number>`count(case when ${gamePlayer.guessCorrect} = true then 1 end)::int`,
          })
          .from(gamePlayer)
          .where(and(eq(gamePlayer.userId, userId), gte(gamePlayer.createdAt, todayStart)))

        const matches = stats?.matchesPlayed ?? 0
        const correct = stats?.correctGuesses ?? 0

        if (questId === 'play1') {
          if (matches < 1) throw new Error('REQUIREMENTS_NOT_MET')
          reward = 10
        } else if (questId === 'correct1') {
          if (correct < 1) throw new Error('REQUIREMENTS_NOT_MET')
          reward = 15
        } else if (questId === 'play3') {
          if (matches < 3) throw new Error('REQUIREMENTS_NOT_MET')
          reward = 20
        }

        const updatedClaimed = [...currentClaimed, questId]
        await tx
          .update(userDailyQuest)
          .set({
            claimedQuestIds: updatedClaimed,
            updatedAt: new Date(),
          })
          .where(eq(userDailyQuest.id, record.id))
      }

      // 3. Atomically credit tokens via TokenLedgerService
      const idempotencyKey = `quest_${questId}_${today}_${userId}_${record.adsWatchedCount}`
      const txResult = await tokenLedgerService.recordTransaction(
        {
          userId,
          amount: reward,
          type: questId === 'login' ? 'DAILY_CHECKIN' : 'QUEST_REWARD',
          referenceType: 'user_daily_quest',
          referenceId: record.id,
          idempotencyKey,
        },
        tx,
      )

      // 4. Return fresh state
      const freshQuests = await this.getTodayQuests(userId)

      return {
        reward,
        balanceAfter: txResult.balanceAfter,
        questsData: freshQuests,
      }
    })
  }
}

export const questsService = new QuestsService()

