import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db/index.js'
import * as schema from '../db/schema/index.js'
import { env } from '../config/env.js'
import { generateUniquePublicId } from '../lib/public-id.js'
import { userProfile } from '../db/schema/users.js'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: (request) => {
    const origin = request?.headers?.get('origin')
    const allowed = [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173']
    if (
      origin &&
      /^http:\/\/(localhost|127\.0\.0\.1|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(
        origin,
      )
    ) {
      allowed.push(origin)
    }
    return allowed
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (createdUser) => {
          try {
            const publicId = await generateUniquePublicId(8)
            await db
              .insert(userProfile)
              .values({
                userId: createdUser.id,
                publicId,
                tokenBalance: 10,
                isPro: false,
              })
              .onConflictDoNothing()
          } catch (err) {
            console.error('[Auth Hook] Failed to create user profile:', err)
          }
        },
      },
    },
  },
})
