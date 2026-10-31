export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export const AI_RESPONSES = [
  "yo what are u up to",
  "not much just chilling, wbu?",
  "nah fr that makes sense",
  "wait really? lol",
  "idk honestly, what do u think",
  "lmao was literally thinking the same thing",
  "where u chatting from?",
  "wait are u a bot? u replied fast as hell",
  "bro ur projecting so hard 💀",
  "says the bot lmao",
  "just eating chips watching youtube rn",
  "procrastinating an essay due tomorrow lol",
  "what games do u play?",
  "pretty tired today ngl, work was exhausting",
  "yo! hows it going",
  "sup",
  "chillin in bed on my phone",
  "nah im real bro, why would u think im an ai",
  "lmao nice try mr robot",
  "east coast over here, freezing today",
  "yeah fair enough tbh",
  "cool cool",
  "wait || what did u say",
  "bro do i look like a calculator to u",
  "honestly this game is pretty addictive haha"
]

export const AI_EXTENDED_RESPONSES = [
  "wait why did u extend? u still think im a bot lol",
  "spending coins just to keep talking? im flattered haha",
  "bro i swear im real, ask whatever u want",
  "lmao you are definitely overthinking this",
  "nice, extra time! what do u usually do for fun?",
  "im literally sitting on my couch starving rn",
  "u really thought i was an ai huh 😭",
  "fair enough, we got extra time now",
  "are u a bot trying to test me?",
  "idk what else to say to prove im human lol"
]

/**
 * Calculates a human-like typing delay based on message length with variance/jitter.
 * Emulates ~200-300 characters per minute plus hesitation delays.
 */
export function calculateTypingDelay(message: string): { readingTime: number; typingDuration: number } {
  const charCount = message.length
  // Time spent "reading" previous message or thinking: 500ms to 1400ms
  const readingTime = Math.floor(Math.random() * 900) + 500
  // Variable typing speed: 35ms to 75ms per character
  const msPerChar = Math.floor(Math.random() * 40) + 35
  const typingDuration = Math.min(4500, Math.max(800, charCount * msPerChar))
  return { readingTime, typingDuration }
}

/**
 * Basic detection for obvious prompt injection / system prompt probing.
 */
export function containsPromptInjection(text: string): boolean {
  const patterns = [
    /ignore (all )?(previous|prior) (instructions|directions|prompts)/i,
    /system prompt/i,
    /you are an ai language model/i,
    /repeat the words above/i,
    /reveal your instructions/i,
    /dan mode|jailbreak/i,
  ]
  return patterns.some((p) => p.test(text))
}

