import { z } from 'zod'

export const clientEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('queue.join') }),
  z.object({ type: z.literal('queue.cancel') }),
  z.object({
    type: z.literal('chat.send'),
    payload: z.object({
      gameId: z.string(),
      content: z.string().min(1).max(2000),
    }),
  }),
  z.object({
    type: z.literal('guess.submit'),
    payload: z.object({
      gameId: z.string(),
      guess: z.enum(['HUMAN', 'AI']),
    }),
  }),
  z.object({
    type: z.literal('extension.request'),
    payload: z.object({
      gameId: z.string(),
    }),
  }),
  z.object({
    type: z.literal('extension.respond'),
    payload: z.object({
      requestId: z.string(),
      accept: z.boolean(),
    }),
  }),
  z.object({
    type: z.literal('game.leave'),
    payload: z.object({
      gameId: z.string(),
    }),
  }),
  z.object({ type: z.literal('ping') }),
])

export type ClientEvent = z.infer<typeof clientEventSchema>

export type ServerEvent =
  | { type: 'connection.ready'; payload: { userId: string; publicId: string; tokenBalance: number } }
  | { type: 'queue.waiting' }
  | { type: 'game.matched'; payload: { gameId: string } }
  | { type: 'game.started'; payload: { gameId: string; endsAt: string; isFirstSender: boolean } }
  | {
      type: 'chat.message'
      payload: {
        id: string
        isSelf: boolean
        sequenceNumber: number
        content: string
        createdAt: string
      }
    }
  | { type: 'chat.ai_delta'; payload: { delta: string } }
  | { type: 'chat.ai_done'; payload: { id: string; sequenceNumber: number; content: string } }
  | { type: 'session.ended'; payload: { gameId: string } }
  | { type: 'guess.request'; payload: { gameId: string } }
  | {
      type: 'guess.result'
      payload: {
        guess: 'HUMAN' | 'AI'
        isCorrect: boolean
        reward: number
        actualOpponentType: 'HUMAN' | 'AI'
        balanceAfter: number
      }
    }
  | { type: 'game.resolved'; payload: { gameId: string; canExtend: boolean } }
  | { type: 'extension.requested'; payload: { requestId: string; cost: number; expiresAt: string } }
  | { type: 'extension.accepted'; payload: { requestId: string } }
  | { type: 'extension.declined'; payload: { requestId: string } }
  | { type: 'extension.started'; payload: { gameId: string; endsAt: string } }
  | { type: 'extension.ended'; payload: { gameId: string } }
  | { type: 'token.balance'; payload: { balance: number } }
  | { type: 'pong' }
  | { type: 'error'; code: string; message: string }
