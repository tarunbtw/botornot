import crypto from 'crypto'
import { eq, and } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { game, gamePlayer, chatSession } from '../../db/schema/games.js'
import { chatExtensionRequest } from '../../db/schema/subscriptions.js'
import { tokenLedgerService } from '../tokens/ledger.js'
import { entitlementService } from '../subscriptions/entitlement.js'
import { env } from '../../config/env.js'

export class ExtensionService {
  /**
   * User initiates an extension request for a resolved human game.
   */
  async requestExtension(gameId: string, requestingUserId: string) {
    const gameRecord = await db.query.game.findFirst({
      where: eq(game.id, gameId),
    })

    if (!gameRecord) {
      throw new Error('GAME_NOT_FOUND')
    }

    if (gameRecord.opponentType !== 'HUMAN') {
      throw new Error('AI_GAMES_CANNOT_BE_EXTENDED')
    }

    if (!['RESOLVED', 'EXTENSION_PENDING'].includes(gameRecord.status)) {
      throw new Error('GAME_NOT_RESOLVED_FOR_EXTENSION')
    }

    // Verify requesting user belongs to game
    const players = await db.query.gamePlayer.findMany({
      where: eq(gamePlayer.gameId, gameId),
    })

    const requester = players.find((p) => p.userId === requestingUserId)
    const opponent = players.find((p) => p.userId !== requestingUserId)

    if (!requester || !opponent) {
      throw new Error('INVALID_GAME_PARTICIPANTS')
    }

    // Check if an extension session is already active
    const activeExtension = await db.query.chatSession.findFirst({
      where: and(
        eq(chatSession.gameId, gameId),
        eq(chatSession.type, 'EXTENSION'),
        eq(chatSession.status, 'ACTIVE'),
      ),
    })
    if (activeExtension) {
      throw new Error('EXTENSION_ALREADY_ACTIVE')
    }

    // Check Pro status of requester
    const isPro = await entitlementService.hasActivePro(requestingUserId)
    const cost = isPro ? 0 : env.CHAT_EXTENSION_TOKEN_COST

    // If requester is not Pro, verify balance before submitting
    if (!isPro) {
      const balance = await tokenLedgerService.getBalance(requestingUserId)
      if (balance < cost) {
        throw new Error('INSUFFICIENT_TOKEN_BALANCE')
      }
    }

    // Check Pro status of target user to inform them of their actual cost
    const targetIsPro = await entitlementService.hasActivePro(opponent.userId)
    const targetCost = targetIsPro ? 0 : env.CHAT_EXTENSION_TOKEN_COST

    const now = new Date()
    const expiresAt = new Date(now.getTime() + env.EXTENSION_REQUEST_TTL_SECONDS * 1000)
    const requestId = crypto.randomUUID()

    await db.insert(chatExtensionRequest).values({
      id: requestId,
      gameId,
      requestingUserId,
      status: 'PENDING',
      cost: env.CHAT_EXTENSION_TOKEN_COST,
      requesterIsProAtTime: isPro,
      requestedAt: now,
      expiresAt,
    })

    await db
      .update(game)
      .set({ status: 'EXTENSION_PENDING', updatedAt: now })
      .where(eq(game.id, gameId))

    return {
      requestId,
      gameId,
      requestingUserId,
      targetUserId: opponent.userId,
      cost: targetCost,
      expiresAt,
    }
  }

  /**
   * Opponent responds to the extension request (ACCEPT or DECLINE).
   */
  async respondExtension(
    requestId: string,
    respondingUserId: string,
    accept: boolean,
  ) {
    const extReq = await db.query.chatExtensionRequest.findFirst({
      where: eq(chatExtensionRequest.id, requestId),
    })

    if (!extReq) {
      throw new Error('EXTENSION_REQUEST_NOT_FOUND')
    }

    if (extReq.status !== 'PENDING') {
      throw new Error('EXTENSION_REQUEST_NOT_PENDING')
    }

    if (new Date() > new Date(extReq.expiresAt)) {
      await db
        .update(chatExtensionRequest)
        .set({ status: 'EXPIRED', respondedAt: new Date() })
        .where(eq(chatExtensionRequest.id, requestId))
      throw new Error('EXTENSION_REQUEST_EXPIRED')
    }

    if (extReq.requestingUserId === respondingUserId) {
      throw new Error('CANNOT_RESPOND_TO_OWN_REQUEST')
    }

    // Verify responder belongs to game
    const players = await db.query.gamePlayer.findMany({
      where: eq(gamePlayer.gameId, extReq.gameId),
    })
    const isParticipant = players.some((p) => p.userId === respondingUserId)
    if (!isParticipant) {
      throw new Error('NOT_AUTHORIZED_FOR_THIS_GAME')
    }

    if (!accept) {
      // Mark DECLINED
      await db
        .update(chatExtensionRequest)
        .set({ status: 'DECLINED', respondedAt: new Date() })
        .where(eq(chatExtensionRequest.id, requestId))

      await db
        .update(game)
        .set({ status: 'COMPLETED', updatedAt: new Date() })
        .where(eq(game.id, extReq.gameId))

      return {
        accepted: false as const,
        gameId: extReq.gameId,
      }
    }

    // Check responder balance before transaction if accepting and not Pro
    const userBIsProEarly = await entitlementService.hasActivePro(respondingUserId)
    if (!userBIsProEarly) {
      const bBalance = await tokenLedgerService.getBalance(respondingUserId)
      if (bBalance < env.CHAT_EXTENSION_TOKEN_COST) {
        throw new Error('INSUFFICIENT_TOKEN_BALANCE')
      }
    }

    // ACCEPT: Execute atomic transaction
    return db.transaction(async (tx) => {
      const userAId = extReq.requestingUserId
      const userBId = respondingUserId

      const userAIsPro = await entitlementService.hasActivePro(userAId)
      const userBIsPro = await entitlementService.hasActivePro(userBId)

      const cost = env.CHAT_EXTENSION_TOKEN_COST

      // Debit User A if not Pro
      if (!userAIsPro) {
        await tokenLedgerService.recordTransaction(
          {
            userId: userAId,
            amount: -cost,
            type: 'CHAT_EXTENSION_DEBIT',
            referenceType: 'game',
            referenceId: extReq.gameId,
            idempotencyKey: `ext_debit_${requestId}_${userAId}`,
          },
          tx,
        )
      }

      // Debit User B if not Pro
      if (!userBIsPro) {
        await tokenLedgerService.recordTransaction(
          {
            userId: userBId,
            amount: -cost,
            type: 'CHAT_EXTENSION_DEBIT',
            referenceType: 'game',
            referenceId: extReq.gameId,
            idempotencyKey: `ext_debit_${requestId}_${userBId}`,
          },
          tx,
        )
      }

      // Create new EXTENSION chat_session
      const newSessionId = crypto.randomUUID()
      const now = new Date()
      const endsAt = new Date(now.getTime() + env.CHAT_EXTENSION_SECONDS * 1000)

      await tx.insert(chatSession).values({
        id: newSessionId,
        gameId: extReq.gameId,
        type: 'EXTENSION',
        status: 'ACTIVE',
        startedAt: now,
        endsAt,
      })

      // Update game and request status
      await tx
        .update(game)
        .set({ status: 'EXTENSION_ACTIVE', updatedAt: now })
        .where(eq(game.id, extReq.gameId))

      await tx
        .update(chatExtensionRequest)
        .set({ status: 'ACCEPTED', respondedAt: now })
        .where(eq(chatExtensionRequest.id, requestId))

      return {
        accepted: true as const,
        gameId: extReq.gameId,
        sessionId: newSessionId,
        startedAt: now,
        endsAt,
        players: [userAId, userBId],
      }
    })
  }
}

export const extensionService = new ExtensionService()
