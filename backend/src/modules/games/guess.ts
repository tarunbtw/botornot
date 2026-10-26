import crypto from 'crypto'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { game, gamePlayer } from '../../db/schema/games.js'
import { userProfile } from '../../db/schema/users.js'
import { tokenTransaction } from '../../db/schema/tokens.js'
import { env } from '../../config/env.js'

export interface SubmitGuessParams {
  gameId: string
  userId: string
  guess: 'HUMAN' | 'AI'
}

export class GuessService {
  async submitGuess(params: SubmitGuessParams) {
    return db.transaction(async (tx) => {
      // 1. Fetch game and player
      const gameRecord = await tx.query.game.findFirst({
        where: eq(game.id, params.gameId),
      })
      if (!gameRecord) {
        throw new Error('GAME_NOT_FOUND')
      }

      const now = new Date()
      const isPastInitial =
        gameRecord.initialEndsAt && now.getTime() >= gameRecord.initialEndsAt.getTime() - 3000
      if (!['INITIAL_ENDED', 'GUESSING'].includes(gameRecord.status) && !isPastInitial) {
        throw new Error('GAME_NOT_IN_GUESSING_STATE')
      }

      const player = await tx.query.gamePlayer.findFirst({
        where: and(eq(gamePlayer.gameId, params.gameId), eq(gamePlayer.userId, params.userId)),
      })
      if (!player) {
        throw new Error('NOT_IN_GAME')
      }

      // Check if already guessed
      if (player.guess) {
        throw new Error('GUESS_ALREADY_SUBMITTED')
      }

      // 2. Evaluate correctness and reward
      const isCorrect = params.guess === gameRecord.opponentType
      const reward = isCorrect ? env.REWARD_CORRECT : env.REWARD_WRONG
      const idempotencyKey = `guess_reward_${params.gameId}_${params.userId}`

      // 3. Update player record
      await tx
        .update(gamePlayer)
        .set({
          guess: params.guess,
          guessSubmittedAt: new Date(),
          guessCorrect: isCorrect,
          rewardAmount: reward,
        })
        .where(eq(gamePlayer.id, player.id))

      // 4. Fetch and update user profile & record token ledger
      const [profile] = await tx
        .select()
        .from(userProfile)
        .where(eq(userProfile.userId, params.userId))
        .for('update')

      if (!profile) {
        throw new Error('USER_PROFILE_NOT_FOUND')
      }

      const newBalance = profile.tokenBalance + reward
      const newTotalGames = profile.totalGames + 1
      const newTotalCorrect = profile.totalCorrectGuesses + (isCorrect ? 1 : 0)

      await tx
        .update(userProfile)
        .set({
          tokenBalance: newBalance,
          totalGames: newTotalGames,
          totalCorrectGuesses: newTotalCorrect,
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, params.userId))

      // 5. Insert token ledger transaction
      await tx.insert(tokenTransaction).values({
        id: crypto.randomUUID(),
        userId: params.userId,
        amount: reward,
        type: isCorrect ? 'GAME_REWARD_CORRECT' : 'GAME_REWARD_WRONG',
        referenceType: 'game',
        referenceId: params.gameId,
        idempotencyKey,
        balanceAfter: newBalance,
      })

      // 6. Check if all required players have guessed
      const allPlayers = await tx.query.gamePlayer.findMany({
        where: eq(gamePlayer.gameId, params.gameId),
      })
      const allGuessed = allPlayers.every(
        (p) => (p.userId === params.userId ? true : p.guess !== null),
      )

      if (allGuessed) {
        const nextStatus = gameRecord.opponentType === 'AI' ? 'COMPLETED' : 'RESOLVED'
        await tx
          .update(game)
          .set({ status: nextStatus, updatedAt: new Date() })
          .where(eq(game.id, params.gameId))
      }

      return {
        guess: params.guess,
        isCorrect,
        reward,
        actualOpponentType: gameRecord.opponentType,
        balanceAfter: newBalance,
        allGuessed,
      }
    })
  }
}

export const guessService = new GuessService()
