import { eq, and, lte } from 'drizzle-orm'
import { db } from '../db/index.js'
import { chatSession, game } from '../db/schema/games.js'
import { chatExtensionRequest } from '../db/schema/subscriptions.js'

export type ExpiryNotifyCallback = (event: {
  type: 'session.ended' | 'guess.request' | 'extension.expired'
  gameId: string
  sessionId?: string
  requestId?: string
}) => void

export class ExpiryWorker {
  private timer: NodeJS.Timeout | null = null
  private notifyCallback: ExpiryNotifyCallback | null = null

  setNotifyCallback(callback: ExpiryNotifyCallback) {
    this.notifyCallback = callback
  }

  start(intervalMs = 2000) {
    if (this.timer) return
    this.timer = setInterval(() => {
      this.reconcile().catch((err) => {
        console.error('[ExpiryWorker] Error during reconciliation:', err)
      })
    }, intervalMs)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  async reconcile() {
    const now = new Date()

    // 1. Reconcile expired chat sessions
    const expiredSessions = await db.query.chatSession.findMany({
      where: and(eq(chatSession.status, 'ACTIVE'), lte(chatSession.endsAt, now)),
    })

    for (const s of expiredSessions) {
      // Transition session from ACTIVE to ENDED atomically
      await db
        .update(chatSession)
        .set({ status: 'ENDED', endedAt: now })
        .where(and(eq(chatSession.id, s.id), eq(chatSession.status, 'ACTIVE')))

      if (s.type === 'INITIAL') {
        await db
          .update(game)
          .set({ status: 'GUESSING', initialEndedAt: now, updatedAt: now })
          .where(and(eq(game.id, s.gameId), eq(game.status, 'ACTIVE')))

        if (this.notifyCallback) {
          this.notifyCallback({
            type: 'session.ended',
            gameId: s.gameId,
            sessionId: s.id,
          })
          this.notifyCallback({
            type: 'guess.request',
            gameId: s.gameId,
          })
        }
      } else if (s.type === 'EXTENSION') {
        await db
          .update(game)
          .set({ status: 'COMPLETED', updatedAt: now })
          .where(and(eq(game.id, s.gameId), eq(game.status, 'EXTENSION_ACTIVE')))

        if (this.notifyCallback) {
          this.notifyCallback({
            type: 'session.ended',
            gameId: s.gameId,
            sessionId: s.id,
          })
        }
      }
    }

    // 2. Reconcile expired extension requests
    const expiredRequests = await db.query.chatExtensionRequest.findMany({
      where: and(
        eq(chatExtensionRequest.status, 'PENDING'),
        lte(chatExtensionRequest.expiresAt, now),
      ),
    })

    for (const req of expiredRequests) {
      await db
        .update(chatExtensionRequest)
        .set({ status: 'EXPIRED', respondedAt: now })
        .where(
          and(
            eq(chatExtensionRequest.id, req.id),
            eq(chatExtensionRequest.status, 'PENDING'),
          ),
        )

      if (this.notifyCallback) {
        this.notifyCallback({
          type: 'extension.expired',
          gameId: req.gameId,
          requestId: req.id,
        })
      }
    }
  }
}

export const expiryWorker = new ExpiryWorker()
