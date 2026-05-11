import { useCallback, useEffect, useRef, useState } from 'react'
import { useTimer } from '../../lib/useTimer'
import { SACCADE_CONFIG, type SloanLetter } from './config'
import { drawFixationCross, drawTriplet, drawMask, clearCanvas } from './stimulus'
import {
  initSaccadeSession,
  randomEccentricityDeg,
  randomSloanLetter,
  recordSaccadeResponse,
  summarizeSaccadeSession,
} from './session'
import type { SaccadeDrillSummary, SaccadeTrialResult } from '../../lib/types'

type TrialPhase = 'fixation' | 'stimulus' | 'mask' | 'response'

interface Props {
  onComplete: (result: SaccadeDrillSummary) => void
}

const CANVAS_CSS_W = 560
const CANVAS_CSS_H = 260

export default function SaccadeDrill({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sessionState, setSessionState] = useState(initSaccadeSession)
  const sessionStateRef = useRef(sessionState)
  sessionStateRef.current = sessionState

  const [phase, setPhase] = useState<TrialPhase>('fixation')
  const [trialEcc, setTrialEcc] = useState(4)
  const [trialSide, setTrialSide] = useState<'left' | 'right'>('right')
  const [trialTarget, setTrialTarget] = useState<SloanLetter>('C')
  const [trialFlankerA, setTrialFlankerA] = useState<SloanLetter>('D')
  const [trialFlankerB, setTrialFlankerB] = useState<SloanLetter>('H')
  const stimulusStartRef = useRef(0)
  const trialTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTrialTimers = useCallback(() => {
    for (const t of trialTimersRef.current) clearTimeout(t)
  }, [])

  const handleExpire = useCallback(() => {
    clearTrialTimers()
    onComplete(summarizeSaccadeSession(sessionStateRef.current))
  }, [onComplete, clearTrialTimers])

  const { remainingMs } = useTimer(SACCADE_CONFIG.durationMs, handleExpire)

  const startNextTrial = useCallback(() => {
    const ecc = randomEccentricityDeg()
    const side: 'left' | 'right' = Math.random() < 0.5 ? 'left' : 'right'
    const target = randomSloanLetter()
    const flankerA = randomSloanLetter([target])
    const flankerB = randomSloanLetter([target, flankerA])

    setTrialEcc(ecc)
    setTrialSide(side)
    setTrialTarget(target)
    setTrialFlankerA(flankerA)
    setTrialFlankerB(flankerB)
    setPhase('fixation')

    const t1 = setTimeout(() => {
      setPhase('stimulus')
      stimulusStartRef.current = performance.now()

      const t2 = setTimeout(() => {
        setPhase('mask')

        const t3 = setTimeout(() => {
          setPhase('response')
        }, SACCADE_CONFIG.maskMs)
        trialTimersRef.current.push(t3)
      }, SACCADE_CONFIG.exposureMs)
      trialTimersRef.current.push(t2)
    }, SACCADE_CONFIG.fixationMs)
    trialTimersRef.current.push(t1)
  }, [])

  const handleLetterResponse = useCallback(
    (letter: SloanLetter) => {
      if (phase !== 'response') return
      const rt = performance.now() - stimulusStartRef.current
      const state = sessionStateRef.current

      const trial: SaccadeTrialResult = {
        eccentricityDeg: trialEcc,
        spacingDeg: state.currentSpacingDeg,
        targetLetter: trialTarget,
        respondedLetter: letter,
        correct: letter === trialTarget,
        reactionTimeMs: Math.round(rt),
      }

      setSessionState(recordSaccadeResponse(state, trial))
      startNextTrial()
    },
    [phase, trialEcc, trialTarget, startNextTrial],
  )

  // Set up canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = CANVAS_CSS_W * dpr
    canvas.height = CANVAS_CSS_H * dpr
    canvas.style.width = `${CANVAS_CSS_W}px`
    canvas.style.height = `${CANVAS_CSS_H}px`
  }, [])

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.width
    const h = canvas.height
    const spacing = sessionStateRef.current.currentSpacingDeg

    if (phase === 'fixation' || phase === 'response') {
      drawFixationCross(ctx, w, h, dpr)
    } else if (phase === 'stimulus') {
      drawTriplet(
        ctx,
        w,
        h,
        trialEcc,
        trialSide,
        trialFlankerA,
        trialTarget,
        trialFlankerB,
        spacing,
        SACCADE_CONFIG.letterSizeDeg,
        dpr,
      )
    } else if (phase === 'mask') {
      clearCanvas(ctx, w, h)
      drawMask(ctx, w, h, trialEcc, trialSide, dpr)
    }
  }, [phase, trialEcc, trialSide, trialTarget, trialFlankerA, trialFlankerB])

  useEffect(() => {
    startNextTrial()
    return clearTrialTimers
  }, [startNextTrial, clearTrialTimers])

  const trialCount = sessionState.trials.length
  const progressPct = Math.round((1 - remainingMs / SACCADE_CONFIG.durationMs) * 100)
  const remainingSec = Math.ceil(remainingMs / 1000)

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="flex w-full max-w-2xl items-center justify-between px-1">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
            D3 — Block B
          </p>
          <h2 className="text-xl font-bold text-slate-900">Saccade + crowding</h2>
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
        aria-label="Saccade stimulus display"
      />

      {phase === 'response' ? (
        <div className="w-full max-w-xs">
          <p className="mb-3 text-center text-sm font-medium text-slate-600">
            Which center letter did you see?
          </p>
          <div className="grid grid-cols-5 gap-2" role="group" aria-label="Letter choices">
            {SACCADE_CONFIG.sloanLetters.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleLetterResponse(letter)}
                className="flex min-h-[48px] items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-bold text-slate-800 hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-label={`Letter ${letter}`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          {phase === 'fixation'
            ? 'Fixate on the center cross…'
            : phase === 'stimulus'
              ? 'Identify the center letter'
              : phase === 'mask'
                ? ''
                : ''}
        </p>
      )}
    </div>
  )
}
