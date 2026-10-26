import { describe, it, expect, vi } from 'vitest'
import { buildApp } from '../app.js'
import { auth } from '../auth/auth.js'
import { db } from '../db/index.js'

describe('Authentication & Authorization', () => {
  it('returns 401 Unauthorized for unauthenticated /api/me request', async () => {
    const app = buildApp()

    vi.spyOn(auth.api, 'getSession').mockResolvedValue(null)

    const response = await app.inject({
      method: 'GET',
      url: '/api/me',
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body.error).toBe('UNAUTHORIZED')
  })

  it('returns 401 Unauthorized for unauthenticated DELETE /api/me request', async () => {
    const app = buildApp()
    vi.spyOn(auth.api, 'getSession').mockResolvedValue(null)

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/me',
    })

    expect(response.statusCode).toBe(401)
    const body = JSON.parse(response.body)
    expect(body.error).toBe('UNAUTHORIZED')
  })

  it('successfully deletes user account and clears cookie for authenticated request', async () => {
    const app = buildApp()
    const mockUser = {
      id: 'test_user_delete',
      name: 'Test Delete',
      email: 'delete@test.com',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const mockSession = {
      id: 'sess_delete_1',
      token: 'tok_delete_1',
      userId: mockUser.id,
      expiresAt: new Date(Date.now() + 10000),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.spyOn(auth.api, 'getSession').mockResolvedValue({
      user: mockUser,
      session: mockSession,
    } as any)

    vi.spyOn(db, 'delete').mockReturnValue({
      where: vi.fn().mockResolvedValue([{ id: mockUser.id }]),
    } as any)

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/me',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.success).toBe(true)
    expect(response.headers['set-cookie']).toBeDefined()
  })

  it('serves health check without requiring authentication', async () => {
    const app = buildApp()

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
    const body = JSON.parse(response.body)
    expect(body.status).toBe('ok')
  })
})
