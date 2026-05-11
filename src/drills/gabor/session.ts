import { staircase3Down1Up } from '../../lib/psychophysics'
import { GABOR_CONFIG, type SpatialFreq } from './config'
import type { GaborTrialResult, GaborDrillSummary } from '../../lib/types'

interface SfState {
  contrast: number
  responses: boolean[]
  reversals: number[]
  lastDirection: 'up' | 'down' | null
}

export interface GaborSessionState {
  sfStates: Record<SpatialFreq, SfState>
  trials: GaborTrialResult[]
  startedAt: number
}

function makeSfState(): SfState {
  return {
    contrast: GABOR_CONFIG.initialContrast,
    responses: [],
    reversals: [],
    lastDirection: null,
  }
}

export function initGaborSession(): GaborSessionState {
  return {
    sfStates: { 3: makeSfState(), 6: makeSfState(), 12: makeSfState() },
    trials: [],
    startedAt: Date.now(),
  }
}

export function pickNextFreq(sfStates: Record<SpatialFreq, SfState>): SpatialFreq {
  const freqs: SpatialFreq[] = [3, 6, 12]
  let minTrials = Infinity
  let picked: SpatialFreq = 3
  for (const freq of freqs) {
    const count = sfStates[freq].responses.length
    if (count < minTrials) {
      minTrials = count
      picked = freq
    }
  }
  return picked
}

export function recordGaborResponse(
  state: GaborSessionState,
  freq: SpatialFreq,
  trial: GaborTrialResult,
): GaborSessionState {
  const sfState = state.sfStates[freq]
  const newResponses = [...sfState.responses, trial.correct]

  const { nextLevel } = staircase3Down1Up(sfState.contrast, newResponses, GABOR_CONFIG.stepSize)
  const clamped = Math.max(GABOR_CONFIG.minContrast, Math.min(GABOR_CONFIG.maxContrast, nextLevel))

  const direction: 'up' | 'down' | null =
    clamped < sfState.contrast ? 'down' : clamped > sfState.contrast ? 'up' : null

  const newReversals =
    direction !== null && sfState.lastDirection !== null && direction !== sfState.lastDirection
      ? [...sfState.reversals, sfState.contrast]
      : sfState.reversals

  const newSfState: SfState = {
    contrast: clamped,
    responses: newResponses,
    reversals: newReversals,
    lastDirection: direction ?? sfState.lastDirection,
  }

  return {
    ...state,
    sfStates: { ...state.sfStates, [freq]: newSfState },
    trials: [...state.trials, trial],
  }
}

function estimateThreshold(sfState: SfState): number {
  const revs = sfState.reversals
  if (revs.length >= 4) {
    const tail = revs.slice(Math.floor(revs.length / 2))
    return tail.reduce((a, b) => a + b, 0) / tail.length
  }
  return sfState.contrast
}

export function summarizeGaborSession(state: GaborSessionState): GaborDrillSummary {
  return {
    thresholds: {
      cpd3: estimateThreshold(state.sfStates[3]),
      cpd6: estimateThreshold(state.sfStates[6]),
      cpd12: estimateThreshold(state.sfStates[12]),
    },
    trialsCompleted: state.trials.length,
  }
}
