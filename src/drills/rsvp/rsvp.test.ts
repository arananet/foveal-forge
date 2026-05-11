import { describe, it, expect } from 'vitest'
import {
  initRsvpSession,
  getMsPerWord,
  recordBlockResult,
  computeFinalWpm,
  summarizeRsvpSession,
} from './session'
import { RSVP_CONFIG } from './config'
import type { RsvpBlockResult } from '../../lib/types'

function makeBlock(wpm: number, correct: boolean): RsvpBlockResult {
  return { wpm, passageIndex: 0, comprehensionCorrect: correct }
}

describe('initRsvpSession', () => {
  it('starts at initial WPM', () => {
    expect(initRsvpSession().currentWpm).toBe(RSVP_CONFIG.initialWpm)
  })

  it('starts with empty blocks', () => {
    expect(initRsvpSession().blocks).toHaveLength(0)
  })
})

describe('getMsPerWord', () => {
  it('returns 300ms at 200 WPM', () => {
    expect(getMsPerWord(200)).toBe(300)
  })

  it('returns 600ms at 100 WPM', () => {
    expect(getMsPerWord(100)).toBe(600)
  })

  it('returns 150ms at 400 WPM', () => {
    expect(getMsPerWord(400)).toBe(150)
  })
})

describe('recordBlockResult', () => {
  it('appends block to list', () => {
    const state = initRsvpSession()
    const next = recordBlockResult(state, makeBlock(200, true))
    expect(next.blocks).toHaveLength(1)
  })

  it('increases WPM by 5% on correct answer', () => {
    const state = initRsvpSession()
    const next = recordBlockResult(state, makeBlock(200, true))
    expect(next.currentWpm).toBe(Math.round(200 * 1.05))
  })

  it('decreases WPM by 10% on incorrect answer', () => {
    const state = initRsvpSession()
    const next = recordBlockResult(state, makeBlock(200, false))
    expect(next.currentWpm).toBe(Math.round(200 * 0.9))
  })

  it('clamps WPM at minimum 80', () => {
    let state = initRsvpSession()
    for (let i = 0; i < 50; i++) {
      state = recordBlockResult(state, makeBlock(state.currentWpm, false))
    }
    expect(state.currentWpm).toBeGreaterThanOrEqual(80)
  })

  it('clamps WPM at maximum 600', () => {
    let state = initRsvpSession()
    for (let i = 0; i < 100; i++) {
      state = recordBlockResult(state, makeBlock(state.currentWpm, true))
    }
    expect(state.currentWpm).toBeLessThanOrEqual(600)
  })
})

describe('computeFinalWpm', () => {
  it('returns initialWpm for empty list', () => {
    expect(computeFinalWpm([])).toBe(RSVP_CONFIG.initialWpm)
  })

  it('returns last block wpm for short list', () => {
    const blocks = [makeBlock(200, true), makeBlock(210, false)]
    expect(computeFinalWpm(blocks)).toBe(210)
  })

  it('returns highest WPM with 3-block ≥80% accuracy window', () => {
    const blocks = [
      makeBlock(200, true),
      makeBlock(210, true),
      makeBlock(220, true), // window: 3/3 correct at 220
      makeBlock(231, false),
      makeBlock(208, false),
      makeBlock(187, false), // window: 0/3 correct — not counted
    ]
    expect(computeFinalWpm(blocks)).toBe(220)
  })
})

describe('summarizeRsvpSession', () => {
  it('reports blocksCompleted', () => {
    let state = initRsvpSession()
    state = recordBlockResult(state, makeBlock(200, true))
    state = recordBlockResult(state, makeBlock(210, false))
    expect(summarizeRsvpSession(state).blocksCompleted).toBe(2)
  })

  it('includes finalWpm', () => {
    const state = initRsvpSession()
    const summary = summarizeRsvpSession(state)
    expect(summary.finalWpm).toBeGreaterThan(0)
  })
})
