import { pgTable, text, timestamp, integer, jsonb, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth.js'

export const tokenTransaction = pgTable(
  'token_transaction',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    type: text('type', {
      enum: [
        'GAME_REWARD_CORRECT',
        'GAME_REWARD_WRONG',
        'CHAT_EXTENSION_DEBIT',
        'PURCHASE_CREDIT',
        'ADMIN_ADJUSTMENT',
        'REFUND',
      ],
    }).notNull(),
    referenceType: text('reference_type'),
    referenceId: text('reference_id'),
    idempotencyKey: text('idempotency_key'),
    balanceAfter: integer('balance_after').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('token_transaction_idempotency_idx').on(table.idempotencyKey),
  ],
)
