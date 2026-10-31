import { describe, it, expect } from 'vitest'
import { AIService } from '../modules/ai/openrouter.js'
import { getSessionPersona } from '../modules/ai/prompts/archetypes.js'
import { humanizeResponse } from '../modules/ai/humanizer.js'

describe('Live Groq API Verification', () => {
  it('connects to Groq and generates human-like response', async () => {
    // Force NODE_ENV to non-test temporarily inside test to allow real fetch
    const oldNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    try {
      const service = new AIService()
      const { archetype, anchor } = getSessionPersona('test-live-session-123')

      const rawResponse = await service.generateStreamingResponse({
        messages: [{ senderType: 'HUMAN', content: 'yo are you a bot or what?' }],
        systemPrompt: archetype.systemPrompt(anchor),
      })

      console.log('\n--- LIVE GROQ RAW RESPONSE ---')
      console.log('Archetype:', archetype.name)
      console.log('Raw:', rawResponse)

      expect(rawResponse).toBeDefined()
      expect(rawResponse.length).toBeGreaterThan(0)

      const humanized = humanizeResponse(rawResponse, archetype.casing)
      console.log('--- HUMANIZED OUTPUT ---')
      console.log('Bubbles:', humanized.bubbles)
      console.log('Follow-up Correction:', humanized.correctionFollowup || 'none')

      expect(humanized.bubbles.length).toBeGreaterThan(0)
    } finally {
      process.env.NODE_ENV = oldNodeEnv
    }
  }, 15000)
})
