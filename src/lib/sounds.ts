/**
 * Minimal Web Audio API sound utilities.
 * All tones are synthesised in-browser — no network requests, fully offline.
 * A single AudioContext is reused to avoid the 6-context limit on mobile.
 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx || ctx.state === 'closed') {
      ctx = new AudioContext()
    }
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }
    return ctx
  } catch {
    return null
  }
}

function tone(
  freq: number,
  durationSec: number,
  volume = 0.18,
  type: OscillatorType = 'sine',
  delaySecOffset = 0,
): void {
  const ac = getCtx()
  if (!ac) return
  try {
    const now = ac.currentTime + delaySecOffset
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(volume, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec)
    osc.start(now)
    osc.stop(now + durationSec + 0.05)
  } catch {
    // Silently ignore if the context is in a bad state
  }
}

/** Soft single ding — drill phase transition or question appearance. */
export function playDing(): void {
  tone(880, 0.35, 0.18)
}

/** Two-note rising chime — correct answer. */
export function playCorrect(): void {
  tone(523.25, 0.18, 0.18) // C5
  tone(783.99, 0.25, 0.18, 'sine', 0.12) // G5
}

/** Short low pulse — incorrect answer. */
export function playIncorrect(): void {
  tone(220, 0.28, 0.12, 'triangle')
}

/** Soft tick — countdown (last N seconds of any timed phase). */
export function playTick(): void {
  tone(660, 0.08, 0.1)
}

/** Slightly louder tick for the final second. */
export function playFinalTick(): void {
  tone(880, 0.12, 0.16)
}

/**
 * Warm up the AudioContext on the first user interaction.
 * Call this from a click/tap handler so mobile browsers allow audio.
 */
export function primeAudio(): void {
  getCtx()
}
