import crypto from 'crypto'
import { eq, and, inArray } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { game, gamePlayer, chatSession } from '../../db/schema/games.js'
import { env } from '../../config/env.js'

export const GAME_STATES = [
  'CREATED',
  'MATCHED',
  'ACTIVE',
  'INITIAL_ENDED',
  'GUESSING',
  'RESOLVED',
  'EXTENSION_PENDING',
  'EXTENSION_ACTIVE',
  'COMPLETED',
  'CANCELLED',
] as const

export type GameStatus = (typeof GAME_STATES)[number]

export class GameService {
  /**
   * Checks if a user is currently participating in an active/unfinished game.
   */
  async getActiveGameForUser(userId: string) {
    const activePlayerRecords = await db
      .select({
        game: game,
        player: gamePlayer,
      })
      .from(gamePlayer)
      .innerJoin(game, eq(gamePlayer.gameId, game.id))
      .where(
        and(
          eq(gamePlayer.userId, userId),
          inArray(game.status, ['CREATED', 'MATCHED', 'ACTIVE', 'INITIAL_ENDED', 'GUESSING', 'EXTENSION_PENDING', 'EXTENSION_ACTIVE']),
        ),
      )
      .limit(1)

    const record = activePlayerRecords[0] || null
    if (!record) return null

    const now = Date.now()
    const endsAt = record.game.initialEndsAt ? new Date(record.game.initialEndsAt).getTime() : 0

    // If player has already submitted their guess and no extension is in progress, they are free to queue
    if (record.player.guess && !['EXTENSION_PENDING', 'EXTENSION_ACTIVE'].includes(record.game.status)) {
      return null
    }

    // If the game ended in the past and is past grace period (90s for guessing), auto-complete it
    if (endsAt > 0 && now > endsAt + 90000 && ['INITIAL_ENDED', 'GUESSING', 'ACTIVE'].includes(record.game.status)) {
      await db
        .update(game)
        .set({ status: 'COMPLETED', updatedAt: new Date() })
        .where(eq(game.id, record.game.id))
      return null
    }

    return record
  }

  /**
   * Atomically creates a Human vs Human game.
   */
  async createHumanGame(userAId: string, userBId: string) {
    return db.transaction(async (tx) => {
      const gameId = crypto.randomUUID()
      const sessionId = crypto.randomUUID()
      const now = new Date()
      const durationSeconds = env.GAME_INITIAL_DURATION_SECONDS
      const endsAt = new Date(now.getTime() + durationSeconds * 1000)

      // Random first sender: userA or userB
      const firstSenderUserId = Math.random() < 0.5 ? userAId : userBId

      // 1. Insert Game
      await tx.insert(game).values({
        id: gameId,
        status: 'ACTIVE',
        opponentType: 'HUMAN',
        initialStartedAt: now,
        initialEndsAt: endsAt,
        firstSenderPlayerId: firstSenderUserId,
      })

      // 2. Insert Game Players
      await tx.insert(gamePlayer).values([
        {
          id: crypto.randomUUID(),
          gameId,
          userId: userAId,
          side: 'A',
        },
        {
          id: crypto.randomUUID(),
          gameId,
          userId: userBId,
          side: 'B',
        },
      ])

      // 3. Insert Initial Chat Session
      await tx.insert(chatSession).values({
        id: sessionId,
        gameId,
        type: 'INITIAL',
        status: 'ACTIVE',
        startedAt: now,
        endsAt,
      })

      return {
        gameId,
        sessionId,
        opponentType: 'HUMAN' as const,
        firstSenderPlayerId: firstSenderUserId,
        startedAt: now,
        endsAt,
        players: [userAId, userBId],
      }
    })
  }

  /**
   * Atomically creates a Human vs AI game.
   */
  async createAIGame(userId: string) {
    return db.transaction(async (tx) => {
      const gameId = crypto.randomUUID()
      const sessionId = crypto.randomUUID()
      const now = new Date()
      const durationSeconds = env.GAME_INITIAL_DURATION_SECONDS
      const endsAt = new Date(now.getTime() + durationSeconds * 1000)

      // Random first sender: Human (userId) or AI ('AI')
      const firstSenderId = Math.random() < 0.5 ? userId : 'AI'

      // 1. Insert Game
      await tx.insert(game).values({
        id: gameId,
        status: 'ACTIVE',
        opponentType: 'AI',
        initialStartedAt: now,
        initialEndsAt: endsAt,
        firstSenderPlayerId: firstSenderId,
        aiModel: env.OPENROUTER_MODEL,
        aiSystemPromptVersion: 'v1',
      })

      // 2. Insert Game Player
      await tx.insert(gamePlayer).values({
        id: crypto.randomUUID(),
        gameId,
        userId,
        side: 'A',
      })

      // 3. Insert Initial Chat Session
      await tx.insert(chatSession).values({
        id: sessionId,
        gameId,
        type: 'INITIAL',
        status: 'ACTIVE',
        startedAt: now,
        endsAt,
      })

      return {
        gameId,
        sessionId,
        opponentType: 'AI' as const,
        firstSenderPlayerId: firstSenderId,
        startedAt: now,
        endsAt,
        players: [userId],
      }
    })
  }

  /**
   * Transition game status safely.
   */
  async updateGameStatus(gameId: string, fromStatus: GameStatus, toStatus: GameStatus): Promise<boolean> {
    await db
      .update(game)
      .set({ status: toStatus, updatedAt: new Date() })
      .where(and(eq(game.id, gameId), eq(game.status, fromStatus)))
    return true
  }

  /**
   * Fetches game details by ID.
   */
  async getGameById(gameId: string) {
    const gameRecord = await db.query.game.findFirst({
      where: eq(game.id, gameId),
    })
    if (!gameRecord) return null

    const players = await db.query.gamePlayer.findMany({
      where: eq(gamePlayer.gameId, gameId),
    })

    const sessions = await db.query.chatSession.findMany({
      where: eq(chatSession.gameId, gameId),
    })

    return {
      ...gameRecord,
      players,
      sessions,
    }
  }
}

export const gameService = new GameService()
