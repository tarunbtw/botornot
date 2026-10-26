import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db, sql } from './index.js'

async function runMigrations() {
  console.log('[db:migrate] Running migrations...')
  try {
    await migrate(db, { migrationsFolder: './src/db/migrations' })
    console.log('[db:migrate] Migrations completed successfully.')
  } catch (error) {
    console.error('[db:migrate] Migration error:', error)
    process.exit(1)
  } finally {
    await sql.end()
  }
}

runMigrations()
