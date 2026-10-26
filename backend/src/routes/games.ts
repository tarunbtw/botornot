import type { FastifyPluginAsync } from 'fastify'
import { requireAuth } from '../auth/middleware.js'
import { gameService } from '../modules/games/state-machine.js'
import { chatService } from '../modules/chat/service.js'

export const gamesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/games/active', { preHandler: [requireAuth] }, async (request) => {
    const user = request.user!
    const active = await gameService.getActiveGameForUser(user.id)
    if (!active) {
      return { active: false }
    }

    const isResolved = ['RESOLVED', 'EXTENSION_PENDING', 'EXTENSION_ACTIVE', 'COMPLETED'].includes(
      active.game.status,
    )

    return {
      active: true,
      game: {
        id: active.game.id,
        status: active.game.status,
        opponentType: isResolved ? active.game.opponentType : undefined,
        initialStartedAt: active.game.initialStartedAt,
        initialEndsAt: active.game.initialEndsAt,
        isFirstSender: active.game.firstSenderPlayerId === user.id,
      },
    }
  })

  fastify.get<{ Params: { id: string } }>(
    '/api/games/:id',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const user = request.user!
      const gameId = request.params.id

      const gameData = await gameService.getGameById(gameId)
      if (!gameData) {
        return reply.status(404).send({ error: 'GAME_NOT_FOUND' })
      }

      // Authorization: check user belongs to game
      const isPlayer = gameData.players.some((p) => p.userId === user.id)
      if (!isPlayer) {
        return reply.status(403).send({ error: 'FORBIDDEN', message: 'You do not belong to this game' })
      }

      const isResolved = ['RESOLVED', 'EXTENSION_PENDING', 'EXTENSION_ACTIVE', 'COMPLETED'].includes(
        gameData.status,
      )

      return {
        id: gameData.id,
        status: gameData.status,
        // Only reveal actual opponent type once game is resolved!
        opponentType: isResolved ? gameData.opponentType : undefined,
        initialStartedAt: gameData.initialStartedAt,
        initialEndsAt: gameData.initialEndsAt,
        isFirstSender: gameData.firstSenderPlayerId === user.id,
        sessions: gameData.sessions,
      }
    },
  )

  fastify.get<{ Params: { id: string } }>(
    '/api/games/:id/messages',
    { preHandler: [requireAuth] },
    async (request, reply) => {
      const user = request.user!
      const gameId = request.params.id

      const gameData = await gameService.getGameById(gameId)
      if (!gameData) {
        return reply.status(404).send({ error: 'GAME_NOT_FOUND' })
      }

      const isPlayer = gameData.players.some((p) => p.userId === user.id)
      if (!isPlayer) {
        return reply.status(403).send({ error: 'FORBIDDEN', message: 'You do not belong to this game' })
      }

      const messages = await chatService.getMessagesForGame(gameId)
      return {
        messages: messages.map((m) => ({
          id: m.id,
          sequenceNumber: m.sequenceNumber,
          isSelf: m.senderUserId === user.id,
          content: m.content,
          createdAt: m.createdAt,
        })),
      }
    },
  )
}
