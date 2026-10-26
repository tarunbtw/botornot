import type { FastifyPluginAsync } from 'fastify'
import { statsService } from '../modules/stats/service.js'

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      service: 'botornot-backend',
      timestamp: new Date().toISOString(),
    }
  })

  fastify.get('/api/stats/global', async () => {
    return statsService.getGlobalStats()
  })
}
