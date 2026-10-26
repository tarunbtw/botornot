import Fastify from 'fastify'
import fastifyCors from '@fastify/cors'
import fastifyCookie from '@fastify/cookie'
import fastifyWebsocket from '@fastify/websocket'
import { env } from './config/env.js'
import { auth } from './auth/auth.js'
import { getWsSession } from './auth/middleware.js'
import { handleWebSocketConnection } from './websocket/router.js'
import { connectionManager } from './websocket/connection-manager.js'
import { expiryWorker } from './jobs/expiry-worker.js'
import { healthRoutes } from './routes/health.js'
import { meRoutes } from './routes/me.js'
import { gamesRoutes } from './routes/games.js'

export function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  })

  // CORS
  app.register(fastifyCors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, mobile webview, same-origin)
      if (!origin) return cb(null, true)
      // Allow localhost, 127.0.0.1, or local network IPs (10.x, 192.168.x, 172.16-31.x) on any port
      if (
        origin === env.CLIENT_ORIGIN ||
        /^http:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
          origin,
        )
      ) {
        return cb(null, true)
      }
      return cb(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })

  // Cookies
  app.register(fastifyCookie)

  // WebSockets
  app.register(fastifyWebsocket)

  // Better Auth Handler
  app.all('/api/auth/*', async (request, reply) => {
    const url = new URL(request.url, `${request.protocol}://${request.hostname}`)
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

    const body =
      ['GET', 'HEAD'].includes(request.method) || !request.body
        ? undefined
        : typeof request.body === 'string'
        ? request.body
        : JSON.stringify(request.body)

    const webReq = new Request(url.toString(), {
      method: request.method,
      headers,
      body,
    })

    const res = await auth.handler(webReq)
    reply.status(res.status)
    res.headers.forEach((val, key) => {
      reply.header(key, val)
    })
    const textData = await res.text()
    return reply.send(textData)
  })

  // REST Routes
  app.register(healthRoutes)
  app.register(meRoutes)
  app.register(gamesRoutes)

  // Authenticated WebSocket Route
  app.register(async (fastify) => {
    fastify.get('/ws', { websocket: true }, (socket, req) => {
      // Buffer messages that arrive before session authentication finishes resolving
      const messageBuffer: (string | Buffer | ArrayBuffer | Buffer[])[] = []
      let handlerAttached = false

      const earlyMessageListener = (data: any) => {
        if (!handlerAttached) {
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
