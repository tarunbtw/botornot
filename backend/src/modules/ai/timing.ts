/**
 * Temporal Physics Simulator for realistic human reading and typing cadence.
 */

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculates realistic reading pause before a human starts reacting or typing.
 * Based on ~250 words per minute average reading rate.
 */
export function calculateReadingDelayMs(userMsg: string): number {
  const charCount = (userMsg || '').trim().length
  // ~35ms per character of incoming message, clamped between 900ms and 2800ms
  const base = Math.min(2800, Math.max(900, charCount * 35))
  const jitter = Math.floor(Math.random() * 500)
  return base + jitter
}

/**
 * Calculates realistic typing duration based on ~45-65 words per minute.
 * (~110ms to 150ms per character).
 */
export function calculateTypingDelayMs(replyText: string): number {
  const charCount = (replyText || '').trim().length
  const msPerChar = 110 + Math.random() * 40
  // Clamp between 1100ms and 5500ms
  const base = Math.min(5500, Math.max(1100, charCount * msPerChar))
  const jitter = Math.floor(Math.random() * 450)
  return Math.floor(base + jitter)
}
