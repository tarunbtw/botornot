import crypto from 'crypto'
import type { FastifyPluginAsync } from 'fastify'
import { eq } from 'drizzle-orm'
import { requireAuth } from '../auth/middleware.js'
import { statsService } from '../modules/stats/service.js'
import { matchmakingService } from '../modules/matchmaking/queue.js'
import { connectionManager } from '../websocket/connection-manager.js'
import { db } from '../db/index.js'
import { user, session } from '../db/schema/auth.js'
import { userProfile } from '../db/schema/users.js'
import { generateUniquePublicId } from '../lib/public-id.js'

export const meRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const u = request.user!
    const stats = await statsService.getUserStats(u.id)

    if (!stats) {
      return reply.status(404).send({ error: 'PROFILE_NOT_FOUND' })
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      publicId: stats.publicId,
      tokenBalance: stats.tokenBalance,
      isPro: stats.isPro,
    }
  })

  fastify.get('/api/me/stats', { preHandler: [requireAuth] }, async (request, reply) => {
    const u = request.user!
    const stats = await statsService.getUserStats(u.id)

    if (!stats) {
      return reply.status(404).send({ error: 'PROFILE_NOT_FOUND' })
    }

    return stats
  })

  // Instant Guest / Anonymous Play (matches humanornot.so: no registration required to play)
  fastify.post('/api/auth/guest-session', async (_request, reply) => {
    const guestId = `guest_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`
    const guestName = 'Anonymous Human'
    const guestEmail = `${guestId}@guest.botornot.so`

    await db.insert(user).values({
      id: guestId,
      name: guestName,
      email: guestEmail,
      emailVerified: false,
    })

    const publicId = await generateUniquePublicId(8)
    await db.insert(userProfile).values({
      userId: guestId,
      publicId,
      tokenBalance: 10,
      isPro: false,
    })

    const sessionId = crypto.randomUUID()
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await db.insert(session).values({
      id: sessionId,
      token: sessionToken,
      userId: guestId,
      expiresAt,
    })

    reply.setCookie('better-auth.session_token', sessionToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      expires: expiresAt,
    })

    return {
      success: true,
      user: {
        id: guestId,
        name: guestName,
        email: guestEmail,
        publicId,
        tokenBalance: 10,
        isGuest: true,
      },
    }
  })

  // Delete Account (cascades sessions, profile, ledger, and disconnects active queues)
  fastify.delete('/api/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const userId = request.user!.id

    // Disconnect active socket connections and remove from matchmaking queue
    await matchmakingService.leaveQueue(userId).catch(() => {})
    connectionManager.disconnectUser(userId)

    // Cascade delete user record from database
    await db.delete(user).where(eq(user.id, userId))

    // Clear session cookies
    reply.clearCookie('better-auth.session_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
    })

    return { success: true, message: 'Account deleted successfully' }
  })
}
