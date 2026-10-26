import { pgTable, text, timestamp, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core'
import { game } from './games.js'
import { user } from './auth.js'

export const chatExtensionRequest = pgTable('chat_extension_request', {
  id: text('id').primaryKey(),
  gameId: text('game_id')
    .notNull()
    .references(() => game.id, { onDelete: 'cascade' }),
  requestingUserId: text('requesting_user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  status: text('status', {
    enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'CANCELLED'],
  }).notNull().default('PENDING'),
  cost: integer('cost').notNull(),
  requesterIsProAtTime: boolean('requester_is_pro_at_time').notNull().default(false),
  requestedAt: timestamp('requested_at').notNull().defaultNow(),
  respondedAt: timestamp('responded_at'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const subscription = pgTable(
  'subscription',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerSubscriptionId: text('provider_subscription_id').notNull(),
    status: text('status').notNull(),
    startsAt: timestamp('starts_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('subscription_provider_sub_idx').on(table.providerSubscriptionId),
  ],
)
