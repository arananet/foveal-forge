export type DrillId = 'd1-fixation' | 'd2-gabor' | 'd3-saccade' | 'd4-rsvp'

export interface TrialResult {
  correct: boolean
  reactionTimeMs: number
  level: number
}

export interface Session {
  id: string
  startedAt: number
  completedAt: number | null
  protocolVersion: string
  drillId: DrillId
  trials: TrialResult[]
  eyeStrainScore: number | null
}
