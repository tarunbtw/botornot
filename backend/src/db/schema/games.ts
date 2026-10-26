import { pgTable, text, timestamp, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth.js'

export const game = pgTable('game', {
  id: text('id').primaryKey(),
  status: text('status', {
    enum: [
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
    ],
  }).notNull().default('CREATED'),
  opponentType: text('opponent_type', { enum: ['HUMAN', 'AI'] }).notNull(),
  initialStartedAt: timestamp('initial_started_at'),
  initialEndsAt: timestamp('initial_ends_at'),
  initialEndedAt: timestamp('initial_ended_at'),
  firstSenderPlayerId: text('first_sender_player_id'),
  aiModel: text('ai_model'),
  aiSystemPromptVersion: text('ai_system_prompt_version'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const gamePlayer = pgTable(
  'game_player',
  {
    id: text('id').primaryKey(),
    gameId: text('game_id')
      .notNull()
      .references(() => game.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    side: text('side', { enum: ['A', 'B'] }).notNull(),
    guess: text('guess', { enum: ['HUMAN', 'AI'] }),
    guessSubmittedAt: timestamp('guess_submitted_at'),
    guessCorrect: boolean('guess_correct'),
    rewardAmount: integer('reward_amount').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('game_player_game_id_user_id_idx').on(table.gameId, table.userId),
  ],
)

export const chatSession = pgTable('chat_session', {
  id: text('id').primaryKey(),
  gameId: text('game_id')
    .notNull()
    .references(() => game.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['INITIAL', 'EXTENSION'] }).notNull().default('INITIAL'),
  status: text('status', { enum: ['PENDING', 'ACTIVE', 'ENDED'] }).notNull().default('PENDING'),
  startedAt: timestamp('started_at'),
  endsAt: timestamp('ends_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
