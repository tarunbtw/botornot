import { describe, it, expect, vi } from 'vitest'
import { ExtensionService } from '../modules/extensions/service.js'
import { db } from '../db/index.js'
import { entitlementService } from '../modules/subscriptions/entitlement.js'

vi.mock('../db/index.js', () => ({
  db: {
    query: {
      game: { findFirst: vi.fn() },
      gamePlayer: { findMany: vi.fn() },
      chatSession: { findFirst: vi.fn() },
      chatExtensionRequest: { findFirst: vi.fn() },
    },
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) }),
    update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }),
    transaction: vi.fn(),
  },
}))

describe('ExtensionService', () => {
  it('strictly prohibits extension on AI games', async () => {
    const service = new ExtensionService()

    vi.mocked(db.query.game.findFirst).mockResolvedValue({
      id: 'ai-game-1',
      opponentType: 'AI', // AI game!
      status: 'RESOLVED',
    } as any)

    await expect(service.requestExtension('ai-game-1', 'user-1')).rejects.toThrow(
      'AI_GAMES_CANNOT_BE_EXTENDED',
    )
  })

  it('exempts Pro users from token charges upon extension acceptance', async () => {
    const service = new ExtensionService()

    // Request pending
    vi.mocked(db.query.chatExtensionRequest.findFirst).mockResolvedValue({
      id: 'req-1',
      gameId: 'game-1',
      requestingUserId: 'user-A',
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 60000),
    } as any)

    vi.mocked(db.query.gamePlayer.findMany).mockResolvedValue([
      { userId: 'user-A' },
      { userId: 'user-B' },
    ] as any)

    // User A is Pro, User B is Pro
    vi.spyOn(entitlementService, 'hasActivePro').mockResolvedValue(true)

    const mockTx = {
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) }),
      update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }) }),
    }

    vi.mocked(db.transaction).mockImplementation((cb: any) => cb(mockTx))

    const result = await service.respondExtension('req-1', 'user-B', true)

    expect(result.accepted).toBe(true)
    if (result.accepted) {
      expect(result.players).toEqual(['user-A', 'user-B'])
    }
    // Should insert new chat_session for extension
    expect(mockTx.insert).toHaveBeenCalled()
  })
})
