import { describe, it, expect, vi } from 'vitest'
import { AIService } from '../modules/ai/openrouter.js'

describe('AIService Streaming & Persona', () => {
  it('streams human-like simulated responses in test mode', async () => {
    const service = new AIService()
    const deltas: string[] = []

    const response = await service.generateStreamingResponse({
      messages: [{ senderType: 'HUMAN', content: 'Hey are you human?' }],
      onDelta: (delta) => deltas.push(delta),
    })

    expect(response).toBeDefined()
    expect(response.length).toBeGreaterThan(0)
    expect(deltas.length).toBeGreaterThan(0)
    expect(deltas.join('')).toBe(response)
  })

  it('respects abort signal when session ends', async () => {
    const service = new AIService()
    const controller = new AbortController()

    // Test with real fetch mock
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockImplementation((_, opts: any) => {
      if (opts?.signal?.aborted) {
        const err = new Error('The operation was aborted')
        err.name = 'AbortError'
        return Promise.reject(err)
      }
      return Promise.resolve(new Response(''))
    })

    controller.abort()

    try {
      // Force non-test mode behavior by passing an explicit key
      ;(service as any).apiKey = 'sk-or-real-key-for-test'
      await expect(
        service.generateStreamingResponse({
          messages: [{ senderType: 'HUMAN', content: 'Hello' }],
          signal: controller.signal,
        }),
      ).rejects.toThrow('aborted')
    } finally {
      global.fetch = originalFetch
    }
  })
})
