export type GameState = 'HOME' | 'MATCHMAKING' | 'CHAT' | 'GUESS' | 'LEADERBOARD' | 'PROFILE' | 'QUESTS'

export type OpponentType = 'AI' | 'HUMAN'

export interface Message {
  id: string
  sender: 'user' | 'opponent'
  text: string
  timestamp: number
}

export interface GlobalStats {
  gamesPlayed24h: number
  aiWinRate24h: number
  humanAccuracyRate: number
}
