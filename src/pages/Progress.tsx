const metrics = [
  {
    label: 'Contrast threshold',
    unit: 'Michelson contrast',
    direction: 'Lower is better',
    description:
      'Log-scale chart per spatial frequency (3, 6, 12 cpd). Tracks your Gabor staircase threshold across sessions.',
  },
  {
    label: 'Critical crowding spacing',
    unit: 'Degrees of visual angle',
    direction: 'Lower is better',
    description:
      'The minimum flanker separation at which you can identify the target letter. Reflects cortical crowding zone size.',
  },
  {
    label: 'Sustained reading rate',
    unit: 'Words per minute at 80% comprehension',
    direction: 'Higher is better',
    description:
      'Your stable RSVP rate where you correctly answer 4 in 5 comprehension questions.',
  },
]

export default function Progress() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-12">
      <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
        Metrics
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Your progress</h1>
      <p className="mt-3 text-slate-600">
        Foveal Forge tracks three primary metrics — one per drill family. No composite score
        is computed, because a single number can't represent what your visual system is doing.
      </p>

      <div className="mt-10 space-y-4">
        {metrics.map(({ label, unit, direction, description }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">{label}</p>
                <p className="text-sm text-slate-400">{unit}</p>
              </div>
              <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                {direction}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">{description}</p>
            {/* Chart placeholder */}
            <div
              aria-label="Chart not yet available"
              className="mt-4 flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50"
            >
              <p className="text-sm text-slate-300">Chart — available after first session</p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-slate-400">
        Consult an ophthalmologist for clinical assessment of your vision. These metrics
        measure perceptual learning outcomes, not clinical visual acuity.
      </p>
    </main>
  )
}
