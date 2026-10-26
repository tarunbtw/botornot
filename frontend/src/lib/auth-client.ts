import { createAuthClient } from 'better-auth/react'

const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL || `http://${defaultHost}:4000`,
})

export const { signIn, signOut, useSession } = authClient
