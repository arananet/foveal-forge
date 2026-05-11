const blocks = [
  {
    id: 'D1',
    phase: 'Warm-up',
    duration: '1 min',
    name: 'Fixation stability',
    status: 'coming-soon' as const,
  },
  {
    id: 'D2',
    phase: 'Block A',
    duration: '4 min',
    name: 'Gabor contrast sensitivity',
    status: 'coming-soon' as const,
  },
  {
    id: 'D3',
    phase: 'Block B',
    duration: '3 min',
    name: 'Saccade + crowding',
    status: 'coming-soon' as const,
  },
  {
    id: 'D4',
    phase: 'Block C',
    duration: '2.5 min',
    name: 'Reading fluency (RSVP)',
    status: 'coming-soon' as const,
  },
]

export default function Session() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-12">
      <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
        Daily training
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Training session</h1>
      <p className="mt-3 text-slate-600">
        A standard session is <strong>12 minutes</strong>, structured across four blocks with two
        30-second rest intervals. All drills adapt to your performance in real time.
      </p>

      <div className="mt-10 space-y-3">
        {blocks.map(({ id, phase, duration, name }) => (
          <div
            key={id}
            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm opacity-60"
            aria-label={`${name} — not yet available`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <span className="text-xs font-bold text-slate-400">{id}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {phase} · {duration}
              </p>
              <p className="mt-0.5 font-semibold text-slate-700">{name}</p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-400">
              Coming soon
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-semibold text-slate-900">Complete baseline first</p>
        <p className="mt-1 text-sm text-slate-500">
          Your first training session unlocks after the one-time baseline assessment, which
          calibrates your adaptive staircase starting points.
        </p>
      </div>
    </main>
  )
}
