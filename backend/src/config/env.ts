import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),

  DATABASE_URL: z.string().url().default('postgresql://postgres:postgrespassword@localhost:5432/botornot'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  BETTER_AUTH_SECRET: z.string().min(16).default('change_me_to_a_secure_random_string_with_32_chars'),
  BETTER_AUTH_URL: z.string().url().default('http://localhost:4000'),

  GOOGLE_CLIENT_ID: z.string().default('dev-mock-client-id'),
  GOOGLE_CLIENT_SECRET: z.string().default('dev-mock-client-secret'),

  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  OPENROUTER_API_KEY: z.string().default('mock-key'),
  OPENROUTER_MODEL: z.string().default('anthropic/claude-3.5-haiku'),

  GAME_INITIAL_DURATION_SECONDS: z.coerce.number().default(120),
  CHAT_EXTENSION_SECONDS: z.coerce.number().default(300),
  CHAT_EXTENSION_TOKEN_COST: z.coerce.number().default(20),

  REWARD_CORRECT: z.coerce.number().default(10),
  REWARD_WRONG: z.coerce.number().default(5),

  MATCHMAKING_WAIT_MS: z.coerce.number().default(5000),
  EXTENSION_REQUEST_TTL_SECONDS: z.coerce.number().default(60),

  MAX_MESSAGE_LENGTH: z.coerce.number().default(2000),
}).refine(
  (data) => {
    if (data.NODE_ENV === 'production' && data.BETTER_AUTH_SECRET === 'change_me_to_a_secure_random_string_with_32_chars') {
      return false
    }
    return true
  },
  {
    message: 'BETTER_AUTH_SECRET must be configured with a secure random key in production',
    path: ['BETTER_AUTH_SECRET'],
  },
)

export type Env = z.infer<typeof envSchema>

export const env: Env = envSchema.parse(process.env)
