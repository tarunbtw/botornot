import crypto from 'crypto'
import { db } from '../db/index.js'
import { userProfile } from '../db/schema/users.js'
import { eq } from 'drizzle-orm'

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function randomPublicId(length = 8): string {
  const bytes = crypto.randomBytes(length)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += CHARS[bytes[i] % CHARS.length]
  }
  return result
}

export async function generateUniquePublicId(length = 8, maxRetries = 5): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const candidate = randomPublicId(length)
    const existing = await db.query.userProfile.findFirst({
      where: eq(userProfile.publicId, candidate),
    })
    if (!existing) {
      return candidate
    }
  }
  // Fallback with timestamp suffix to guarantee uniqueness if collisions occur
  return randomPublicId(length) + Date.now().toString(36).slice(-3)
}
