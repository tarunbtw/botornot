import type { FastifyRequest, FastifyReply } from 'fastify'
import type { IncomingMessage } from 'http'
import { eq, and, gt } from 'drizzle-orm'
import { auth } from './auth.js'
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
 * Direct lookup in database session table.
 * Fallback when cookies are unsigned or cross-origin headers don't match Better Auth cookie parsing.
 */
async function verifyDirectSessionToken(
  rawToken: string,
): Promise<{ user: AuthenticatedUser; session: AuthenticatedSession } | null> {
  try {
    const cleanToken = rawToken.split('.')[0]
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
    console.error('[verifyDirectSessionToken error]:', err)
    return null
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    // 1. Try Better Auth's standard session parser
    const headers = new Headers()
    for (const [key, value] of Object.entries(request.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v))
        } else {
          headers.set(key, value)
        }
      }
    }

    const betterAuthSession = await auth.api.getSession({
      headers,
    })

    if (betterAuthSession && betterAuthSession.user) {
      request.user = betterAuthSession.user as AuthenticatedUser
      request.session = {
        id: betterAuthSession.session.id,
        userId: betterAuthSession.session.userId,
        token: (betterAuthSession.session as any).token,
        expiresAt: new Date(betterAuthSession.session.expiresAt),
      }
      return
    }

    // 2. Direct session fallback from Authorization header or cookie
    let token = ''
    const authHeader = request.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim()
    } else if (request.cookies && request.cookies['better-auth.session_token']) {
      token = request.cookies['better-auth.session_token']
    } else if (request.headers.cookie) {
      const match = request.headers.cookie.match(/better-auth\.session_token=([^;]+)/)
      if (match && match[1]) {
        token = decodeURIComponent(match[1])
      }
    }

    if (token) {
      const direct = await verifyDirectSessionToken(token)
      if (direct) {
        request.user = direct.user
        request.session = direct.session
        return
      }
    }

    reply.status(401).send({
      error: 'UNAUTHORIZED',
      message: 'You must be signed in to perform this action',
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
    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v))
        } else {
          headers.set(key, value)
        }
      }
    }

    // 1. Try Better Auth getSession
    const betterAuthSession = await auth.api.getSession({ headers })
    if (betterAuthSession && betterAuthSession.user) {
      return {
        user: betterAuthSession.user as AuthenticatedUser,
        session: betterAuthSession.session as unknown as AuthenticatedSession,
      }
    }

    // 2. Fallback: extract token from query param (?token=...), Authorization header, or cookie
    let token = ''
    try {
      const url = new URL(req.url || '', 'http://localhost')
      token = url.searchParams.get('token') || url.searchParams.get('sessionToken') || ''
    } catch {
      // Ignore URL parse error
    }

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7).trim()
    }

    if (!token && req.headers.cookie) {
      const match = req.headers.cookie.match(/better-auth\.session_token=([^;]+)/)
      if (match && match[1]) {
        token = decodeURIComponent(match[1])
      }
    }

    if (token) {
      const direct = await verifyDirectSessionToken(token)
      if (direct) {
        return direct
      }
    }

    return null
  } catch {
    return null
  }
}

