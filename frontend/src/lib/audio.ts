let audioCtx: AudioContext | null = null
let soundEnabled = true

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled
}

export function isSoundEnabled() {
  return soundEnabled
}

export function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function vibrate(pattern: number | number[]) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      // ignore
    }
  }
}

export function playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
  if (!soundEnabled) return
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime)

    gain.gain.setValueAtTime(vol, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {
    // audio failure silent catch
  }
}

export function playMatchFound() {
  if (!soundEnabled) return
  vibrate([100, 50, 100])
  playTone(440, 'sine', 0.1, 0.1)
  setTimeout(() => playTone(659.25, 'sine', 0.15, 0.15), 100)
  setTimeout(() => playTone(880, 'sine', 0.3, 0.15), 250)
}

export function playTimerEnd() {
  if (!soundEnabled) return
  vibrate([200, 100, 200, 100, 400])
  playTone(300, 'square', 0.2, 0.15)
  setTimeout(() => playTone(250, 'square', 0.5, 0.2), 200)
}

export function playTick() {
  if (!soundEnabled) return
  vibrate(20)
  playTone(800, 'sine', 0.05, 0.05)
}

export function playCorrect() {
  if (!soundEnabled) return
  vibrate([100, 50, 100, 50, 200])
  playTone(523.25, 'sine', 0.1, 0.1) // C5
  setTimeout(() => playTone(659.25, 'sine', 0.1, 0.1), 100) // E5
  setTimeout(() => playTone(783.99, 'sine', 0.4, 0.15), 200) // G5
}

export function playIncorrect() {
  if (!soundEnabled) return
  vibrate([300])
  playTone(300, 'sawtooth', 0.2, 0.1)
  setTimeout(() => playTone(250, 'sawtooth', 0.2, 0.1), 150)
  setTimeout(() => playTone(200, 'sawtooth', 0.4, 0.15), 300)
}

export function playReward() {
  if (!soundEnabled) return
  vibrate([80, 40, 80, 40, 150])
  playTone(440, 'triangle', 0.08, 0.1) // A4
  setTimeout(() => playTone(554.37, 'triangle', 0.08, 0.12), 70) // C#5
  setTimeout(() => playTone(659.25, 'triangle', 0.1, 0.12), 140) // E5
  setTimeout(() => playTone(880, 'triangle', 0.25, 0.15), 210) // A5
}

