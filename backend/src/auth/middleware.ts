import type { FastifyRequest, FastifyReply } from 'fastify'
import type { IncomingMessage } from 'http'
import { eq, and, gt } from 'drizzle-orm'
import { db } from '../db/index.js'
import { session, user } from '../db/schema/auth.js'

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  image?: string | null
}

export interface AuthenticatedSession {
  id: string
  userId: string
  token?: string
  expiresAt: Date
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser
    session?: AuthenticatedSession
  }
}

/**
 * Direct lookup in database session table for guest / player sessions.
 */
async function verifySessionToken(
  rawToken: string,
): Promise<{ user: AuthenticatedUser; session: AuthenticatedSession } | null> {
  try {
    const cleanToken = rawToken.split('.')[0]?.trim()
    if (!cleanToken) return null

    const sessionRow = await db.query.session.findFirst({
      where: and(eq(session.token, cleanToken), gt(session.expiresAt, new Date())),
    })
    if (!sessionRow) return null

    const userRow = await db.query.user.findFirst({
      where: eq(user.id, sessionRow.userId),
    })
    if (!userRow) return null

    return {
      user: {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        image: userRow.image,
      },
      session: {
        id: sessionRow.id,
        userId: sessionRow.userId,
        token: sessionRow.token,
        expiresAt: sessionRow.expiresAt,
      },
    }
  } catch (err) {
    console.error('[verifySessionToken error]:', err)
    return null
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    let token = ''
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim()
    } else if (request.cookies && (request.cookies['session_token'] || request.cookies['better-auth.session_token'])) {
      token = request.cookies['session_token'] || request.cookies['better-auth.session_token'] || ''
    } else if (request.headers.cookie) {
      const match = request.headers.cookie.match(/(?:better-auth\.)?session_token=([^;]+)/)
      if (match && match[1]) {
        token = decodeURIComponent(match[1])
      }
    }

    if (token) {
      const direct = await verifySessionToken(token)
      if (direct) {
        request.user = direct.user
        request.session = direct.session
        return
      }
    }

    reply.status(401).send({
      error: 'UNAUTHORIZED',
      message: 'Active session required to play',
    })
  } catch {
    reply.status(401).send({
      error: 'UNAUTHORIZED',
      message: 'Authentication check failed',
    })
  }
}

export async function getWsSession(
  req: IncomingMessage,
): Promise<{ user: AuthenticatedUser; session: AuthenticatedSession } | null> {
  try {
    let token = ''
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim()
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/(?:better-auth\.)?session_token=([^;]+)/)
      if (match && match[1]) {
        token = decodeURIComponent(match[1])
      }
    }
    if (!token) {
      try {
        const url = new URL(req.url || '', 'http://localhost')
        token = url.searchParams.get('token') || url.searchParams.get('sessionToken') || ''
      } catch {
        // Ignore URL parse error
      }
    }

    if (token) {
      return await verifySessionToken(token)
    }

    return null
  } catch {
    return null
  }
}
