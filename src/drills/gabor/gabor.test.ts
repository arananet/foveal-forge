import { describe, it, expect } from 'vitest'
import {
  initGaborSession,
  pickNextFreq,
  recordGaborResponse,
  summarizeGaborSession,
} from './session'
import { GABOR_CONFIG } from './config'
import type { GaborTrialResult } from '../../lib/types'

function makeTrial(
  freq: 3 | 6 | 12,
  correct: boolean,
  contrast: number,
): GaborTrialResult {
  return {
    spatialFrequencyCpd: freq,
    orientationRad: 0,
    targetPresent: true,
    respondedYes: correct,
    correct,
    contrastLevel: contrast,
    reactionTimeMs: 350,
  }
}

describe('initGaborSession', () => {
  it('sets initialContrast for all spatial frequencies', () => {
    const state = initGaborSession()
    expect(state.sfStates[3].contrast).toBe(GABOR_CONFIG.initialContrast)
    expect(state.sfStates[6].contrast).toBe(GABOR_CONFIG.initialContrast)
    expect(state.sfStates[12].contrast).toBe(GABOR_CONFIG.initialContrast)
  })

  it('starts with empty trials list', () => {
    expect(initGaborSession().trials).toHaveLength(0)
  })
})

describe('pickNextFreq', () => {
  it('returns a valid spatial frequency', () => {
    const state = initGaborSession()
    expect([3, 6, 12]).toContain(pickNextFreq(state.sfStates))
  })

  it('picks the frequency with fewest trials to balance', () => {
    let state = initGaborSession()
    // Give freq=3 two trials
    state = recordGaborResponse(state, 3, makeTrial(3, true, 0.5))
    state = recordGaborResponse(state, 3, makeTrial(3, true, 0.5))
    // freq=6 and freq=12 still have 0 trials — should not pick 3
    const next = pickNextFreq(state.sfStates)
    expect([6, 12]).toContain(next)
  })
})

describe('recordGaborResponse', () => {
  it('appends trial to trials array', () => {
    const state = initGaborSession()
    const next = recordGaborResponse(state, 6, makeTrial(6, true, 0.5))
    expect(next.trials).toHaveLength(1)
  })

  it('decreases contrast after 3 consecutive correct responses', () => {
    let state = initGaborSession()
    for (let i = 0; i < 3; i++) {
      state = recordGaborResponse(state, 3, makeTrial(3, true, state.sfStates[3].contrast))
    }
    expect(state.sfStates[3].contrast).toBeLessThan(GABOR_CONFIG.initialContrast)
  })

  it('increases contrast after an incorrect response', () => {
    let state = initGaborSession()
    state = recordGaborResponse(state, 3, makeTrial(3, false, state.sfStates[3].contrast))
    expect(state.sfStates[3].contrast).toBeGreaterThan(GABOR_CONFIG.initialContrast)
  })

  it('clamps contrast at minContrast', () => {
    let state = initGaborSession()
    for (let i = 0; i < 60; i++) {
      state = recordGaborResponse(state, 3, makeTrial(3, true, state.sfStates[3].contrast))
    }
    expect(state.sfStates[3].contrast).toBeGreaterThanOrEqual(GABOR_CONFIG.minContrast)
  })

  it('clamps contrast at maxContrast', () => {
    let state = initGaborSession()
    for (let i = 0; i < 20; i++) {
      state = recordGaborResponse(state, 3, makeTrial(3, false, state.sfStates[3].contrast))
    }
    expect(state.sfStates[3].contrast).toBeLessThanOrEqual(GABOR_CONFIG.maxContrast)
  })

  it('does not mutate other frequencies', () => {
    const state = initGaborSession()
    const next = recordGaborResponse(state, 3, makeTrial(3, false, 0.5))
    expect(next.sfStates[6].responses).toHaveLength(0)
    expect(next.sfStates[12].responses).toHaveLength(0)
  })
})

describe('summarizeGaborSession', () => {
  it('returns positive thresholds for all frequencies', () => {
    const state = initGaborSession()
    const summary = summarizeGaborSession(state)
    expect(summary.thresholds.cpd3).toBeGreaterThan(0)
    expect(summary.thresholds.cpd6).toBeGreaterThan(0)
    expect(summary.thresholds.cpd12).toBeGreaterThan(0)
  })

  it('counts trials completed correctly', () => {
    let state = initGaborSession()
    state = recordGaborResponse(state, 3, makeTrial(3, true, 0.5))
    state = recordGaborResponse(state, 6, makeTrial(6, false, 0.5))
    expect(summarizeGaborSession(state).trialsCompleted).toBe(2)
  })
})
