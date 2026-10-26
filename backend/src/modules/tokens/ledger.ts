import crypto from 'crypto'
import { eq } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { userProfile } from '../../db/schema/users.js'
import { tokenTransaction } from '../../db/schema/tokens.js'

export type TransactionType =
  | 'GAME_REWARD_CORRECT'
  | 'GAME_REWARD_WRONG'
  | 'CHAT_EXTENSION_DEBIT'
  | 'PURCHASE_CREDIT'
  | 'ADMIN_ADJUSTMENT'
  | 'REFUND'

export interface RecordTransactionParams {
  userId: string
  amount: number
  type: TransactionType
  referenceType?: string
  referenceId?: string
  idempotencyKey?: string
  metadata?: Record<string, unknown>
}

export class TokenLedgerService {
  /**
   * Records a token balance adjustment inside an atomic transaction.
   * Ensures balance never goes below zero.
   * Enforces idempotency via idempotencyKey.
   */
  async recordTransaction(
    params: RecordTransactionParams,
    externalTx?: Parameters<Parameters<typeof db.transaction>[0]>[0],
  ): Promise<{ transactionId: string; balanceAfter: number }> {
    const runInTx = async (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => {
      // 1. Check idempotency if key provided
      if (params.idempotencyKey) {
        const existing = await tx.query.tokenTransaction.findFirst({
          where: eq(tokenTransaction.idempotencyKey, params.idempotencyKey),
        })
        if (existing) {
          return {
            transactionId: existing.id,
            balanceAfter: existing.balanceAfter,
          }
        }
      }

      // 2. Fetch and lock profile or check current balance
      const [profile] = await tx
        .select()
        .from(userProfile)
        .where(eq(userProfile.userId, params.userId))
        .for('update')

      if (!profile) {
        throw new Error(`User profile not found for user: ${params.userId}`)
      }

      const newBalance = profile.tokenBalance + params.amount
      if (newBalance < 0) {
        throw new Error('INSUFFICIENT_TOKEN_BALANCE')
      }

      // 3. Update profile balance
      await tx
        .update(userProfile)
        .set({
          tokenBalance: newBalance,
          updatedAt: new Date(),
        })
        .where(eq(userProfile.userId, params.userId))

      // 4. Insert transaction record
      const txId = crypto.randomUUID()
      await tx.insert(tokenTransaction).values({
        id: txId,
        userId: params.userId,
        amount: params.amount,
        type: params.type,
        referenceType: params.referenceType,
        referenceId: params.referenceId,
        idempotencyKey: params.idempotencyKey,
        balanceAfter: newBalance,
        metadata: params.metadata,
      })

      return { transactionId: txId, balanceAfter: newBalance }
    }

    if (externalTx) {
      return runInTx(externalTx)
    }

    return db.transaction(runInTx)
  }

  async getBalance(userId: string): Promise<number> {
    const profile = await db.query.userProfile.findFirst({
      where: eq(userProfile.userId, userId),
    })
    return profile ? profile.tokenBalance : 0
  }
}

export const tokenLedgerService = new TokenLedgerService()
