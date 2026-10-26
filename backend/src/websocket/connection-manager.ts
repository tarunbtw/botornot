import type { WebSocket } from 'ws'
import type { ServerEvent } from './protocol.js'
import { db } from '../db/index.js'
import { gamePlayer } from '../db/schema/games.js'
import { eq } from 'drizzle-orm'

export class ConnectionManager {
  private userSockets: Map<string, Set<WebSocket>> = new Map()
  private gameUsers: Map<string, Set<string>> = new Map()

  addConnection(userId: string, socket: WebSocket) {
    let sockets = this.userSockets.get(userId)
    if (!sockets) {
      sockets = new Set()
      this.userSockets.set(userId, sockets)
    }
    sockets.add(socket)
  }

  removeConnection(userId: string, socket: WebSocket) {
    const sockets = this.userSockets.get(userId)
    if (sockets) {
      sockets.delete(socket)
      if (sockets.size === 0) {
        this.userSockets.delete(userId)
      }
    }
  }

  registerGame(gameId: string, userIds: string[]) {
    this.gameUsers.set(gameId, new Set(userIds))
  }

  unregisterGame(gameId: string) {
    this.gameUsers.delete(gameId)
  }

  sendToUser(userId: string, event: ServerEvent) {
    const sockets = this.userSockets.get(userId)
    if (!sockets) return

    const data = JSON.stringify(event)
    for (const ws of sockets) {
      if (ws.readyState === ws.OPEN) {
        ws.send(data)
      }
    }
  }

  async broadcastToGame(gameId: string, event: ServerEvent, excludeUserId?: string) {
    let userIds = this.gameUsers.get(gameId)
    if (!userIds || userIds.size === 0) {
      const players = await db.query.gamePlayer.findMany({
        where: eq(gamePlayer.gameId, gameId),
      })
      userIds = new Set(players.map((p) => p.userId))
      this.gameUsers.set(gameId, userIds)
    }

    for (const uId of userIds) {
      if (excludeUserId && uId === excludeUserId) continue
      this.sendToUser(uId, event)
    }
  }

  sendToSocket(socket: WebSocket, event: ServerEvent) {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify(event))
    }
  }

  sendError(socket: WebSocket, code: string, message: string) {
    this.sendToSocket(socket, {
      type: 'error',
      code,
      message,
    })
  }

  isUserConnected(userId: string): boolean {
    const sockets = this.userSockets.get(userId)
    return !!sockets && sockets.size > 0
  }

  disconnectUser(userId: string) {
    const sockets = this.userSockets.get(userId)
    if (sockets) {
      for (const ws of sockets) {
        try {
          ws.close(1000, 'User Account Deleted')
        } catch {
          // ignore
        }
      }
      this.userSockets.delete(userId)
    }
  }
}

export const connectionManager = new ConnectionManager()
