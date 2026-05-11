import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getBaseline, listSessions, putSession } from '../storage/db'
import { PROTOCOL_VERSION, MIN_SESSION_GAP_MS } from '../lib/constants'
import { primeAudio } from '../lib/sounds'
import FixationDrill from '../drills/fixation'
import GaborDrill from '../drills/gabor'
import SaccadeDrill from '../drills/saccade'
import RsvpDrill from '../drills/rsvp'
import RestInterval from '../components/RestInterval'
import StrainCheck from '../components/StrainCheck'
import type { GaborDrillSummary, SaccadeDrillSummary, RsvpDrillSummary, SessionResult } from '../lib/types'

type Phase =
  | 'loading'
  | 'no-baseline'
  | 'too-soon'
  | 'intro'
  | 'd1-fixation'
  | 'd2-gabor'
  | 'rest-1'
  | 'd3-saccade'
  | 'rest-2'
  | 'd4-rsvp'
  | 'cooldown'
  | 'strain-check'
  | 'complete'

const REST_MS = 30_000
const COOLDOWN_MS = 30_000

function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export default function Session() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('loading')
  const [waitMs, setWaitMs] = useState(0)
  const sessionIdRef = useRef(generateSessionId())
  const startedAtRef = useRef(Date.now())
  const gaborRef = useRef<GaborDrillSummary | null>(null)
  const saccadeRef = useRef<SaccadeDrillSummary | null>(null)
  const rsvpRef = useRef<RsvpDrillSummary | null>(null)

  useEffect(() => {
    async function check() {
      const baseline = await getBaseline()
      if (!baseline) {
        setPhase('no-baseline')
        return
      }
      const sessions = await listSessions()
      const lastCompleted = sessions
        .filter((s) => s.completedAt !== null)
        .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))[0]
      if (lastCompleted?.completedAt !== undefined && lastCompleted.completedAt !== null) {
        const elapsed = Date.now() - lastCompleted.completedAt
        if (elapsed < MIN_SESSION_GAP_MS) {
          setWaitMs(MIN_SESSION_GAP_MS - elapsed)
          setPhase('too-soon')
          return
        }
      }
      setPhase('intro')
    }
    void check()
  }, [])

  const startSession = useCallback(() => {
    primeAudio() // unlock AudioContext on mobile before first drill
    sessionIdRef.current = generateSessionId()
    startedAtRef.current = Date.now()
    gaborRef.current = null
    saccadeRef.current = null
    rsvpRef.current = null
    setPhase('d1-fixation')
  }, [])

  const saveAndComplete = useCallback(async (strainScore: number) => {
    const result: SessionResult = {
      id: sessionIdRef.current,
      startedAt: startedAtRef.current,
      completedAt: Date.now(),
      protocolVersion: PROTOCOL_VERSION,
      eyeStrainScore: strainScore,
    }
    if (gaborRef.current !== null) result.gabor = gaborRef.current
    if (saccadeRef.current !== null) result.saccade = saccadeRef.current
    if (rsvpRef.current !== null) result.rsvp = rsvpRef.current
    await putSession(result)
    setPhase('complete')
  }, [])

  const handleStrainSubmit = useCallback(
    (score: number) => {
      void saveAndComplete(score)
    },
    [saveAndComplete],
  )

  if (phase === 'loading') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </main>
    )
  }

  if (phase === 'no-baseline') {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
          Setup required
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Complete your baseline first</h1>
        <p className="mt-3 text-slate-500">
          Before your first session, complete the one-time baseline assessment to calibrate your
          starting parameters.
        </p>
        <Link
          to="/baseline"
          className="mt-8 inline-flex min-h-[48px] items-center rounded-lg bg-indigo-600 px-6 text-base font-semibold text-white hover:bg-indigo-700"
        >
          Go to baseline assessment
        </Link>
      </main>
    )
  }

  if (phase === 'too-soon') {
    const waitMin = Math.ceil(waitMs / 60_000)
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-600">Rest period</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Too soon to start again</h1>
        <p className="mt-3 text-slate-500">
          Your eyes need at least 30 minutes between sessions. Come back in about{' '}
          <strong>{waitMin} minute{waitMin !== 1 ? 's' : ''}</strong>.
        </p>
        <Link
          to="/progress"
          className="mt-8 inline-flex min-h-[48px] items-center rounded-lg border border-slate-300 bg-white px-6 text-base font-semibold text-slate-700 hover:bg-slate-50"
        >
          View your progress
        </Link>
      </main>
    )
  }

  if (phase === 'intro') {
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
          Daily training
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Ready to train?</h1>
        <p className="mt-3 text-slate-600">
          This session is <strong>~12 minutes</strong>: four adaptive drills, two short rest breaks.
          Sit at your normal reading distance (~40 cm).
        </p>

        <ol className="mt-8 space-y-3" aria-label="Session phases">
          {[
            { label: 'D1', name: 'Fixation stability', dur: '1 min' },
            { label: 'D2', name: 'Contrast sensitivity', dur: '4 min' },
            { label: '—', name: 'Rest (distance gaze)', dur: '30 sec' },
            { label: 'D3', name: 'Saccade + crowding', dur: '3 min' },
            { label: '—', name: 'Rest', dur: '30 sec' },
            { label: 'D4', name: 'Reading fluency', dur: '2.5 min' },
          ].map(({ label, name, dur }) => (
            <li
              key={name}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <span className="w-8 text-center text-xs font-bold text-slate-400">{label}</span>
              <span className="flex-1 text-sm font-medium text-slate-700">{name}</span>
              <span className="text-xs text-slate-400">{dur}</span>
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={startSession}
          className="mt-10 inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Start session
        </button>
        <p className="mt-3 text-center text-xs text-slate-400">
          Consult an ophthalmologist for clinical vision assessment.
        </p>
      </main>
    )
  }

  if (phase === 'd1-fixation') {
    return (
      <main className="mx-auto max-w-2xl px-4">
        <FixationDrill onComplete={() => setPhase('d2-gabor')} />
      </main>
    )
  }

  if (phase === 'd2-gabor') {
    return (
      <main className="mx-auto max-w-2xl px-4">
        <GaborDrill
          onComplete={(result) => {
            gaborRef.current = result
            setPhase('rest-1')
          }}
        />
      </main>
    )
  }

  if (phase === 'rest-1') {
    return (
      <main className="mx-auto max-w-2xl px-4">
        <RestInterval
          durationMs={REST_MS}
          label="Between D2 and D3"
          onComplete={() => setPhase('d3-saccade')}
        />
      </main>
    )
  }

  if (phase === 'd3-saccade') {
    return (
      <main className="mx-auto max-w-2xl px-4">
        <SaccadeDrill
          onComplete={(result) => {
            saccadeRef.current = result
            setPhase('rest-2')
          }}
        />
      </main>
    )
  }

  if (phase === 'rest-2') {
    return (
      <main className="mx-auto max-w-2xl px-4">
        <RestInterval
          durationMs={REST_MS}
          label="Between D3 and D4"
          onComplete={() => setPhase('d4-rsvp')}
        />
      </main>
    )
  }

  if (phase === 'd4-rsvp') {
    return (
      <main className="mx-auto max-w-2xl px-4">
        <RsvpDrill
          onComplete={(result) => {
            rsvpRef.current = result
            setPhase('cooldown')
          }}
        />
      </main>
    )
  }

  if (phase === 'cooldown') {
    return (
      <main className="mx-auto max-w-2xl px-4">
        <RestInterval
          durationMs={COOLDOWN_MS}
          label="Cooldown"
          onComplete={() => setPhase('strain-check')}
        />
      </main>
    )
  }

  if (phase === 'strain-check') {
    return (
      <main className="mx-auto max-w-xl px-4">
        <StrainCheck onSubmit={handleStrainSubmit} />
      </main>
    )
  }

  // complete
  const gabor = gaborRef.current
  const saccade = saccadeRef.current
  const rsvp = rsvpRef.current

  return (
    <main className="mx-auto max-w-xl px-4 py-12 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-green-600">Done</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Session complete</h1>
      <p className="mt-3 text-slate-500">Great work. Your results have been saved locally.</p>

      {(gabor !== null || saccade !== null || rsvp !== null) && (
        <div className="mt-8 space-y-3 text-left">
          {gabor !== null && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Contrast sensitivity
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {gabor.trialsCompleted} trials — thresholds: {gabor.thresholds.cpd3.toFixed(3)} /
                {gabor.thresholds.cpd6.toFixed(3)} / {gabor.thresholds.cpd12.toFixed(3)} (3/6/12
                cpd)
              </p>
            </div>
          )}
          {saccade !== null && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Saccade + crowding
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {saccade.trialsCompleted} trials — {Math.round(saccade.accuracy * 100)}% accuracy
                — spacing {saccade.finalSpacingDeg.toFixed(2)}°
              </p>
            </div>
          )}
          {rsvp !== null && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Reading fluency
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {rsvp.blocksCompleted} blocks — {rsvp.finalWpm} WPM at criterion
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={() => navigate('/progress')}
          className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-indigo-600 px-6 text-base font-semibold text-white hover:bg-indigo-700"
        >
          View progress
        </button>
        <button
          type="button"
          onClick={() => setPhase('intro')}
          className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-slate-300 bg-white px-6 text-base font-semibold text-slate-700 hover:bg-slate-50"
        >
          Start another session
        </button>
      </div>
      <p className="mt-6 text-xs text-slate-400">
        Consult an ophthalmologist for clinical vision assessment.
      </p>
    </main>
  )
}
