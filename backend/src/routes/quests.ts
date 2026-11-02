import type { FastifyPluginAsync } from 'fastify'
import { requireAuth } from '../auth/middleware.js'
import { questsService } from '../modules/quests/service.js'
import { z } from 'zod'

const claimQuestSchema = z.object({
  questId: z.enum(['login', 'play1', 'correct1', 'play3', 'bonus', 'ad']),
})

export const questsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get today's quest status and progress
  fastify.get('/api/quests', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!
    const quests = await questsService.getTodayQuests(user.id)
    return quests
  })

  // Atomically claim a completed quest reward
  fastify.post('/api/quests/claim', { preHandler: [requireAuth] }, async (request, reply) => {
    const user = request.user!

    const parsed = claimQuestSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'INVALID_REQUEST',
        message: parsed.error.issues[0]?.message || 'Invalid questId',
      })
    }

    try {
      const result = await questsService.claimQuest(user.id, parsed.data.questId)
      return {
        success: true,
        reward: result.reward,
        balance: result.balanceAfter,
        quests: result.questsData,
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to claim quest'
      if (
        msg.includes('ALREADY_CLAIMED') ||
        msg.includes('MAX_DAILY_ADS_REACHED')
      ) {
        return reply.status(409).send({ error: 'ALREADY_CLAIMED', message: msg })
      }
      if (msg.includes('REQUIREMENTS_NOT_MET')) {
        return reply.status(400).send({ error: 'REQUIREMENTS_NOT_MET', message: msg })
      }
      return reply.status(500).send({ error: 'CLAIM_FAILED', message: msg })
    }
  })
}

