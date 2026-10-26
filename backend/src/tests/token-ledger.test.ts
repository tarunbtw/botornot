import { describe, it, expect, vi } from 'vitest'
import { TokenLedgerService } from '../modules/tokens/ledger.js'

describe('TokenLedgerService', () => {
  it('prevents negative balance on debit', async () => {
    const service = new TokenLedgerService()

    // Mock db to simulate a user with 5 tokens
    const mockTx = {
      query: {
        tokenTransaction: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      },
      select: () => ({
        from: () => ({
          where: () => ({
            for: vi.fn().mockResolvedValue([{ userId: 'u1', tokenBalance: 5 }]),
          }),
        }),
      }),
      update: () => ({
        set: () => ({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
      insert: () => ({
        values: vi.fn().mockResolvedValue([]),
      }),
    }

    // Try to debit 20 tokens (requires 20, but only has 5)
    await expect(
      service.recordTransaction(
        {
          userId: 'u1',
          amount: -20,
          type: 'CHAT_EXTENSION_DEBIT',
        },
        mockTx as any,
      ),
    ).rejects.toThrow('INSUFFICIENT_TOKEN_BALANCE')
  })

  it('updates balance and records ledger on credit', async () => {
    const service = new TokenLedgerService()

    const mockUpdateSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) })
    const mockInsertValues = vi.fn().mockResolvedValue([])

    const mockTx = {
      query: {
        tokenTransaction: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      },
      select: () => ({
        from: () => ({
          where: () => ({
            for: vi.fn().mockResolvedValue([{ userId: 'u1', tokenBalance: 10 }]),
          }),
        }),
      }),
      update: () => ({ set: mockUpdateSet }),
      insert: () => ({ values: mockInsertValues }),
    }

    const result = await service.recordTransaction(
      {
        userId: 'u1',
        amount: 10,
        type: 'GAME_REWARD_CORRECT',
        idempotencyKey: 'test_key_1',
      },
      mockTx as any,
    )

    expect(result.balanceAfter).toBe(20)
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ tokenBalance: 20 }),
    )
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'u1',
        amount: 10,
        type: 'GAME_REWARD_CORRECT',
        balanceAfter: 20,
        idempotencyKey: 'test_key_1',
      }),
    )
  })

  it('honors idempotency key without duplicate deduction', async () => {
    const service = new TokenLedgerService()

    const mockTx = {
      query: {
        tokenTransaction: {
          findFirst: vi.fn().mockResolvedValue({
            id: 'tx-existing',
            balanceAfter: 30,
          }),
        },
      },
      select: vi.fn(),
    }

    const result = await service.recordTransaction(
      {
        userId: 'u1',
        amount: 10,
        type: 'GAME_REWARD_CORRECT',
        idempotencyKey: 'duplicate_key',
      },
      mockTx as any,
    )

    expect(result.transactionId).toBe('tx-existing')
    expect(result.balanceAfter).toBe(30)
    expect(mockTx.select).not.toHaveBeenCalled()
  })
})
