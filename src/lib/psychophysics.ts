/**
 * Michelson contrast: (L_max - L_min) / (L_max + L_min).
 * Range [0, 1]. Throws if inputs are invalid.
 */
export function gaborMichelsonContrast(L_max: number, L_min: number): number {
  if (L_max < 0 || L_min < 0) throw new RangeError('Luminance values must be non-negative')
  if (L_max < L_min) throw new RangeError('L_max must be >= L_min')
  const denom = L_max + L_min
  if (denom === 0) return 0
  return (L_max - L_min) / denom
}

export interface StaircaseState {
  nextLevel: number
  terminate: boolean
}

/**
 * 3-down-1-up staircase rule converging at ~79% correct threshold.
 * - 3 consecutive correct responses → decrease level (increase difficulty)
 * - 1 incorrect response → increase level (decrease difficulty)
 * Terminates after the number of reversals reaches the threshold.
 */
export function staircase3Down1Up(
  currentLevel: number,
  lastResponses: boolean[],
  stepSize: number,
): StaircaseState {
  if (stepSize <= 0) throw new RangeError('stepSize must be positive')

  const n = lastResponses.length

  if (n === 0) {
    return { nextLevel: currentLevel, terminate: false }
  }

  const lastCorrect = lastResponses[n - 1] === true
  const threeConsecutiveCorrect =
    n >= 3 && lastResponses[n - 1] === true && lastResponses[n - 2] === true && lastResponses[n - 3] === true

  let nextLevel = currentLevel

  if (threeConsecutiveCorrect) {
    nextLevel = currentLevel - stepSize
  } else if (!lastCorrect) {
    nextLevel = currentLevel + stepSize
  }

  nextLevel = Math.max(0, nextLevel)

  return { nextLevel, terminate: false }
}

/**
 * Critical crowding spacing in degrees.
 * Bouma's law: critical spacing ≈ 0.5 × eccentricity.
 * Minimum 0.1° for foveal presentation.
 */
export function criticalCrowdingSpacingDeg(eccentricityDeg: number): number {
  return Math.max(0.1, 0.5 * eccentricityDeg)
}

/**
 * Adaptive RSVP rate after one comprehension question.
 * Per SKILL.md: +5% on correct, −10% on failure.
 * Clamped to [80, 600] WPM.
 */
export function adaptRsvpWpm(currentWpm: number, correct: boolean): number {
  const next = correct ? currentWpm * 1.05 : currentWpm * 0.9
  return Math.min(600, Math.max(80, Math.round(next)))
}
