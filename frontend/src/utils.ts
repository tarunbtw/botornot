export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ')
}

export const AI_RESPONSES = [
  "hey there! how's it going?",
  "not much, just chilling. you?",
  "haha yeah totally agree",
  "wait really? that's crazy",
  "idk tbh, what do you think?",
  "lol I was just thinking the same thing",
  "where are you from?",
  "are you a bot? 😂",
  "prove you're human!",
  "beep boop... jk I'm real haha",
  "what's your favorite movie or game?",
  "I'm listening to some music right now, what about you?",
  "yo, what's good?",
  "sup!",
  "im just hanging out online",
  "u real or an AI?",
  "nah im human bro, chilling after work",
  "that's awesome! do you play any video games?",
  "haha you're definitely trying to trick me into saying something robotic",
  "tell me something only a human would know",
  "honestly this turing game is so addictive lol",
  "lmao nice try",
  "I was thinking about getting pizza later",
  "yeah fair enough"
]

export const AI_EXTENDED_RESPONSES = [
  "Why did you extend the chat? Still not sure?",
  "Haha, spending coins just to keep talking to me? I'm flattered.",
  "Okay seriously, what question can I answer to convince you?",
  "Ask me a riddle or a cultural reference!",
  "I promise I'm not ChatGPT lol, I make way too many typos",
  "You're really overthinking this!",
  "Nice! We have extra time now. What do you do for fun?",
  "What's the meaning of life? Idk, 42?",
  "I'm literally sitting on my couch eating snacks rn.",
  "If I was an AI, would I be making jokes like this?"
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

