import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatService } from '../modules/chat/service.js'
import { db } from '../db/index.js'

vi.mock('../db/index.js', () => ({
  db: {
    query: {
      game: { findFirst: vi.fn() },
      gamePlayer: { findFirst: vi.fn(), findMany: vi.fn() },
      chatSession: { findFirst: vi.fn(), findMany: vi.fn() },
      chatMessage: { findMany: vi.fn() },
    },
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
  },
}))

describe('Game Lifecycle & Chat Rules', () => {
  let chatService: ChatService

  beforeEach(() => {
    chatService = new ChatService()
    vi.clearAllMocks()
  })

  it('enforces first sender rule when session has zero messages', async () => {
    // Game active, first sender is 'user-A'
    vi.mocked(db.query.game.findFirst).mockResolvedValue({
      id: 'game-1',
      status: 'ACTIVE',
      opponentType: 'HUMAN',
      firstSenderPlayerId: 'user-A',
    } as any)

    vi.mocked(db.query.gamePlayer.findFirst).mockResolvedValue({
      id: 'p2',
      gameId: 'game-1',
      userId: 'user-B',
      side: 'B',
    } as any)

    vi.mocked(db.query.chatSession.findFirst).mockResolvedValue({
      id: 'session-1',
      gameId: 'game-1',
      status: 'ACTIVE',
      endsAt: new Date(Date.now() + 100000),
    } as any)

    // Zero messages existing
    vi.mocked(db.select).mockReturnValue({
      from: () => ({
        where: vi.fn().mockResolvedValue([{ count: 0 }]),
      }),
    } as any)

    // User B tries to send first
    await expect(
      chatService.handleUserMessage({
        gameId: 'game-1',
        userId: 'user-B',
        content: 'Hello world',
      }),
    ).rejects.toThrow('NOT_YOUR_TURN_FIRST')
  })

  it('rejects messages sent to an expired session', async () => {
    vi.mocked(db.query.game.findFirst).mockResolvedValue({
      id: 'game-1',
      status: 'ACTIVE',
      opponentType: 'HUMAN',
      firstSenderPlayerId: 'user-A',
    } as any)

    vi.mocked(db.query.gamePlayer.findFirst).mockResolvedValue({
      id: 'p1',
      gameId: 'game-1',
      userId: 'user-A',
      side: 'A',
    } as any)

    // Session ended 10 seconds ago
    vi.mocked(db.query.chatSession.findFirst).mockResolvedValue({
      id: 'session-1',
      gameId: 'game-1',
      status: 'ACTIVE',
      endsAt: new Date(Date.now() - 10000),
    } as any)

    await expect(
      chatService.handleUserMessage({
        gameId: 'game-1',
        userId: 'user-A',
        content: 'Too late message',
      }),
    ).rejects.toThrow('SESSION_EXPIRED')
  })

  it('rejects empty or excessively long messages', async () => {
    await expect(
      chatService.handleUserMessage({
        gameId: 'game-1',
        userId: 'user-A',
        content: '    ',
      }),
    ).rejects.toThrow('MESSAGE_EMPTY')

    const longMessage = 'a'.repeat(2500)
    await expect(
      chatService.handleUserMessage({
        gameId: 'game-1',
        userId: 'user-A',
        content: longMessage,
      }),
    ).rejects.toThrow('MESSAGE_TOO_LONG')
  })

  it('rate limits rapid messages from the same user', async () => {
    vi.mocked(db.query.game.findFirst).mockResolvedValue({
      id: 'game-1',
      status: 'ACTIVE',
      opponentType: 'HUMAN',
      firstSenderPlayerId: 'user-A',
    } as any)

    vi.mocked(db.query.gamePlayer.findFirst).mockResolvedValue({
      id: 'p1',
      gameId: 'game-1',
      userId: 'user-A',
      side: 'A',
    } as any)

    vi.mocked(db.query.chatSession.findFirst).mockResolvedValue({
      id: 'session-1',
      gameId: 'game-1',
      status: 'ACTIVE',
      endsAt: new Date(Date.now() + 100000),
    } as any)

    vi.mocked(db.select).mockReturnValue({
      from: () => ({
        where: vi.fn().mockResolvedValue([{ count: 0 }]),
      }),
    } as any)

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockResolvedValue([]),
    } as any)

    // First message succeeds
    await chatService.handleUserMessage({
      gameId: 'game-1',
      userId: 'user-A',
      content: 'first message',
    })

    // Immediate second message gets rate limited
    await expect(
      chatService.handleUserMessage({
        gameId: 'game-1',
        userId: 'user-A',
        content: 'rapid message',
      }),
    ).rejects.toThrow('RATE_LIMITED')
  })
})
