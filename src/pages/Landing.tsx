import { Link } from 'react-router-dom'

const drills = [
  {
    phase: 'Warm-up · 1 min',
    name: 'Fixation Stability',
    description: 'Steady attentional baseline before adaptive training begins.',
  },
  {
    phase: 'Block A · 4 min',
    name: 'Gabor Contrast Sensitivity',
    description:
      'Lateral-masking Gabor patches at 3, 6, and 12 cycles/degree. Adaptive staircase converges on your personal contrast threshold.',
  },
  {
    phase: 'Block B · 3 min',
    name: 'Saccade + Crowding',
    description:
      'Sloan letter triplets at random eccentricities. Trains rapid foveation and shrinks critical crowding spacing.',
  },
  {
    phase: 'Block C · 2.5 min',
    name: 'Reading Fluency (RSVP)',
    description:
      'Rapid serial visual presentation. Pushes sustained words-per-minute at 80% comprehension.',
  },
]

export default function Landing() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-12">

      {/* Hero */}
      <section aria-labelledby="hero-heading">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
          Perceptual vision training
        </p>
        <h1
          id="hero-heading"
          className="mt-2 text-4xl font-bold leading-tight text-slate-900"
        >
          Train your visual cortex,<br />not your lens.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-600">
          Presbyopia is mechanical — the lens stiffens. But contrast sensitivity,
          crowding resistance, and reading speed are cortical — and cortex is trainable.
          Foveal Forge delivers evidence-based perceptual learning drills, fully offline.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/baseline"
            className="inline-flex min-h-[48px] items-center rounded-lg bg-indigo-600 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            Start baseline assessment
          </Link>
          <Link
            to="/about"
            className="inline-flex min-h-[48px] items-center rounded-lg border border-slate-300 bg-white px-6 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Read the science
          </Link>
        </div>
      </section>

      {/* Session structure */}
      <section aria-labelledby="session-heading" className="mt-16">
        <h2
          id="session-heading"
          className="text-xl font-semibold text-slate-900"
        >
          A 12-minute daily session
        </h2>
        <p className="mt-1 text-slate-500">5 days per week. No account. No cloud. All data stays on your device.</p>
        <ol className="mt-6 space-y-3" aria-label="Session drill sequence">
          {drills.map((drill) => (
            <li
              key={drill.name}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">
                  {drill.phase}
                </p>
                <p className="mt-0.5 font-semibold text-slate-900">{drill.name}</p>
                <p className="mt-1 text-sm text-slate-500">{drill.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Disclaimer */}
      <section aria-label="Scientific disclaimer" className="mt-12">
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm text-amber-900">
            <strong>Scientific disclaimer:</strong> This app does not cure, reverse, or reduce
            the mechanical effects of presbyopia. It trains the neural pipeline downstream of
            the lens. Every claim traces to a peer-reviewed citation in{' '}
            <code className="text-xs">references/evidence.md</code>.{' '}
            Consult an ophthalmologist for clinical assessment.
          </p>
        </div>
      </section>

      <footer className="mt-12 border-t border-slate-200 pt-6 text-center">
        <p className="text-sm text-slate-400">
          Foveal Forge · pre-alpha ·{' '}
          <span className="text-slate-500">Developer: Eduardo Arana</span>
        </p>
      </footer>
    </main>
  )
}
