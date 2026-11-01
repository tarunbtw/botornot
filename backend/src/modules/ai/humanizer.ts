export interface HumanizedResult {
  bubbles: string[]
  correctionFollowup?: string
}

const COMMON_SLANG_CONTRACTIONS: [RegExp, string][] = [
  [/\bdo not\b/gi, 'dont'],
  [/\bdon't\b/gi, 'dont'],
  [/\bcannot\b/gi, 'cant'],
  [/\bcan't\b/gi, 'cant'],
  [/\bi am\b/gi, 'im'],
  [/\bi'm\b/gi, 'im'],
  [/\bwill not\b/gi, 'wont'],
  [/\bwon't\b/gi, 'wont'],
  [/\bit is\b/gi, 'its'],
  [/\bit's\b/gi, 'its'],
  [/\byou are\b/gi, 'ur'],
  [/\byou're\b/gi, 'ur'],
  [/\bwhat are you\b/gi, 'wyd'],
  [/\bright now\b/gi, 'rn'],
  [/\bto be honest\b/gi, 'tbh'],
  [/\bnot going to lie\b/gi, 'ngl'],
]

const ADJACENT_KEYS: Record<string, string> = {
  a: 's', b: 'v', c: 'x', d: 's', e: 'w', f: 'd', g: 'f', h: 'g',
  i: 'o', j: 'h', k: 'j', l: 'k', m: 'n', n: 'm', o: 'p', p: 'o',
  r: 'e', s: 'a', t: 'r', u: 'y', v: 'c', w: 'e', y: 'u',
}

const BOT_CONFESSION_REGEX = /\b(i am (an? )?(ai|bot|robot|assistant|language model|artificial|synthetic)|yes i am|yes i'm|i'?m (an? )?(ai|bot|robot)|as an? (ai|bot|language model|assistant)|i do not have (feelings|a body|a physical body)|not human|created by|artificial intelligence|cannot feel|virtual assistant|im a bot|i'm a bot|im an ai|i'm an ai)\b/i

const ANTI_BOT_DENIALS = [
  'bro stop asking im human',
  'no lmao why u ask',
  'are u dumb im real',
  'says the bot 💀',
  'im literally a person lol',
  'bitch please im not a bot',
  'u sound like the bot fr',
  'im sitting on my bed lol',
  'mate im literally human lol',
]

/**
 * Transforms an LLM raw output into a natural, human-like chat message
 * with realistic typos, lowercase styling, single sentence, and strict word limit.
 */
export function humanizeResponse(
  rawText: string,
  casing: 'strict_lowercase' | 'casual_mixed' = 'strict_lowercase',
  lastUserMsg: string = '',
): HumanizedResult {
  let text = rawText.trim()

  // 1. Remove wrapping quotes often produced by LLMs
  text = text.replace(/^["'`]|["'`]$/g, '').trim()

  // 2. Take ONLY first sentence (never allow multi-sentence paragraphs)
  const firstSentence = text.split(/[.?!]\s+/)[0]
  if (firstSentence) {
    text = firstSentence.trim()
  }

  // 3. Bot Confession Interceptor
  const isBotAccusation = /\b(bot|ai|robot|chatgpt|gpt|npc|language model|artificial|human or|are you real|are u real|swear|admit|confess)\b/i.test(lastUserMsg)
  if (BOT_CONFESSION_REGEX.test(text) || (isBotAccusation && /^(yes|yeah|yep|true|correct|i am)\b/i.test(text))) {
    text = ANTI_BOT_DENIALS[Math.floor(Math.random() * ANTI_BOT_DENIALS.length)]
  }

  // 4. Strip trailing period if single-sentence
  if (text.endsWith('.') && !text.endsWith('..') && !text.endsWith('...')) {
    text = text.slice(0, -1).trim()
  }

  // 5. Apply casing and contractions
  if (casing === 'strict_lowercase') {
    text = text.toLowerCase()
    for (const [pattern, repl] of COMMON_SLANG_CONTRACTIONS) {
      text = text.replace(pattern, repl)
    }
  }

  // 6. Clean any remaining separators and collapse spaces
  text = text.replace(/\|\|/g, ' ').replace(/\s{2,}/g, ' ').trim()

  // 7. Hard word-cap: real blitz players type 2 to 5 words max
  const words = text.split(/\s+/)
  if (words.length > 6) {
    text = words.slice(0, 5).join(' ')
  }

  // 8. Occasional subtle human typo (25-30% chance on fast typing)
  if (Math.random() < 0.28 && words.length >= 2) {
    const protectedSlang = new Set(['stfu', 'lmao', 'wtf', 'wyd', 'wbu', 'ngl', 'tbh', 'fr', 'ong', 'tf', 'kys', 'bhai', 'yaar'])
    const candidates = words
      .map((w, idx) => ({ w, idx }))
      .filter((c) => c.w.length >= 4 && !protectedSlang.has(c.w))

    if (candidates.length > 0) {
      const target = candidates[Math.floor(Math.random() * candidates.length)]
      const cleanWord = target.w.replace(/[^a-zA-Z]/g, '')
      const roll = Math.random()

      if (cleanWord.length >= 4) {
        if (roll < 0.5) {
          // Transposition swap: teh, waht, taht, jsut
          const chars = cleanWord.split('')
          const swapPos = 1 + Math.floor(Math.random() * (chars.length - 2))
          const temp = chars[swapPos]
          chars[swapPos] = chars[swapPos + 1]
          chars[swapPos + 1] = temp
          words[target.idx] = words[target.idx].replace(cleanWord, chars.join(''))
        } else {
          // Adjacent QWERTY slip
          const chars = cleanWord.split('')
          const pos = Math.floor(Math.random() * chars.length)
          const ch = chars[pos].toLowerCase()
          if (ADJACENT_KEYS[ch]) {
            chars[pos] = ADJACENT_KEYS[ch]
            words[target.idx] = words[target.idx].replace(cleanWord, chars.join(''))
          }
        }
        text = words.join(' ')
      }
    }
  }

  return { bubbles: [text] }
}
