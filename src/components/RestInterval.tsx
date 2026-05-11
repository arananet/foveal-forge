import { useCallback } from 'react'
import { useTimer } from '../lib/useTimer'

interface Props {
  durationMs: number
  label: string
  onComplete: () => void
}

export default function RestInterval({ durationMs, label, onComplete }: Props) {
  const handleExpire = useCallback(() => onComplete(), [onComplete])
  const { remainingSeconds } = useTimer(durationMs, handleExpire)

  return (
    <div className="flex flex-col items-center gap-8 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">{label}</p>
      <h2 className="text-2xl font-bold text-slate-900">Rest break</h2>

      <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-10 py-8 shadow-sm">
        <p className="text-center text-slate-600">
          Look at something at least{' '}
          <strong className="text-slate-900">6 metres away</strong> for the next {Math.round(durationMs / 1000)} seconds.
        </p>
        <p className="text-center text-sm text-slate-500">
          This is the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds.
          Reduces eye muscle fatigue.
        </p>
        <p
          className="mt-2 text-5xl font-bold tabular-nums text-indigo-600"
          role="timer"
          aria-live="polite"
          aria-label={`${remainingSeconds} seconds remaining`}
        >
          {remainingSeconds}
          <span className="ml-1 text-2xl font-normal text-slate-400">s</span>
        </p>
      </div>

      <p className="text-xs text-slate-400">Next drill starts automatically when the timer ends</p>
    </div>
  )
}
