declare global {
  interface Window {
    CrazyGames?: {
      SDK: {
        init: () => Promise<void>
        environment?: string
        game: {
          gameplayStart: () => void
          gameplayStop: () => void
          happytime: () => void
          sdkGameLoadingStart: () => void
          sdkGameLoadingStop: () => void
        }
        ad: {
          requestAd: (
            type: 'midgame' | 'rewarded',
            callbacks: {
              adStarted?: () => void
              adFinished?: () => void
              adError?: (error: any) => void
            },
          ) => void
        }
      }
    }
  }
}

let isInitialized = false

/**
 * Initializes the CrazyGames v3 SDK asynchronously.
 * Safe to call in any environment (gracefully ignores if SDK not loaded).
 */
export async function initCrazyGames(): Promise<void> {
  if (isInitialized) return
  if (typeof window !== 'undefined' && window.CrazyGames?.SDK) {
    try {
      window.CrazyGames.SDK.game?.sdkGameLoadingStart()
      await window.CrazyGames.SDK.init()
      isInitialized = true
      window.CrazyGames.SDK.game?.sdkGameLoadingStop()
      console.log('[CrazyGames] SDK v3 initialized successfully')
    } catch (err) {
      console.warn('[CrazyGames] SDK initialization warning:', err)
    }
  }
}

/**
 * Signals when active gameplay begins (chat round started).
 */
export function cgGameplayStart(): void {
  try {
    window.CrazyGames?.SDK?.game?.gameplayStart()
  } catch {}
}

/**
 * Signals when active gameplay stops (menu, guess screen, round finished).
 */
export function cgGameplayStop(): void {
  try {
    window.CrazyGames?.SDK?.game?.gameplayStop()
  } catch {}
}

/**
 * Celebration event for when the user correctly guesses the opponent.
 */
export function cgHappyTime(): void {
  try {
    window.CrazyGames?.SDK?.game?.happytime()
  } catch {}
}

/**
 * Requests a rewarded ad from CrazyGames.
 * Automatically gives reward on completion, or falls back gracefully on error/outside CrazyGames.
 */
export function cgRequestRewardedAd(onReward: () => void): void {
  if (window.CrazyGames?.SDK?.ad) {
    window.CrazyGames.SDK.ad.requestAd('rewarded', {
      adStarted: () => {
        console.log('[CrazyGames] Rewarded ad playing')
      },
      adFinished: () => {
        console.log('[CrazyGames] Rewarded ad completed, granting reward')
        onReward()
      },
      adError: (err) => {
        console.warn('[CrazyGames] Rewarded ad error/unfilled:', err)
        // Fallback so player is never blocked from getting their coins/extension
        onReward()
      },
    })
  } else {
    // Local development or standalone fallback simulation
    setTimeout(onReward, 1200)
  }
}

