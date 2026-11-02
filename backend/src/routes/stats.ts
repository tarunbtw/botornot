import type { FastifyPluginAsync } from 'fastify'
import { statsService } from '../modules/stats/service.js'

export const statsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/api/stats/global', async () => {
    return statsService.getGlobalStats()
  })

  fastify.get('/api/stats/leaderboard', async () => {
    return statsService.getLeaderboard(50)
  })
}

