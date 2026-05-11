export const SACCADE_CONFIG = {
  sloanLetters: ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'] as const,
  maxEccentricityDeg: 8,
  minEccentricityDeg: 2,
  exposureMs: 150,
  maskMs: 250,
  fixationMs: 500,
  durationMs: 3 * 60_000,
  initialSpacingMultiplier: 1.5,
  spacingStepDown: 0.85,
  spacingStepUp: 1.2,
  minSpacingDeg: 0.1,
  maxSpacingDeg: 8,
  letterSizeDeg: 0.6,
} as const

export type SloanLetter = (typeof SACCADE_CONFIG.sloanLetters)[number]
