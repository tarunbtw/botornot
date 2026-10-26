import { redis } from '../../redis/index.js'
import { ATOMIC_MATCH_LUA, REMOVE_FROM_QUEUE_LUA } from './lua.js'
import { gameService } from '../games/state-machine.js'
import { env } from '../../config/env.js'

const QUEUE_KEY = 'matchmaking:queue'

export type MatchResult =
  | { matched: true; gameId: string; opponentType: 'HUMAN' | 'AI'; opponentUserId?: string }
  | { matched: false; waiting: true }

export class MatchmakingService {
  private activeTimeouts: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Enters the matchmaking queue.
   * Atomically checks for an available waiting opponent or adds user to queue.
   */
  async joinQueue(
    userId: string,
    onMatchFound: (result: { gameId: string; opponentType: 'HUMAN' | 'AI' }) => void,
  ): Promise<MatchResult> {
    // 1. Ensure user is not blocked by a previous active game
    const existing = await gameService.getActiveGameForUser(userId)
    if (existing) {
      throw new Error('ALREADY_IN_ACTIVE_GAME')
    }

    // 2. Execute atomic match script
    const now = Date.now()
    console.log(`[Matchmaking] User ${userId} entering atomic match queue...`)
    const matchedUserId = (await redis.eval(
      ATOMIC_MATCH_LUA,
      1,
      QUEUE_KEY,
      userId,
      now.toString(),
    )) as string | null

    if (matchedUserId) {
      console.log(`[Matchmaking] Atomic MATCH FOUND: ${userId} <-> ${matchedUserId}`)
      // Clear any pending AI timer for matched user if present
      this.clearUserTimeout(matchedUserId)
      this.clearUserTimeout(userId)

      // Create human game
      const game = await gameService.createHumanGame(userId, matchedUserId)
      return {
        matched: true,
        gameId: game.gameId,
        opponentType: 'HUMAN',
        opponentUserId: matchedUserId,
      }
    }

    // 3. User is waiting in queue: set fallback timer for AI match
    this.clearUserTimeout(userId)
    const timeout = setTimeout(async () => {
      this.activeTimeouts.delete(userId)
      // Check if user is still in the queue
      const removed = await redis.eval(REMOVE_FROM_QUEUE_LUA, 1, QUEUE_KEY, userId)
      if (removed === 1) {
        // Create AI game
        try {
          const aiGame = await gameService.createAIGame(userId)
          onMatchFound({
            gameId: aiGame.gameId,
            opponentType: 'AI',
          })
        } catch (err) {
          console.error('[Matchmaking] Failed to create AI fallback game:', err)
        }
      }
    }, env.MATCHMAKING_WAIT_MS)

    this.activeTimeouts.set(userId, timeout)

    return {
      matched: false,
      waiting: true,
    }
  }

  /**
   * Cancels waiting in queue or handles disconnect.
   */
  async leaveQueue(userId: string): Promise<boolean> {
    this.clearUserTimeout(userId)
    const removed = (await redis.eval(REMOVE_FROM_QUEUE_LUA, 1, QUEUE_KEY, userId)) as number
    return removed === 1
  }

  private clearUserTimeout(userId: string) {
    const timer = this.activeTimeouts.get(userId)
    if (timer) {
      clearTimeout(timer)
      this.activeTimeouts.delete(userId)
    }
  }
}

export const matchmakingService = new MatchmakingService()
