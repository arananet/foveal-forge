import { useCallback, useEffect, useRef, useState } from 'react'
import { useTimer } from '../../lib/useTimer'
import { RSVP_CONFIG } from './config'
import { PASSAGES } from './passages'
import { initRsvpSession, getMsPerWord, recordBlockResult, summarizeRsvpSession } from './session'
import type { RsvpDrillSummary, RsvpBlockResult } from '../../lib/types'

type Phase = 'fixation' | 'reading' | 'question' | 'feedback'

interface Props {
  onComplete: (result: RsvpDrillSummary) => void
}

export default function RsvpDrill({ onComplete }: Props) {
  const [sessionState, setSessionState] = useState(initRsvpSession)
  const sessionStateRef = useRef(sessionState)
  sessionStateRef.current = sessionState

  const [phase, setPhase] = useState<Phase>('fixation')
  const [passageIndex, setPassageIndex] = useState(0)
  const [currentWord, setCurrentWord] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t)
    timersRef.current = []
  }, [])

  const handleExpire = useCallback(() => {
    clearTimers()
    onComplete(summarizeRsvpSession(sessionStateRef.current))
  }, [onComplete, clearTimers])

  const { remainingMs } = useTimer(RSVP_CONFIG.durationMs, handleExpire)

  const startBlock = useCallback((pIdx: number) => {
    const state = sessionStateRef.current
    const passage = PASSAGES[pIdx % PASSAGES.length]
    if (!passage) return

    const msPerWord = getMsPerWord(state.currentWpm)
    const words = passage.words

    setPhase('fixation')
    setCurrentWord('')
    setSelectedAnswer(null)

    const t0 = setTimeout(() => {
      setPhase('reading')

      for (let i = 0; i < words.length; i++) {
        const t = setTimeout(
          () => {
            const word = words[i] ?? ''
            setCurrentWord(word)

            if (i === words.length - 1) {
              const tend = setTimeout(() => {
                setPhase('question')
              }, msPerWord)
              timersRef.current.push(tend)
            }
          },
          i * msPerWord,
        )
        timersRef.current.push(t)
      }
    }, 800)
    timersRef.current.push(t0)
  }, [])

  const handleAnswer = useCallback(
    (answer: string) => {
      if (phase !== 'question') return
      const state = sessionStateRef.current
      const pIdx = passageIndex
      const passage = PASSAGES[pIdx % PASSAGES.length]
      if (!passage) return

      const correct = answer === passage.correctAnswer
      setSelectedAnswer(answer)
      setPhase('feedback')

      const result: RsvpBlockResult = {
        wpm: state.currentWpm,
        passageIndex: pIdx,
        comprehensionCorrect: correct,
      }

      const newState = recordBlockResult(state, result)
      setSessionState(newState)

      const t = setTimeout(() => {
        const nextIdx = pIdx + 1
        setPassageIndex(nextIdx)
        startBlock(nextIdx)
      }, 1200)
      timersRef.current.push(t)
    },
    [phase, passageIndex, startBlock],
  )

  useEffect(() => {
    startBlock(0)
    return clearTimers
  }, [startBlock, clearTimers])

  const passage = PASSAGES[passageIndex % PASSAGES.length]
  const remainingSec = Math.ceil(remainingMs / RSVP_CONFIG.durationMs * 150)
  const progressPct = Math.round((1 - remainingMs / RSVP_CONFIG.durationMs) * 100)
  const allAnswers = passage
    ? [passage.correctAnswer, ...passage.distractors].sort(() => Math.random() - 0.5)
    : []

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="flex w-full max-w-2xl items-center justify-between px-1">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
            D4 — Block C
          </p>
          <h2 className="text-xl font-bold text-slate-900">Reading fluency</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">{sessionState.currentWpm} WPM</p>
          <p
            className="text-2xl font-bold tabular-nums text-slate-900"
            role="timer"
            aria-live="polite"
            aria-label={`${Math.ceil(remainingMs / 1000)} seconds remaining`}
          >
            {Math.ceil(remainingMs / 1000)}s
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

      <div
        className="flex min-h-[180px] w-full max-w-2xl items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm"
        aria-live="polite"
        aria-atomic="true"
      >
        {phase === 'fixation' && (
          <span className="text-3xl font-bold text-slate-300" aria-label="Fixation cross">
            +
          </span>
        )}

        {phase === 'reading' && (
          <span
            className="select-none text-3xl font-semibold text-slate-900"
            style={{ fontSize: RSVP_CONFIG.fontSizePx }}
            aria-label={`Current word: ${currentWord}`}
          >
            {currentWord}
          </span>
        )}

        {(phase === 'question' || phase === 'feedback') && passage && (
          <div className="w-full px-6 py-4">
            <p className="mb-4 text-center text-base font-semibold text-slate-800">
              {passage.question}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {allAnswers.map((answer) => {
                const isSelected = selectedAnswer === answer
                const isCorrect = answer === passage.correctAnswer
                let cls =
                  'min-h-[48px] w-full rounded-lg border px-4 py-2 text-sm font-medium text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
                if (phase === 'feedback') {
                  if (isCorrect) cls += ' border-green-500 bg-green-50 text-green-800'
                  else if (isSelected) cls += ' border-red-400 bg-red-50 text-red-700'
                  else cls += ' border-slate-200 bg-white text-slate-500 opacity-50'
                } else {
                  cls += ' border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50'
                }
                return (
                  <button
                    key={answer}
                    type="button"
                    disabled={phase === 'feedback'}
                    className={cls}
                    onClick={() => handleAnswer(answer)}
                    aria-pressed={isSelected}
                  >
                    {answer}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Block {sessionState.blocks.length + 1} · {remainingSec}s remaining
      </p>
    </div>
  )
}
