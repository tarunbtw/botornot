import { env } from '../../config/env.js'
import { SYSTEM_PROMPT_V1 } from './prompts/v1.js'

export interface ChatMessageContext {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamAIOptions {
  messages: Array<{ senderType: 'HUMAN' | 'AI'; content: string }>
  systemPrompt?: string
  model?: string
  signal?: AbortSignal
  onDelta?: (delta: string) => void
}

export class AIService {
  private apiKey: string
  private defaultModel: string

  constructor() {
    this.apiKey = env.OPENROUTER_API_KEY
    this.defaultModel = env.OPENROUTER_MODEL
  }

  async generateStreamingResponse(options: StreamAIOptions): Promise<string> {
    if (options.signal?.aborted) {
      const err = new Error('The operation was aborted')
      err.name = 'AbortError'
      throw err
    }

    const formattedMessages: ChatMessageContext[] = [
      {
        role: 'system',
        content: options.systemPrompt || SYSTEM_PROMPT_V1,
      },
      ...options.messages.map((m) => ({
        role: (m.senderType === 'HUMAN' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    // If in test mode or using mock key, return simulated human-like response
    if (process.env.NODE_ENV === 'test' || this.apiKey === 'mock-key' || this.apiKey.startsWith('mock')) {
      const lastUserMsg = options.messages.filter((m) => m.senderType === 'HUMAN').pop()?.content.toLowerCase() || ''

      let chosen = 'haha hey there! where are you from?'
      if (lastUserMsg.includes('bot') || lastUserMsg.includes('ai') || lastUserMsg.includes('robot')) {
        const botAnswers = [
          'lmao no way, 100% human here. are you a bot trying to test me?',
          'haha definitely not a bot, why would you ask that?',
          'lol nope, real person typing on my keyboard right now',
        ]
        chosen = botAnswers[Math.floor(Math.random() * botAnswers.length)]
      } else if (lastUserMsg.includes('where') || lastUserMsg.includes('from') || lastUserMsg.includes('location')) {
        const locAnswers = [
          'from chicago originally, living in seattle now! wbu?',
          'california born and raised! how about you?',
          'east coast! pretty chilly over here today',
        ]
        chosen = locAnswers[Math.floor(Math.random() * locAnswers.length)]
      } else if (lastUserMsg.includes('name') || lastUserMsg.includes('who are you')) {
        chosen = 'just a regular guy playing turing games, you can call me Alex'
      } else if (lastUserMsg.includes('what') && (lastUserMsg.includes('do') || lastUserMsg.includes('up') || lastUserMsg.includes('doing'))) {
        chosen = 'just relaxing after work and trying this game out, pretty cool concept tbh'
      } else if (lastUserMsg.includes('hi') || lastUserMsg.includes('hello') || lastUserMsg.includes('hey') || lastUserMsg.includes('yo')) {
        const greetings = [
          'yo! how are you doing today?',
          'hey hey, how is it going?',
          'hello! ready for the turing test?',
        ]
        chosen = greetings[Math.floor(Math.random() * greetings.length)]
      } else {
        const fallbacks = [
          'haha you caught me off guard with that question',
          'fair enough, that makes total sense lol',
          'pretty interesting question honestly!',
          'just chilling playing games, how about you?',
          'definitely a real person here lol, are you a bot?',
        ]
        chosen = fallbacks[Math.floor(Math.random() * fallbacks.length)]
      }

      if (options.onDelta) {
        options.onDelta(chosen)
      }
      return chosen
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': env.BETTER_AUTH_URL,
        'X-Title': 'BotOrNot Turing Game',
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages: formattedMessages,
        stream: true,
        max_tokens: 150,
        temperature: 0.85,
      }),
      signal: options.signal,
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.warn(`[OpenRouter API warning (${response.status})]: ${errText}. Using natural fallback.`)
      const fallbacks = [
        'haha hey there! where are you from?',
        'just chilling playing games, how about you?',
        'lol definitely a real person here, are you a bot?',
        'pretty interesting question honestly!',
        'haha yeah I hear that a lot',
      ]
      const chosen = fallbacks[Math.floor(Math.random() * fallbacks.length)]
      if (options.onDelta) {
        options.onDelta(chosen)
      }
      return chosen
    }

    if (!response.body) {
      throw new Error('No response body from OpenRouter')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullText = ''
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          const dataStr = trimmed.slice(6)
          if (dataStr === '[DONE]') break

          try {
            const parsed = JSON.parse(dataStr)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullText += delta
              if (options.onDelta) {
                options.onDelta(delta)
              }
            }
          } catch {
            // Ignore incomplete chunk parse errors
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return fullText.trim()
  }
}

export const aiService = new AIService()
