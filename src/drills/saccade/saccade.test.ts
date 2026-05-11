import { describe, it, expect } from 'vitest'
import {
  initSaccadeSession,
  randomSloanLetter,
  recordSaccadeResponse,
  summarizeSaccadeSession,
} from './session'
import { SACCADE_CONFIG } from './config'
import type { SaccadeTrialResult } from '../../lib/types'

function makeTrial(correct: boolean, ecc = 4, spacing = 1.5): SaccadeTrialResult {
  return {
    eccentricityDeg: ecc,
    spacingDeg: spacing,
    targetLetter: 'C',
    respondedLetter: correct ? 'C' : 'D',
    correct,
    reactionTimeMs: 500,
  }
}

describe('initSaccadeSession', () => {
  it('starts with positive spacing', () => {
    const state = initSaccadeSession()
    expect(state.currentSpacingDeg).toBeGreaterThan(0)
  })

  it('starts with empty trials', () => {
    expect(initSaccadeSession().trials).toHaveLength(0)
  })

  it('initial spacing is 1.5x critical spacing at 4 degrees', () => {
    const state = initSaccadeSession()
    const critSpacing = 0.5 * 4 // Bouma's law: 0.5 × ecc
    const expected = critSpacing * SACCADE_CONFIG.initialSpacingMultiplier
    expect(state.currentSpacingDeg).toBeCloseTo(expected)
  })
})

describe('randomSloanLetter', () => {
  it('returns a valid Sloan letter', () => {
    const letter = randomSloanLetter()
    expect(SACCADE_CONFIG.sloanLetters).toContain(letter)
  })

  it('excludes specified letters', () => {
    const excluded = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V'] as const
    const letter = randomSloanLetter(excluded)
    expect(letter).toBe('Z')
  })

  it('falls back to full set when all excluded', () => {
    const allLetters = [...SACCADE_CONFIG.sloanLetters]
    const letter = randomSloanLetter(allLetters)
    expect(SACCADE_CONFIG.sloanLetters).toContain(letter)
  })
})

describe('recordSaccadeResponse', () => {
  it('appends trial to list', () => {
    const state = initSaccadeSession()
    const next = recordSaccadeResponse(state, makeTrial(true))
    expect(next.trials).toHaveLength(1)
  })

  it('decreases spacing on correct response', () => {
    const state = initSaccadeSession()
    const next = recordSaccadeResponse(state, makeTrial(true))
    expect(next.currentSpacingDeg).toBeLessThan(state.currentSpacingDeg)
  })

  it('increases spacing on incorrect response', () => {
    const state = initSaccadeSession()
    const next = recordSaccadeResponse(state, makeTrial(false))
    expect(next.currentSpacingDeg).toBeGreaterThan(state.currentSpacingDeg)
  })

  it('clamps spacing at minimum', () => {
    let state = initSaccadeSession()
    for (let i = 0; i < 100; i++) {
      state = recordSaccadeResponse(state, makeTrial(true))
    }
    expect(state.currentSpacingDeg).toBeGreaterThanOrEqual(SACCADE_CONFIG.minSpacingDeg)
  })

  it('clamps spacing at maximum', () => {
    let state = initSaccadeSession()
    for (let i = 0; i < 100; i++) {
      state = recordSaccadeResponse(state, makeTrial(false))
    }
    expect(state.currentSpacingDeg).toBeLessThanOrEqual(SACCADE_CONFIG.maxSpacingDeg)
  })
})

describe('summarizeSaccadeSession', () => {
  it('returns zero values for empty session', () => {
    const summary = summarizeSaccadeSession(initSaccadeSession())
    expect(summary.accuracy).toBe(0)
    expect(summary.trialsCompleted).toBe(0)
  })

  it('computes accuracy correctly', () => {
    let state = initSaccadeSession()
    state = recordSaccadeResponse(state, makeTrial(true))
    state = recordSaccadeResponse(state, makeTrial(true))
    state = recordSaccadeResponse(state, makeTrial(false))
    const summary = summarizeSaccadeSession(state)
    expect(summary.accuracy).toBeCloseTo(2 / 3)
    expect(summary.trialsCompleted).toBe(3)
  })

  it('reports finalSpacingDeg from current state', () => {
    const state = initSaccadeSession()
    const summary = summarizeSaccadeSession(state)
    expect(summary.finalSpacingDeg).toBe(state.currentSpacingDeg)
  })
})
