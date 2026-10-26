import { pgTable, text, timestamp, integer, index } from 'drizzle-orm/pg-core'
import { game, chatSession } from './games.js'
import { user } from './auth.js'

export const chatMessage = pgTable(
  'chat_message',
  {
    id: text('id').primaryKey(),
    gameId: text('game_id')
      .notNull()
      .references(() => game.id, { onDelete: 'cascade' }),
    sessionId: text('session_id')
      .notNull()
      .references(() => chatSession.id, { onDelete: 'cascade' }),
    senderType: text('sender_type', { enum: ['HUMAN', 'AI'] }).notNull(),
    senderUserId: text('sender_user_id').references(() => user.id, { onDelete: 'set null' }),
    sequenceNumber: integer('sequence_number').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('chat_message_game_id_seq_idx').on(table.gameId, table.sequenceNumber),
    index('chat_message_session_id_idx').on(table.sessionId),
  ],
)
