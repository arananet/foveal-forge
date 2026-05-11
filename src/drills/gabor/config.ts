export const GABOR_CONFIG = {
  spatialFrequencies: [3, 6, 12] as const,
  orientations: [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4] as const,
  initialContrast: 0.5,
  minContrast: 0.01,
  maxContrast: 1.0,
  stepSize: 0.1,
  flankerSeparationLambda: 3,
  durationMs: 4 * 60_000,
  stimulusMs: 500,
  fixationMs: 500,
  feedbackMs: 300,
} as const

export type SpatialFreq = (typeof GABOR_CONFIG.spatialFrequencies)[number]
