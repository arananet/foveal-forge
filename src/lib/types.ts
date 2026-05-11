export type DrillId = 'd1-fixation' | 'd2-gabor' | 'd3-saccade' | 'd4-rsvp'

export interface GaborTrialResult {
  spatialFrequencyCpd: 3 | 6 | 12
  orientationRad: number
  targetPresent: boolean
  respondedYes: boolean
  correct: boolean
  contrastLevel: number
  reactionTimeMs: number
}

export interface SaccadeTrialResult {
  eccentricityDeg: number
  spacingDeg: number
  targetLetter: string
  respondedLetter: string
  correct: boolean
  reactionTimeMs: number
}

export interface RsvpBlockResult {
  wpm: number
  passageIndex: number
  comprehensionCorrect: boolean
}

export interface GaborDrillSummary {
  /** Contrast threshold per spatial frequency (lower = better) */
  thresholds: { cpd3: number; cpd6: number; cpd12: number }
  trialsCompleted: number
}

export interface SaccadeDrillSummary {
  accuracy: number
  meanReactionTimeMs: number
  /** Best crowding spacing estimate in degrees (lower = better) */
  finalSpacingDeg: number
  trialsCompleted: number
}

export interface RsvpDrillSummary {
  /** Sustained WPM at ≥80% comprehension (higher = better) */
  finalWpm: number
  blocksCompleted: number
}

export interface SessionResult {
  id: string
  startedAt: number
  completedAt: number | null
  protocolVersion: string
  eyeStrainScore: number | null
  gabor?: GaborDrillSummary
  saccade?: SaccadeDrillSummary
  rsvp?: RsvpDrillSummary
}

export interface BaselineData {
  completedAt: number
  age: number
  correction: 'none' | 'glasses' | 'contacts'
  knownConditions: string
  /** Michelson contrast threshold from simplified Pelli-Robson test */
  contrastThreshold: number
  /** WPM from simplified MNREAD-style reading speed test */
  readingSpeedWpm: number
}
