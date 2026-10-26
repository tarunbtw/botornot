import { buildApp } from './app.js'
import { env } from './config/env.js'
import { initRedis, redis } from './redis/index.js'
import { expiryWorker } from './jobs/expiry-worker.js'
import { sql } from './db/index.js'

async function main() {
  const app = buildApp()

  // Connect Redis
  await initRedis()

  // Start background timer reconciliation worker
  expiryWorker.start(2000)

  // Listen
  try {
    await app.listen({ port: env.PORT, host: env.HOST })
    console.log(`[BotOrNot Backend] Server listening on ${env.HOST}:${env.PORT}`)
    console.log(`  ➜ Local:   http://localhost:${env.PORT}`)
    console.log(`  ➜ Network: http://0.0.0.0:${env.PORT} (listening on all local network interfaces)`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('[BotOrNot Backend] Shutting down...')
    expiryWorker.stop()
    await app.close().catch(() => {})
    await redis.quit().catch(() => {})
    await sql.end({ timeout: 1 }).catch(() => {})
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main()
