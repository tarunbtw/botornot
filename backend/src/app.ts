import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyCookie from '@fastify/cookie'
import fastifyWebsocket from '@fastify/websocket'
import { env } from './config/env.js'
import { getWsSession } from './auth/middleware.js'
import { handleWebSocketConnection } from './websocket/router.js'
import { connectionManager } from './websocket/connection-manager.js'
import { expiryWorker } from './jobs/expiry-worker.js'
import { healthRoutes } from './routes/health.js'
import { meRoutes } from './routes/me.js'
import { gamesRoutes } from './routes/games.js'
import { questsRoutes } from './routes/quests.js'
import { statsRoutes } from './routes/stats.js'

export function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  })

  function isOriginAllowed(origin?: string): boolean {
    if (!origin) return true
    if (env.CLIENT_ORIGIN === '*' || origin === env.CLIENT_ORIGIN) return true
    if (env.CLIENT_ORIGIN.split(',').map((s) => s.trim()).includes(origin)) return true
    try {
      const hostname = new URL(origin).hostname
      if (
        hostname.endsWith('.vercel.app') ||
        hostname === 'vercel.app' ||
        hostname.endsWith('.crazygames.com') ||
        hostname.endsWith('.gamebox.com') ||
        hostname === 'crazygames.com' ||
        hostname.endsWith('.1001juegos.com') ||
        hostname.endsWith('.speelspelletjes.nl') ||
        hostname.endsWith('.railway.app')
      ) {
        return true
      }
    } catch {}
    return (
      /^http:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
        origin,
      )
    )
  }

  // CORS
  app.register(fastifyCors, {
    origin: (origin, cb) => cb(null, isOriginAllowed(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })

  // Cookies
  app.register(fastifyCookie)

  // WebSockets
  app.register(fastifyWebsocket)

  // REST Routes
  app.register(healthRoutes)
  app.register(meRoutes)
  app.register(gamesRoutes)
  app.register(questsRoutes)
  app.register(statsRoutes)

  // Authenticated WebSocket Route
  app.register(async (fastify) => {
    fastify.get('/ws', { websocket: true }, (socket, req) => {
      // CSWSH Protection: Validate Origin header on WebSocket handshake
      const origin = req.headers.origin
      if (origin && !isOriginAllowed(origin)) {
        socket.close(4403, 'Forbidden Origin')
        return
      }

      // Buffer early messages that arrive before session authentication finishes resolving
      const messageBuffer: (string | Buffer | ArrayBuffer | Buffer[])[] = []
      let handlerAttached = false

      const earlyMessageListener = (data: any) => {
        if (!handlerAttached) {
          if (messageBuffer.length >= 5) {
            socket.close(1008, 'Buffer overflow')
            return
          }
          messageBuffer.push(data)
        }
      }
      socket.on('message', earlyMessageListener)

      getWsSession(req.raw)
        .then(async (sessionData) => {
          if (!sessionData) {
            socket.send(
              JSON.stringify({
                type: 'error',
                code: 'UNAUTHORIZED',
                message: 'Authentication session required to connect',
              }),
            )
            socket.close(4401, 'Unauthorized')
            return
          }

          handlerAttached = true
          socket.removeListener('message', earlyMessageListener)
          await handleWebSocketConnection(socket, sessionData.user.id, messageBuffer)
        })
        .catch(() => {
          socket.close(4401, 'Unauthorized')
        })
    })
  })

  // Wire ExpiryWorker Notifications
  expiryWorker.setNotifyCallback((event) => {
    if (event.type === 'session.ended') {
      connectionManager.broadcastToGame(event.gameId, {
        type: 'session.ended',
        payload: { gameId: event.gameId },
      })
    } else if (event.type === 'guess.request') {
      connectionManager.broadcastToGame(event.gameId, {
        type: 'guess.request',
        payload: { gameId: event.gameId },
      })
    } else if (event.type === 'extension.expired' && event.requestId) {
      connectionManager.broadcastToGame(event.gameId, {
        type: 'extension.declined',
        payload: { requestId: event.requestId },
      })
    }
  })

  return app
}
