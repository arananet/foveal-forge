import { useCallback } from 'react'
import { useTimer } from '../../lib/useTimer'
import { FIXATION_CONFIG } from './config'

interface Props {
  onComplete: () => void
}

export default function FixationDrill({ onComplete }: Props) {
  const handleExpire = useCallback(() => onComplete(), [onComplete])
  const { remainingSeconds } = useTimer(FIXATION_CONFIG.durationMs, handleExpire)

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div>
        <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-600">
          D1 — Warm-up
        </p>
        <h2 className="mt-1 text-center text-2xl font-bold text-slate-900">Fixation stability</h2>
        <p className="mt-2 max-w-sm text-center text-slate-500">
          Keep your gaze on the cross. Blink normally. Breathe slowly.
        </p>
      </div>

      <div
        className="relative flex items-center justify-center rounded-2xl"
        style={{ width: 320, height: 240, backgroundColor: 'rgb(128,128,128)' }}
        aria-label="Fixation cross"
        role="img"
      >
        <div
          className="absolute"
          style={{
            width: FIXATION_CONFIG.crossSizePx,
            height: FIXATION_CONFIG.crossThicknessPx,
            backgroundColor: '#1e293b',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: FIXATION_CONFIG.crossThicknessPx,
            height: FIXATION_CONFIG.crossSizePx,
            backgroundColor: '#1e293b',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <p
        className="text-5xl font-bold tabular-nums text-slate-900"
        role="timer"
        aria-live="polite"
        aria-label={`${remainingSeconds} seconds remaining`}
      >
        {remainingSeconds}
        <span className="ml-1 text-2xl font-normal text-slate-400">s</span>
      </p>
    </div>
  )
}
