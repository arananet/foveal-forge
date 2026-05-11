const steps = [
  {
    n: 1,
    title: 'Contrast sensitivity',
    description:
      'Pelli-Robson-style test at self-reported 40 cm reading distance. Establishes your starting contrast threshold across spatial frequencies.',
  },
  {
    n: 2,
    title: 'Reading speed',
    description:
      'MNREAD-inspired assessment. Measures critical print size and maximum reading speed to set your RSVP starting rate.',
  },
  {
    n: 3,
    title: 'Self-report',
    description:
      'Age, current correction (glasses / contacts / none), and known ocular conditions. Used to calibrate initial drill parameters only — not stored anywhere.',
  },
]

export default function Baseline() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-12">
      <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
        One-time setup
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Baseline assessment</h1>
      <p className="mt-3 max-w-xl text-slate-600">
        Before your first session, Foveal Forge measures where you start. This takes about
        5 minutes and runs entirely offline. Results are saved locally and used to set
        your adaptive staircase starting points.
      </p>

      <ol className="mt-10 space-y-4" aria-label="Baseline assessment steps">
        {steps.map(({ n, title, description }) => (
          <li
            key={n}
            className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700"
            >
              {n}
            </span>
            <div>
              <p className="font-semibold text-slate-900">{title}</p>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <button
          type="button"
          disabled
          className="inline-flex min-h-[48px] cursor-not-allowed items-center rounded-lg bg-indigo-100 px-6 text-base font-semibold text-indigo-400"
          aria-disabled="true"
        >
          Begin baseline — coming soon
        </button>
        <p className="mt-3 text-sm text-slate-400">
          Baseline drills are not yet implemented. They will be spec'd in SKILL.md before
          any code is written.
        </p>
      </div>
    </main>
  )
}
