import { pgTable, text, timestamp, boolean, integer, jsonb, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth.js'

export const userDailyQuest = pgTable(
  'user_daily_quest',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    date: text('date').notNull(), // 'YYYY-MM-DD' UTC
    loginStreak: integer('login_streak').notNull().default(1),
    loginClaimed: boolean('login_claimed').notNull().default(false),
    claimedQuestIds: jsonb('claimed_quest_ids').$type<string[]>().notNull().default([]),
    allClaimed: boolean('all_claimed').notNull().default(false),
    adsWatchedCount: integer('ads_watched_count').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('user_daily_quest_user_date_idx').on(table.userId, table.date),
  ],
)

