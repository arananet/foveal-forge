import { describe, it, expect } from 'vitest'
import { gaborMichelsonContrast, staircase3Down1Up } from './psychophysics'

describe('gaborMichelsonContrast', () => {
  it('returns 1 for full contrast (L_min=0)', () => {
    expect(gaborMichelsonContrast(100, 0)).toBe(1)
  })

  it('returns 0 for zero contrast (L_max === L_min)', () => {
    expect(gaborMichelsonContrast(50, 50)).toBe(0)
  })

  it('returns 0 when both luminances are 0', () => {
    expect(gaborMichelsonContrast(0, 0)).toBe(0)
  })

  it('computes mid contrast correctly', () => {
    expect(gaborMichelsonContrast(75, 25)).toBeCloseTo(0.5)
  })

  it('throws when L_max < L_min', () => {
    expect(() => gaborMichelsonContrast(10, 20)).toThrow(RangeError)
  })

  it('throws for negative luminance', () => {
    expect(() => gaborMichelsonContrast(-1, 0)).toThrow(RangeError)
    expect(() => gaborMichelsonContrast(0, -1)).toThrow(RangeError)
  })
})

describe('staircase3Down1Up', () => {
  it('returns current level unchanged with no responses', () => {
    const { nextLevel, terminate } = staircase3Down1Up(0.5, [], 0.1)
    expect(nextLevel).toBe(0.5)
    expect(terminate).toBe(false)
  })

  it('decreases level after 3 consecutive correct responses', () => {
    const { nextLevel } = staircase3Down1Up(0.5, [true, true, true], 0.1)
    expect(nextLevel).toBeCloseTo(0.4)
  })

  it('increases level after 1 incorrect response', () => {
    const { nextLevel } = staircase3Down1Up(0.5, [false], 0.1)
    expect(nextLevel).toBeCloseTo(0.6)
  })

  it('does not decrease below 0', () => {
    const { nextLevel } = staircase3Down1Up(0.05, [true, true, true], 0.1)
    expect(nextLevel).toBe(0)
  })

  it('does not change level when last two correct but not three', () => {
    const { nextLevel } = staircase3Down1Up(0.5, [false, true, true], 0.1)
    expect(nextLevel).toBe(0.5)
  })

  it('increases on incorrect regardless of prior correct streak', () => {
    const { nextLevel } = staircase3Down1Up(0.5, [true, true, false], 0.1)
    expect(nextLevel).toBeCloseTo(0.6)
  })

  it('throws for non-positive stepSize', () => {
    expect(() => staircase3Down1Up(0.5, [], 0)).toThrow(RangeError)
    expect(() => staircase3Down1Up(0.5, [], -0.1)).toThrow(RangeError)
  })
})
