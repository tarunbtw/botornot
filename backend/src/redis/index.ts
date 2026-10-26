import { Redis } from 'ioredis'
import { env } from '../config/env.js'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000)
    return delay
  },
  lazyConnect: true,
})

redis.on('error', (err) => {
  // In development/test or before container start, log cleanly
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Redis Error]:', err.message)
  }
})

export async function initRedis(): Promise<void> {
  try {
    await redis.connect()
    console.log('[Redis] Connected successfully')
  } catch (err) {
    console.warn('[Redis] Could not connect immediately (will retry):', (err as Error).message)
  }
}
