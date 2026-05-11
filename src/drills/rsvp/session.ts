import { adaptRsvpWpm } from '../../lib/psychophysics'
import { RSVP_CONFIG } from './config'
import type { RsvpBlockResult, RsvpDrillSummary } from '../../lib/types'

export interface RsvpSessionState {
  currentWpm: number
  blocks: RsvpBlockResult[]
  startedAt: number
}

export function initRsvpSession(): RsvpSessionState {
  return {
    currentWpm: RSVP_CONFIG.initialWpm,
    blocks: [],
    startedAt: Date.now(),
  }
}

export function getMsPerWord(wpm: number): number {
  return Math.round(60_000 / wpm)
}

export function recordBlockResult(
  state: RsvpSessionState,
  result: RsvpBlockResult,
): RsvpSessionState {
  const nextWpm = adaptRsvpWpm(state.currentWpm, result.comprehensionCorrect)
  return {
    ...state,
    currentWpm: nextWpm,
    blocks: [...state.blocks, result],
  }
}

/** Highest WPM where the most recent 3-block window had ≥80% comprehension. */
export function computeFinalWpm(blocks: RsvpBlockResult[]): number {
  if (blocks.length === 0) return RSVP_CONFIG.initialWpm
  if (blocks.length < 3) {
    const last = blocks[blocks.length - 1]
    return last?.wpm ?? RSVP_CONFIG.initialWpm
  }

  let bestWpm: number = RSVP_CONFIG.initialWpm
  for (let i = 2; i < blocks.length; i++) {
    const w0 = blocks[i - 2]
    const w1 = blocks[i - 1]
    const w2 = blocks[i]
    if (!w0 || !w1 || !w2) continue
    const acc = [w0, w1, w2].filter((b) => b.comprehensionCorrect).length / 3
    if (acc >= 0.8 && w2.wpm > bestWpm) bestWpm = w2.wpm
  }
  return bestWpm
}

export function summarizeRsvpSession(state: RsvpSessionState): RsvpDrillSummary {
  return {
    finalWpm: computeFinalWpm(state.blocks),
    blocksCompleted: state.blocks.length,
  }
}
