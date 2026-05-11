import { useCallback, useEffect, useRef, useState } from 'react'
import { useTimer } from '../../lib/useTimer'
import { GABOR_CONFIG, type SpatialFreq } from './config'
import { drawGaborScene, drawBackground } from './stimulus'
import { initGaborSession, pickNextFreq, recordGaborResponse, summarizeGaborSession } from './session'
import type { GaborDrillSummary, GaborTrialResult } from '../../lib/types'

type TrialPhase = 'fixation' | 'stimulus' | 'response' | 'feedback'

interface Props {
  onComplete: (result: GaborDrillSummary) => void
}

const CANVAS_CSS_W = 560
const CANVAS_CSS_H = 360

export default function GaborDrill({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sessionState, setSessionState] = useState(initGaborSession)
  const sessionStateRef = useRef(sessionState)
  sessionStateRef.current = sessionState

  const [phase, setPhase] = useState<TrialPhase>('fixation')
  const [currentFreq, setCurrentFreq] = useState<SpatialFreq>(3)
  const [currentOrientation, setCurrentOrientation] = useState(0)
  const [targetPresent, setTargetPresent] = useState(false)
  const stimulusStartRef = useRef(0)
  const trialTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTrialTimers = useCallback(() => {
    for (const t of trialTimersRef.current) clearTimeout(t)
    trialTimersRef.current = []
  }, [])

  const handleExpire = useCallback(() => {
    clearTrialTimers()
    onComplete(summarizeGaborSession(sessionStateRef.current))
  }, [onComplete, clearTrialTimers])

  const { remainingMs } = useTimer(GABOR_CONFIG.durationMs, handleExpire)

  const startNextTrial = useCallback(() => {
    const state = sessionStateRef.current
    const freq = pickNextFreq(state.sfStates)
    const orientations = GABOR_CONFIG.orientations
    const orientation = orientations[Math.floor(Math.random() * orientations.length)] ?? 0
    const present = Math.random() >= 0.5

    setCurrentFreq(freq)
    setCurrentOrientation(orientation)
    setTargetPresent(present)
    setPhase('fixation')

    const t1 = setTimeout(() => {
      setPhase('stimulus')
      stimulusStartRef.current = performance.now()

      const t2 = setTimeout(() => {
        setPhase('response')
      }, GABOR_CONFIG.stimulusMs)
      trialTimersRef.current.push(t2)
    }, GABOR_CONFIG.fixationMs)
    trialTimersRef.current.push(t1)
  }, [])

  const handleResponse = useCallback(
    (respondedYes: boolean) => {
      if (phase !== 'response') return
      const rt = performance.now() - stimulusStartRef.current
      const state = sessionStateRef.current
      const sfState = state.sfStates[currentFreq]

      const trial: GaborTrialResult = {
        spatialFrequencyCpd: currentFreq,
        orientationRad: currentOrientation,
        targetPresent,
        respondedYes,
        correct: respondedYes === targetPresent,
        contrastLevel: sfState.contrast,
        reactionTimeMs: Math.round(rt),
      }

      setSessionState(recordGaborResponse(state, currentFreq, trial))
      setPhase('feedback')

      const t = setTimeout(startNextTrial, GABOR_CONFIG.feedbackMs)
      trialTimersRef.current.push(t)
    },
    [phase, currentFreq, currentOrientation, targetPresent, startNextTrial],
  )

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'y' || e.key === 'Y' || e.key === '1') handleResponse(true)
      if (e.key === 'n' || e.key === 'N' || e.key === '2') handleResponse(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleResponse])

  // Set up canvas physical dimensions once
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = CANVAS_CSS_W * dpr
    canvas.height = CANVAS_CSS_H * dpr
    canvas.style.width = `${CANVAS_CSS_W}px`
    canvas.style.height = `${CANVAS_CSS_H}px`
  }, [])

  // Draw on canvas when trial phase changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.width
    const h = canvas.height

    if (phase === 'stimulus') {
      const sfState = sessionStateRef.current.sfStates[currentFreq]
      drawGaborScene(
        ctx,
        w,
        h,
        currentFreq,
        currentOrientation,
        sfState.contrast,
        0.8,
        GABOR_CONFIG.flankerSeparationLambda,
        targetPresent,
        dpr,
      )
    } else {
      drawBackground(ctx, w, h, dpr)
    }
  }, [phase, currentFreq, currentOrientation, targetPresent])

  // Start first trial on mount
  useEffect(() => {
    startNextTrial()
    return clearTrialTimers
  }, [startNextTrial, clearTrialTimers])

  const trialCount = sessionState.trials.length
  const progressPct = Math.round((1 - remainingMs / GABOR_CONFIG.durationMs) * 100)
  const remainingSec = Math.ceil(remainingMs / 1000)

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="flex w-full max-w-2xl items-center justify-between px-1">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
            D2 — Block A
          </p>
          <h2 className="text-xl font-bold text-slate-900">Contrast sensitivity</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">{trialCount} trials</p>
          <p
            className="text-2xl font-bold tabular-nums text-slate-900"
            role="timer"
            aria-live="polite"
            aria-label={`${remainingSec} seconds remaining`}
          >
            {remainingSec}s
          </p>
        </div>
      </div>

      <div className="w-full max-w-2xl px-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
            role="progressbar"
            aria-valuenow={progressPct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="rounded-xl border border-slate-200 shadow-sm"
        aria-label="Gabor stimulus display"
        aria-live="polite"
      />

      <div className="flex min-h-[56px] items-center gap-4">
        {phase === 'response' ? (
          <>
            <button
              type="button"
              onClick={() => handleResponse(true)}
              className="min-h-[48px] min-w-[120px] rounded-lg bg-indigo-600 px-6 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Yes, I saw a pattern"
            >
              Yes
              <kbd className="ml-2 rounded bg-indigo-500 px-1.5 py-0.5 font-mono text-xs">Y</kbd>
            </button>
            <button
              type="button"
              onClick={() => handleResponse(false)}
              className="min-h-[48px] min-w-[120px] rounded-lg border border-slate-300 bg-white px-6 text-base font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              aria-label="No, I did not see a pattern"
            >
              No
              <kbd className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500">
                N
              </kbd>
            </button>
          </>
        ) : (
          <p className="text-sm text-slate-400">
            {phase === 'fixation'
              ? 'Fixate on the center cross…'
              : phase === 'stimulus'
                ? 'Did a pattern appear?'
                : ' '}
          </p>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Did the center patch appear? Press{' '}
        <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-600">Y</kbd> or{' '}
        <kbd className="rounded bg-slate-100 px-1 py-0.5 font-mono text-slate-600">N</kbd>
      </p>
    </div>
  )
}
