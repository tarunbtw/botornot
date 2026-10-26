import crypto from 'crypto'
import { eq, and, sql, asc } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { chatMessage } from '../../db/schema/messages.js'
import { chatSession, game, gamePlayer } from '../../db/schema/games.js'
import { env } from '../../config/env.js'
import { aiService } from '../ai/openrouter.js'

export interface SendMessageParams {
  gameId: string
  userId: string
  content: string
}

export class ChatService {
  private lastMessageTime: Map<string, number> = new Map()
  private pendingAIGenerations: Set<string> = new Set()

  /**
   * Validates and persists a user message into the active chat session.
   */
  async handleUserMessage(
    params: SendMessageParams,
    onAiDelta?: (delta: string) => void,
    onAiDone?: (message: { id: string; content: string; sequenceNumber: number }) => void,
  ) {
    const trimmed = params.content.trim()
    if (!trimmed) {
      throw new Error('MESSAGE_EMPTY')
    }
    if (trimmed.length > env.MAX_MESSAGE_LENGTH) {
      throw new Error('MESSAGE_TOO_LONG')
    }

    // Rate limiting: max 1 message per 800ms per user
    const nowMs = Date.now()
    const lastTime = this.lastMessageTime.get(params.userId) || 0
    if (nowMs - lastTime < 800) {
      throw new Error('RATE_LIMITED')
    }
    this.lastMessageTime.set(params.userId, nowMs)

    // 1. Fetch game and active session
    const gameRecord = await db.query.game.findFirst({
      where: eq(game.id, params.gameId),
    })
    if (!gameRecord || !['ACTIVE', 'EXTENSION_ACTIVE'].includes(gameRecord.status)) {
      throw new Error('GAME_NOT_ACTIVE')
    }

    // Verify user is in game
    const player = await db.query.gamePlayer.findFirst({
      where: and(eq(gamePlayer.gameId, params.gameId), eq(gamePlayer.userId, params.userId)),
    })
    if (!player) {
      throw new Error('NOT_IN_GAME')
    }

    // Find active chat session
    const session = await db.query.chatSession.findFirst({
      where: and(eq(chatSession.gameId, params.gameId), eq(chatSession.status, 'ACTIVE')),
      orderBy: [asc(chatSession.createdAt)],
    })
    if (!session || !session.endsAt) {
      throw new Error('NO_ACTIVE_SESSION')
    }

    // Check expiry
    if (new Date() >= new Date(session.endsAt)) {
      throw new Error('SESSION_EXPIRED')
    }

    // Check first-sender rule if this is the first message in the session
    const messageCountRes = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(chatMessage)
      .where(eq(chatMessage.sessionId, session.id))
    const existingCount = messageCountRes[0]?.count || 0

    if (existingCount === 0 && gameRecord.firstSenderPlayerId) {
      if (gameRecord.firstSenderPlayerId !== params.userId) {
        throw new Error('NOT_YOUR_TURN_FIRST')
      }
    }

    // 2. Persist the user message atomically
    const messageId = crypto.randomUUID()
    const nextSeq = existingCount + 1

    await db.insert(chatMessage).values({
      id: messageId,
      gameId: params.gameId,
      sessionId: session.id,
      senderType: 'HUMAN',
      senderUserId: params.userId,
      sequenceNumber: nextSeq,
      content: trimmed,
    })

    const persistedUserMsg = {
      id: messageId,
      gameId: params.gameId,
      sessionId: session.id,
      senderType: 'HUMAN' as const,
      senderUserId: params.userId,
      sequenceNumber: nextSeq,
      content: trimmed,
      createdAt: new Date(),
    }

    // 3. If opponent is AI, trigger background AI streaming response
    if (gameRecord.opponentType === 'AI') {
      this.triggerAIResponse(
        gameRecord.id,
        session.id,
        session.endsAt,
        onAiDelta,
        onAiDone,
      ).catch((err) => {
        console.error('[Chat] AI generation error:', err)
      })
    }

    return persistedUserMsg
  }

  /**
   * Generates AI message when it is AI's first turn or replying.
   */
  async triggerAIResponse(
    gameId: string,
    sessionId: string,
    sessionEndsAt: Date,
    onAiDelta?: (delta: string) => void,
    onAiDone?: (msg: { id: string; content: string; sequenceNumber: number }) => void,
  ) {
    // Check if session already expired or generation is already in progress
    if (new Date() >= new Date(sessionEndsAt) || this.pendingAIGenerations.has(sessionId)) return
    this.pendingAIGenerations.add(sessionId)

    // Fetch conversation messages
    const history = await db.query.chatMessage.findMany({
      where: eq(chatMessage.sessionId, sessionId),
      orderBy: [asc(chatMessage.sequenceNumber)],
    })

    const abortController = new AbortController()
    const timeoutMs = Math.max(0, new Date(sessionEndsAt).getTime() - Date.now())
    const timer = setTimeout(() => abortController.abort(), timeoutMs)

    try {
      const aiResponse = await aiService.generateStreamingResponse({
        messages: history.map((m) => ({
          senderType: m.senderType as 'HUMAN' | 'AI',
          content: m.content,
        })),
        signal: abortController.signal,
        onDelta: onAiDelta,
      })

      clearTimeout(timer)
      if (!aiResponse) return

      // Persist completed AI message
      const nextSeq = history.length + 1
      const aiMsgId = crypto.randomUUID()

      await db.insert(chatMessage).values({
        id: aiMsgId,
        gameId,
        sessionId,
        senderType: 'AI',
        senderUserId: null,
        sequenceNumber: nextSeq,
        content: aiResponse,
      })

      if (onAiDone) {
        onAiDone({
          id: aiMsgId,
          content: aiResponse,
          sequenceNumber: nextSeq,
        })
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[Chat] AI response failed:', err)
      }
    } finally {
      clearTimeout(timer)
      this.pendingAIGenerations.delete(sessionId)
    }
  }

  async getMessagesForGame(gameId: string) {
    return db.query.chatMessage.findMany({
      where: eq(chatMessage.gameId, gameId),
      orderBy: [asc(chatMessage.sequenceNumber)],
    })
  }
}

export const chatService = new ChatService()
