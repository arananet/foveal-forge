import { criticalCrowdingSpacingDeg } from '../../lib/psychophysics'
import { SACCADE_CONFIG, type SloanLetter } from './config'
import type { SaccadeTrialResult, SaccadeDrillSummary } from '../../lib/types'

export interface SaccadeSessionState {
  currentSpacingDeg: number
  trials: SaccadeTrialResult[]
  startedAt: number
}

export function initSaccadeSession(): SaccadeSessionState {
  const initialEcc = 4
  const critSpacing = criticalCrowdingSpacingDeg(initialEcc)
  return {
    currentSpacingDeg: critSpacing * SACCADE_CONFIG.initialSpacingMultiplier,
    trials: [],
    startedAt: Date.now(),
  }
}

export function randomEccentricityDeg(): number {
  const { minEccentricityDeg, maxEccentricityDeg } = SACCADE_CONFIG
  return minEccentricityDeg + Math.random() * (maxEccentricityDeg - minEccentricityDeg)
}

export function randomSloanLetter(exclude: readonly SloanLetter[] = []): SloanLetter {
  const pool = SACCADE_CONFIG.sloanLetters.filter((l) => !exclude.includes(l))
  const src = pool.length > 0 ? pool : SACCADE_CONFIG.sloanLetters
  return src[Math.floor(Math.random() * src.length)] ?? 'C'
}

export function recordSaccadeResponse(
  state: SaccadeSessionState,
  trial: SaccadeTrialResult,
): SaccadeSessionState {
  const raw = trial.correct
    ? state.currentSpacingDeg * SACCADE_CONFIG.spacingStepDown
    : state.currentSpacingDeg * SACCADE_CONFIG.spacingStepUp

  const nextSpacing = Math.max(
    SACCADE_CONFIG.minSpacingDeg,
    Math.min(SACCADE_CONFIG.maxSpacingDeg, raw),
  )

  return {
    ...state,
    currentSpacingDeg: nextSpacing,
    trials: [...state.trials, trial],
  }
}

export function summarizeSaccadeSession(state: SaccadeSessionState): SaccadeDrillSummary {
  const { trials } = state
  if (trials.length === 0) {
    return {
      accuracy: 0,
      meanReactionTimeMs: 0,
      finalSpacingDeg: state.currentSpacingDeg,
      trialsCompleted: 0,
    }
  }
  const correct = trials.filter((t) => t.correct).length
  const meanRt = trials.reduce((s, t) => s + t.reactionTimeMs, 0) / trials.length
  return {
    accuracy: correct / trials.length,
    meanReactionTimeMs: Math.round(meanRt),
    finalSpacingDeg: state.currentSpacingDeg,
    trialsCompleted: trials.length,
  }
}
