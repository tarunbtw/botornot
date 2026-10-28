import crypto from 'crypto'
import { db } from '../db/index.js'
import { userProfile } from '../db/schema/users.js'
import { eq } from 'drizzle-orm'

export function randomPublicId(): string {
  return crypto.randomBytes(4).toString('hex')
}

export async function generateUniquePublicId(_length = 8): Promise<string> {
  const candidate = randomPublicId()
  const existing = await db.query.userProfile.findFirst({
    where: eq(userProfile.publicId, candidate),
  })
  return existing ? `${candidate}${Date.now().toString(36).slice(-3)}` : candidate
}
