import { describe, it, expect, vi } from 'vitest'
import { GuessService } from '../modules/games/guess.js'
import { db } from '../db/index.js'

vi.mock('../db/index.js', () => ({
  db: {
    transaction: vi.fn(),
  },
}))

describe('GuessService & Rewards', () => {
  it('awards REWARD_CORRECT when guess matches opponentType', async () => {
    const service = new GuessService()

    const mockUpdate = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    })
    const mockInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([]),
    })

    const mockTx = {
      query: {
        game: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'game-1',
            status: 'GUESSING',
            opponentType: 'HUMAN',
          }),
        },
        gamePlayer: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'player-1',
            gameId: 'game-1',
            userId: 'u1',
            guess: null,
          }),
          findMany: vi.fn().mockResolvedValue([
            { id: 'player-1', userId: 'u1', guess: 'HUMAN' },
            { id: 'player-2', userId: 'u2', guess: 'AI' },
          ]),
        },
      },
      select: () => ({
        from: () => ({
          where: () => ({
            for: vi.fn().mockResolvedValue([
              {
                userId: 'u1',
                tokenBalance: 10,
                totalGames: 2,
                totalCorrectGuesses: 1,
              },
            ]),
          }),
        }),
      }),
      update: mockUpdate,
      insert: mockInsert,
    }

    vi.mocked(db.transaction).mockImplementation((cb: any) => cb(mockTx))

    const result = await service.submitGuess({
      gameId: 'game-1',
      userId: 'u1',
      guess: 'HUMAN',
    })

    expect(result.isCorrect).toBe(true)
    expect(result.reward).toBe(10)
    expect(result.balanceAfter).toBe(20)
    expect(result.allGuessed).toBe(true)
  })

  it('awards REWARD_WRONG when guess does not match opponentType', async () => {
    const service = new GuessService()

    const mockTx = {
      query: {
        game: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'game-1',
            status: 'GUESSING',
            opponentType: 'AI',
          }),
        },
        gamePlayer: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'player-1',
            gameId: 'game-1',
            userId: 'u1',
            guess: null,
          }),
          findMany: vi.fn().mockResolvedValue([{ id: 'player-1', userId: 'u1', guess: 'HUMAN' }]),
        },
      },
      select: () => ({
        from: () => ({
          where: () => ({
            for: vi.fn().mockResolvedValue([
              {
                userId: 'u1',
                tokenBalance: 10,
                totalGames: 0,
                totalCorrectGuesses: 0,
              },
            ]),
          }),
        }),
      }),
      update: () => ({ set: () => ({ where: vi.fn().mockResolvedValue([]) }) }),
      insert: () => ({ values: vi.fn().mockResolvedValue([]) }),
    }

    vi.mocked(db.transaction).mockImplementation((cb: any) => cb(mockTx))

    const result = await service.submitGuess({
      gameId: 'game-1',
      userId: 'u1',
      guess: 'HUMAN', // Guessed HUMAN, but opponent was AI!
    })

    expect(result.isCorrect).toBe(false)
    expect(result.reward).toBe(5)
    expect(result.balanceAfter).toBe(15)
  })

  it('rejects duplicate guess from same player', async () => {
    const service = new GuessService()

    const mockTx = {
      query: {
        game: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'game-1',
            status: 'GUESSING',
            opponentType: 'HUMAN',
          }),
        },
        gamePlayer: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'player-1',
            gameId: 'game-1',
            userId: 'u1',
            guess: 'HUMAN', // Already guessed!
          }),
        },
      },
    }

    vi.mocked(db.transaction).mockImplementation((cb: any) => cb(mockTx))

    await expect(
      service.submitGuess({
        gameId: 'game-1',
        userId: 'u1',
        guess: 'HUMAN',
      }),
    ).rejects.toThrow('GUESS_ALREADY_SUBMITTED')
  })
})
