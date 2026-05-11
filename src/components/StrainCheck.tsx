import { useState } from 'react'

interface Props {
  onSubmit: (score: number) => void
}

const SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

export default function StrainCheck({ onSubmit }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div>
        <p className="text-center text-sm font-medium uppercase tracking-widest text-indigo-600">
          Session complete
        </p>
        <h2 className="mt-1 text-center text-2xl font-bold text-slate-900">Eye strain check</h2>
        <p className="mt-2 max-w-sm text-center text-slate-500">
          Rate your current eye strain or discomfort on a scale from 0 to 10.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-sm font-medium text-slate-700">
          0 = no strain at all, 10 = very uncomfortable
        </p>

        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Eye strain score 0 to 10">
          {SCORES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSelected(n)}
              aria-pressed={selected === n}
              aria-label={`Eye strain score ${n}`}
              className={[
                'flex h-12 w-12 items-center justify-center rounded-lg text-base font-bold transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                selected === n
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50',
              ].join(' ')}
            >
              {n}
            </button>
          ))}
        </div>

        {selected !== null && selected >= 7 && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
            Score of {selected} — consider resting your eyes today and resuming training tomorrow.
          </p>
        )}
      </div>

      <p className="max-w-sm text-center text-xs text-slate-400">
        If you experience pain, sudden vision changes, flashes, or floaters, stop immediately and
        consult an ophthalmologist.
      </p>

      <button
        type="button"
        disabled={selected === null}
        onClick={() => {
          if (selected !== null) onSubmit(selected)
        }}
        className="min-h-[48px] rounded-lg bg-indigo-600 px-8 text-base font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-disabled={selected === null}
      >
        Save and finish
      </button>
    </div>
  )
}
