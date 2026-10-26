const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${defaultHost}:4000`

export interface UserStats {
  publicId: string
  tokenBalance: number
  isPro: boolean
  totalGames: number
  totalCorrectGuesses: number
  winPercentage: number
  winsLast24Hours: number
}

export interface UserProfileResponse {
  id: string
  name: string
  email: string
  image?: string | null
  publicId: string
  tokenBalance: number
  isPro: boolean
  token?: string
}

export function getAuthToken(): string | null {
  return localStorage.getItem('botornot_auth_token')
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchMe(): Promise<UserProfileResponse | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/me`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function fetchStats(): Promise<UserStats | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/me/stats`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export interface GlobalStats {
  gamesPlayed24h: number
  aiWinRate24h: number
  humanAccuracyRate: number
}

export async function fetchGlobalStats(): Promise<GlobalStats | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/stats/global`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function createGuestSession(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/guest-session`, {
      method: 'POST',
      credentials: 'include',
    })
    return res.ok
  } catch {
    return false
  }
}

export async function fetchActiveGame() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/games/active`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function fetchGame(gameId: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/games/${gameId}`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function fetchGameMessages(gameId: string) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/games/${gameId}/messages`, {
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.messages || []
  } catch {
    return []
  }
}

export async function deleteAccount(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/me`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    })
    if (res.ok) {
      localStorage.removeItem('botornot_auth_token')
      return true
    }
    return false
  } catch {
    return false
  }
}

export async function logout(): Promise<void> {
  localStorage.removeItem('botornot_auth_token')
  try {
    await fetch(`${BACKEND_URL}/api/auth/sign-out`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
      },
      credentials: 'include',
    })
  } catch {
    // Ignore
  }
}
