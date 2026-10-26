import { pgTable, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import { user } from './auth.js'

export const userProfile = pgTable('user_profile', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  publicId: text('public_id').notNull().unique(),
  tokenBalance: integer('token_balance').notNull().default(10),
  isPro: boolean('is_pro').notNull().default(false),
  proExpiresAt: timestamp('pro_expires_at'),
  totalGames: integer('total_games').notNull().default(0),
  totalCorrectGuesses: integer('total_correct_guesses').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
