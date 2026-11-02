import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildApp } from '../app.js'
import { auth } from '../auth/auth.js'
import { questsService } from '../modules/quests/service.js'
import { tokenLedgerService } from '../modules/tokens/ledger.js'

describe('Quests & Exploit Prevention', () => {
  const mockUser = {
    id: 'user_quest_test',
    name: 'Quest Tester',
    email: 'quest@test.com',
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockSession = {
    id: 'sess_quest_1',
    token: 'tok_quest_1',
    userId: mockUser.id,
    expiresAt: new Date(Date.now() + 100000),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthenticated requests to /api/quests with 401', async () => {
    const app = buildApp()
    vi.spyOn(auth.api, 'getSession').mockResolvedValue(null)

    const res = await app.inject({
      method: 'GET',
      url: '/api/quests',
    })

    expect(res.statusCode).toBe(401)
    expect(JSON.parse(res.body).error).toBe('UNAUTHORIZED')
  })

  it('returns quests status for authenticated user', async () => {
    const app = buildApp()
    vi.spyOn(auth.api, 'getSession').mockResolvedValue({
      user: mockUser,
      session: mockSession,
    } as any)

    vi.spyOn(questsService, 'getTodayQuests').mockResolvedValue({
      date: '2026-11-01',
      loginStreak: 2,
      loginClaimedToday: false,
      matchesPlayed: 1,
      correctGuesses: 1,
      adsWatchedToday: 0,
      claimedQuestIds: [],
      allClaimed: false,
    })

    const res = await app.inject({
      method: 'GET',
      url: '/api/quests',
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.loginStreak).toBe(2)
    expect(body.matchesPlayed).toBe(1)
  })

  it('allows claiming daily login and returns new balance', async () => {
    const app = buildApp()
    vi.spyOn(auth.api, 'getSession').mockResolvedValue({
      user: mockUser,
      session: mockSession,
    } as any)

    vi.spyOn(questsService, 'claimQuest').mockResolvedValue({
      reward: 10,
      balanceAfter: 20,
      questsData: {
        date: '2026-11-01',
        loginStreak: 2,
        loginClaimedToday: true,
        matchesPlayed: 0,
        correctGuesses: 0,
        adsWatchedToday: 0,
        claimedQuestIds: [],
        allClaimed: false,
      },
    })

    const res = await app.inject({
      method: 'POST',
      url: '/api/quests/claim',
      payload: { questId: 'login' },
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.success).toBe(true)
    expect(body.reward).toBe(10)
    expect(body.balance).toBe(20)
    expect(body.quests.loginClaimedToday).toBe(true)
  })

  it('prevents duplicate claims returning 409 ALREADY_CLAIMED', async () => {
    const app = buildApp()
    vi.spyOn(auth.api, 'getSession').mockResolvedValue({
      user: mockUser,
      session: mockSession,
    } as any)

    vi.spyOn(questsService, 'claimQuest').mockRejectedValue(new Error('LOGIN_ALREADY_CLAIMED_TODAY'))

    const res = await app.inject({
      method: 'POST',
      url: '/api/quests/claim',
      payload: { questId: 'login' },
    })

    expect(res.statusCode).toBe(409)
    const body = JSON.parse(res.body)
    expect(body.error).toBe('ALREADY_CLAIMED')
  })

  it('rejects claiming quest if requirements are not met', async () => {
    const app = buildApp()
    vi.spyOn(auth.api, 'getSession').mockResolvedValue({
      user: mockUser,
      session: mockSession,
    } as any)

    vi.spyOn(questsService, 'claimQuest').mockRejectedValue(new Error('REQUIREMENTS_NOT_MET: Play at least 3 matches'))

    const res = await app.inject({
      method: 'POST',
      url: '/api/quests/claim',
      payload: { questId: 'play3' },
    })

    expect(res.statusCode).toBe(400)
    const body = JSON.parse(res.body)
    expect(body.error).toBe('REQUIREMENTS_NOT_MET')
  })
})

