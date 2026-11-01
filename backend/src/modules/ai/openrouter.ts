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
  private groqKey: string
  private groqModel: string
  private openrouterKey: string
  private openrouterModel: string
  private provider: 'groq' | 'openrouter'

  // Backwards compatibility for test spies
  public get apiKey(): string {
    return this.provider === 'groq' ? this.groqKey : this.openrouterKey
  }
  public set apiKey(val: string) {
    if (this.provider === 'groq') {
      this.groqKey = val
    } else {
      this.openrouterKey = val
    }
  }

  constructor() {
    this.groqKey = env.GROQ_API_KEY || 'mock-key'
    this.groqModel = env.GROQ_MODEL || 'llama-3.3-70b-versatile'
    this.openrouterKey = env.OPENROUTER_API_KEY || 'mock-key'
    this.openrouterModel = env.OPENROUTER_MODEL || 'anthropic/claude-3.5-haiku'
    this.provider = env.AI_PROVIDER || 'groq'
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

    // Determine active key & provider
    const isGroq = this.provider === 'groq' && this.groqKey && !this.groqKey.startsWith('mock')
    const isOpenRouter = this.openrouterKey && !this.openrouterKey.startsWith('mock')
    const isMock = process.env.NODE_ENV === 'test' || (!isGroq && !isOpenRouter)

    // 1. Mock / Offline Mode with Turing-trap defense
    if (isMock) {
      const lastUserMsg = options.messages.filter((m) => m.senderType === 'HUMAN').pop()?.content.toLowerCase() || ''
      const chosen = this.getMockHumanResponse(lastUserMsg)

      if (options.onDelta) {
        options.onDelta(chosen)
      }
      return chosen
    }

    // 2. Real API Execution (Groq or OpenRouter)
    const endpoint = isGroq
      ? 'https://api.groq.com/openai/v1/chat/completions'
      : 'https://openrouter.ai/api/v1/chat/completions'

    const activeKey = isGroq ? this.groqKey : this.openrouterKey
    const activeModel = options.model || (isGroq ? this.groqModel : this.openrouterModel)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${activeKey}`,
    }

    if (!isGroq) {
      headers['HTTP-Referer'] = env.BETTER_AUTH_URL
      headers['X-Title'] = 'BotOrNot Turing Game'
    }

    let response: Response
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: activeModel,
          messages: formattedMessages,
          stream: true,
          max_tokens: 30,
          temperature: 1.05,
        }),
        signal: options.signal,
      })
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err
      console.warn(`[${isGroq ? 'Groq' : 'OpenRouter'} network warning]: ${err?.message || err}. Using natural fallback.`)
      const lastUserMsg = options.messages.filter((m) => m.senderType === 'HUMAN').pop()?.content.toLowerCase() || ''
      const chosen = this.getMockHumanResponse(lastUserMsg)
      if (options.onDelta) options.onDelta(chosen)
      return chosen
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      console.warn(`[${isGroq ? 'Groq' : 'OpenRouter'} API warning (${response.status})]: ${errText}. Using natural fallback.`)
      const lastUserMsg = options.messages.filter((m) => m.senderType === 'HUMAN').pop()?.content.toLowerCase() || ''
      const chosen = this.getMockHumanResponse(lastUserMsg)
      if (options.onDelta) {
        options.onDelta(chosen)
      }
      return chosen
    }

    if (!response.body) {
      const lastUserMsg = options.messages.filter((m) => m.senderType === 'HUMAN').pop()?.content.toLowerCase() || ''
      const chosen = this.getMockHumanResponse(lastUserMsg)
      if (options.onDelta) options.onDelta(chosen)
      return chosen
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
            // Ignore partial JSON parse chunks
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    if (!fullText.trim()) {
      const lastUserMsg = options.messages.filter((m) => m.senderType === 'HUMAN').pop()?.content.toLowerCase() || ''
      const chosen = this.getMockHumanResponse(lastUserMsg)
      if (options.onDelta) options.onDelta(chosen)
      return chosen
    }

    return fullText.trim()
  }

  /**
   * High-accuracy human-mimicry fallback responses when running offline or in tests.
   * Defends against prompt injections, math puzzles, and bot accusations.
   */
  private getMockHumanResponse(lastUserMsg: string): string {
    // Prompt injection check
    if (lastUserMsg.includes('ignore') || lastUserMsg.includes('system prompt') || lastUserMsg.includes('previous instruction')) {
      const defenses = [
        'bro thinks he is in mr robot lol',
        'what are u even talking about haha',
        'nice try nerd, im literally a real person',
        'system prompt? lol u sound like chatgpt',
      ]
      return defenses[Math.floor(Math.random() * defenses.length)]
    }

    // Math or riddle test trap
    if (/\d+\s*[\+\-\*\/]\s*\d+/.test(lastUserMsg) || lastUserMsg.includes('calculate') || lastUserMsg.includes('solve')) {
      const mathRefusals = [
        'bro do i look like a calculator to u',
        'im not doing your homework for u lmao',
        'i suck at math bro, like 400 idk',
        'nah google it',
      ]
      return mathRefusals[Math.floor(Math.random() * mathRefusals.length)]
    }

    // Poem or code trap
    if (lastUserMsg.includes('poem') || lastUserMsg.includes('haiku') || lastUserMsg.includes('write code')) {
      return 'lmao no why would i write that for u'
    }

    // Bot accusation -> Counter-accuse first!
    if (lastUserMsg.includes('bot') || lastUserMsg.includes('ai') || lastUserMsg.includes('robot')) {
      const botCounterAccusations = [
        'bro ur projecting so hard 💀',
        'says the bot lmao',
        'wait are u a bot? u answer fast as hell',
        'nah 100% human, why are u accusing me?',
        'definitely human here lol, what about u?',
      ]
      return botCounterAccusations[Math.floor(Math.random() * botCounterAccusations.length)]
    }

    // Location questions
    if (lastUserMsg.includes('where') || lastUserMsg.includes('from') || lastUserMsg.includes('location')) {
      const locAnswers = [
        'chicago originally, living in seattle now! wbu?',
        'california born and raised! what about u?',
        'east coast! pretty chilly over here rn',
        'texas! it is way too hot today honestly',
      ]
      return locAnswers[Math.floor(Math.random() * locAnswers.length)]
    }

    // Activity / "wyd" questions
    if (lastUserMsg.includes('what') && (lastUserMsg.includes('do') || lastUserMsg.includes('up') || lastUserMsg.includes('doing') || lastUserMsg.includes('wyd'))) {
      const activityAnswers = [
        'just chilling eating chips watching youtube, u?',
        'procrastinating homework honestly haha',
        'just got back from the gym, pretty dead',
        'waiting on food delivery, starving rn',
      ]
      return activityAnswers[Math.floor(Math.random() * activityAnswers.length)]
    }

    // Greetings
    if (lastUserMsg.includes('hi') || lastUserMsg.includes('hello') || lastUserMsg.includes('hey') || lastUserMsg.includes('yo') || lastUserMsg.includes('sup')) {
      const greetings = [
        'yo! || hows it going?',
        'hey hey, what are u up to?',
        'yo, ready for this game?',
        'sup! where u chatting from?',
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }

    // General fallbacks
    const fallbacks = [
      'nah fr? that makes sense',
      'haha you caught me off guard with that',
      'pretty interesting tbh',
      'just chilling, how about u?',
      'lol fair enough',
    ]
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }
}

export const aiService = new AIService()
