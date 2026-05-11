import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { putBaseline } from '../storage/db'
import { SACCADE_CONFIG } from '../drills/saccade/config'
import type { BaselineData } from '../lib/types'

type Step = 'intro' | 'self-report' | 'contrast-test' | 'reading-test' | 'complete'

// Contrast levels from clearly-visible to threshold
const CONTRAST_LEVELS = [0.5, 0.25, 0.1, 0.05, 0.025] as const
type ContrastLevel = (typeof CONTRAST_LEVELS)[number]

const READING_TEXT =
  'Every morning a baker wakes before dawn to prepare fresh bread for the day. He mixes flour, water, yeast, and a pinch of salt together in a large bowl. After the dough rises, he shapes it into loaves and slides them into a hot oven. The smell of warm bread soon fills the whole street, and customers line up well before the shop opens.'

const READING_WORD_COUNT = READING_TEXT.trim().split(/\s+/).length

interface SelfReport {
  age: string
  correction: 'none' | 'glasses' | 'contacts'
  knownConditions: string
}

interface ContrastResult {
  threshold: number
}

function randomSloanLetter(): (typeof SACCADE_CONFIG.sloanLetters)[number] {
  const idx = Math.floor(Math.random() * SACCADE_CONFIG.sloanLetters.length)
  return SACCADE_CONFIG.sloanLetters[idx] ?? 'C'
}

// ---- Contrast test subcomponent ----
function ContrastTest({ onComplete }: { onComplete: (result: ContrastResult) => void }) {
  const [levelIndex, setLevelIndex] = useState(0)
  const [targetLetter, setTargetLetter] = useState(() => randomSloanLetter())
  const [lastPassedContrast, setLastPassedContrast] = useState<number>(CONTRAST_LEVELS[0])

  const contrast: ContrastLevel =
    CONTRAST_LEVELS[levelIndex] ?? CONTRAST_LEVELS[CONTRAST_LEVELS.length - 1] ?? 0.025
  const luminance = Math.round(128 * (1 - contrast))
  const letterColor = `rgb(${luminance},${luminance},${luminance})`

  const handleLetterResponse = useCallback(
    (letter: string) => {
      const correct = letter === targetLetter
      if (correct) {
        setLastPassedContrast(contrast)
        if (levelIndex >= CONTRAST_LEVELS.length - 1) {
          onComplete({ threshold: contrast })
        } else {
          setLevelIndex((i) => i + 1)
          setTargetLetter(randomSloanLetter())
        }
      } else {
        onComplete({ threshold: lastPassedContrast })
      }
    },
    [targetLetter, contrast, levelIndex, lastPassedContrast, onComplete],
  )

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-center text-slate-600">
        Identify the letter shown below. Level {levelIndex + 1} of {CONTRAST_LEVELS.length}.
      </p>

      <div
        className="flex items-center justify-center rounded-2xl"
        style={{
          width: 200,
          height: 160,
          backgroundColor: 'rgb(128,128,128)',
        }}
        aria-label={`Letter displayed at contrast level ${levelIndex + 1}`}
        role="img"
      >
        <span
          style={{
            fontSize: 72,
            fontFamily: '"Courier New", monospace',
            fontWeight: 'bold',
            color: letterColor,
            userSelect: 'none',
          }}
        >
          {targetLetter}
        </span>
      </div>

      <div>
        <p className="mb-3 text-center text-sm font-medium text-slate-600">
          Which letter do you see?
        </p>
        <div
          className="grid grid-cols-5 gap-2"
          role="group"
          aria-label="Letter identification choices"
        >
          {SACCADE_CONFIG.sloanLetters.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => handleLetterResponse(l)}
              className="flex min-h-[48px] items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-bold text-slate-800 hover:border-indigo-400 hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label={`Letter ${l}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Reading speed subcomponent ----
function ReadingTest({ onComplete }: { onComplete: (wpm: number) => void }) {
  const [reading, setReading] = useState(false)
  const [done, setDone] = useState(false)
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const wpmRef = useRef(180)

  const startReading = useCallback(() => {
    startTimeRef.current = performance.now()
    setReading(true)
  }, [])

  const finishReading = useCallback(() => {
    if (startTimeRef.current === null) return
    const elapsedMs = performance.now() - startTimeRef.current
    const wpm = Math.round((READING_WORD_COUNT / elapsedMs) * 60_000)
    wpmRef.current = Math.max(80, Math.min(600, wpm))
    setReading(false)
    setDone(true)
  }, [])

  const handleAnswer = useCallback(
    (answer: string) => {
      const correct = answer === 'A large bowl'
      setAnsweredCorrectly(correct)
      // Use measured WPM if comprehension OK, else fall back to a conservative estimate
      const finalWpm = correct ? wpmRef.current : Math.min(wpmRef.current, 160)
      setTimeout(() => onComplete(finalWpm), 800)
    },
    [onComplete],
  )

  if (!reading && !done) {
    return (
      <div className="flex flex-col items-center gap-6">
        <p className="max-w-md text-center text-slate-600">
          Read the paragraph below at your normal pace. Press{' '}
          <strong>"Start reading"</strong> then <strong>"Done"</strong> when you finish.
        </p>
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-5 text-base leading-relaxed text-slate-800 shadow-sm">
          {READING_TEXT}
        </div>
        <button
          type="button"
          onClick={startReading}
          className="min-h-[48px] rounded-lg bg-indigo-600 px-8 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Start reading
        </button>
      </div>
    )
  }

  if (reading) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="max-w-md rounded-xl border border-indigo-200 bg-white p-5 text-base leading-relaxed text-slate-800 shadow-sm">
          {READING_TEXT}
        </div>
        <button
          type="button"
          onClick={finishReading}
          className="min-h-[48px] rounded-lg bg-indigo-600 px-8 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Done reading
        </button>
      </div>
    )
  }

  // Comprehension question
  const answers = [
    'A large bowl',
    'A wooden crate',
    'A metal tray',
    'A small pot',
  ]
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-center text-base font-semibold text-slate-800">
        Quick check: what does the baker mix ingredients in?
      </p>
      <div className="grid w-full max-w-xs grid-cols-1 gap-2">
        {answers.map((a) => {
          const isSelected = answeredCorrectly !== null
          const isCorrect = a === 'A large bowl'
          let cls =
            'min-h-[48px] w-full rounded-lg border px-4 py-2 text-sm font-medium text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'
          if (isSelected) {
            if (isCorrect) cls += ' border-green-500 bg-green-50 text-green-800'
            else cls += ' border-slate-200 bg-white text-slate-400 opacity-50'
          } else {
            cls += ' border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50'
          }
          return (
            <button
              key={a}
              type="button"
              disabled={isSelected}
              onClick={() => handleAnswer(a)}
              className={cls}
            >
              {a}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---- Main Baseline component ----
export default function Baseline() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('intro')
  const [selfReport, setSelfReport] = useState<SelfReport>({
    age: '',
    correction: 'none',
    knownConditions: '',
  })
  const contrastThresholdRef = useRef(0.1)
  const readingWpmRef = useRef(180)

  const saveBaseline = useCallback(async () => {
    const data: BaselineData = {
      completedAt: Date.now(),
      age: parseInt(selfReport.age, 10) || 0,
      correction: selfReport.correction,
      knownConditions: selfReport.knownConditions.trim(),
      contrastThreshold: contrastThresholdRef.current,
      readingSpeedWpm: readingWpmRef.current,
    }
    await putBaseline(data)
    setStep('complete')
  }, [selfReport])

  const handleContrastDone = useCallback(
    (result: ContrastResult) => {
      contrastThresholdRef.current = result.threshold
      setStep('reading-test')
    },
    [],
  )

  const handleReadingDone = useCallback(
    (wpm: number) => {
      readingWpmRef.current = wpm
      void saveBaseline()
    },
    [saveBaseline],
  )

  if (step === 'intro') {
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
          One-time setup
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Baseline assessment</h1>
        <p className="mt-3 text-slate-600">
          This takes about 5 minutes and sets your adaptive starting points. All data stays on this
          device.
        </p>
        <ol className="mt-8 space-y-4" aria-label="Assessment steps">
          {[
            { n: 1, title: 'Self-report', desc: 'Age, correction, conditions' },
            { n: 2, title: 'Contrast sensitivity', desc: 'Identify letters at decreasing contrast' },
            { n: 3, title: 'Reading speed', desc: 'Timed reading with comprehension check' },
          ].map(({ n, title, desc }) => (
            <li
              key={n}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {n}
              </span>
              <div>
                <p className="font-semibold text-slate-900">{title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-xs text-slate-400">
          This app is not a substitute for an ophthalmologist. Discontinue use if you experience
          pain, sudden vision changes, flashes, or floaters.
        </p>
        <button
          type="button"
          onClick={() => setStep('self-report')}
          className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          Begin
        </button>
      </main>
    )
  }

  if (step === 'self-report') {
    const valid = selfReport.age !== '' && parseInt(selfReport.age, 10) >= 18

    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">Step 1 of 3</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Self-report</h1>
        <p className="mt-2 text-sm text-slate-500">
          Used only to calibrate starting parameters. Not shared.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-slate-700"
            >
              Age
            </label>
            <input
              id="age"
              type="number"
              min={18}
              max={99}
              value={selfReport.age}
              onChange={(e) => setSelfReport((s) => ({ ...s, age: e.target.value }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              aria-required="true"
            />
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Vision correction</legend>
            <div className="mt-2 flex flex-wrap gap-3" role="radiogroup">
              {(['none', 'glasses', 'contacts'] as const).map((opt) => (
                <label
                  key={opt}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="radio"
                    name="correction"
                    value={opt}
                    checked={selfReport.correction === opt}
                    onChange={() => setSelfReport((s) => ({ ...s, correction: opt }))}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span className="text-sm text-slate-700 capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="conditions"
              className="block text-sm font-medium text-slate-700"
            >
              Known ocular conditions{' '}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="conditions"
              type="text"
              value={selfReport.knownConditions}
              onChange={(e) => setSelfReport((s) => ({ ...s, knownConditions: e.target.value }))}
              placeholder="e.g. dry eye, glaucoma…"
              className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={!valid}
          onClick={() => setStep('contrast-test')}
          className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center rounded-lg bg-indigo-600 text-base font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-disabled={!valid}
        >
          Continue
        </button>
      </main>
    )
  }

  if (step === 'contrast-test') {
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">Step 2 of 3</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Contrast sensitivity</h2>
        <p className="mt-2 mb-8 text-sm text-slate-500">
          Letters will become harder to see. Identify each one until you can no longer make it out.
        </p>
        <ContrastTest onComplete={handleContrastDone} />
      </main>
    )
  }

  if (step === 'reading-test') {
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">Step 3 of 3</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Reading speed</h2>
        <p className="mt-2 mb-8 text-sm text-slate-500">
          Read at your natural pace. Wear your correction if you normally do.
        </p>
        <ReadingTest onComplete={handleReadingDone} />
      </main>
    )
  }

  // complete
  return (
    <main className="mx-auto max-w-xl px-4 py-12 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-green-600">Done</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Baseline saved</h1>
      <p className="mt-3 text-slate-500">
        Your starting parameters are set. You can begin training now.
      </p>
      <button
        type="button"
        onClick={() => navigate('/session')}
        className="mt-8 inline-flex min-h-[48px] items-center rounded-lg bg-indigo-600 px-8 text-base font-semibold text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        Start first session
      </button>
    </main>
  )
}
