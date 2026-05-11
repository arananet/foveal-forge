const references = [
  {
    authors: 'Polat et al.',
    year: '2012',
    title: 'Training the brain to overcome the effect of aging on the human eye.',
    journal: 'Scientific Reports 2:278',
  },
  {
    authors: 'DeLoss, Watanabe & Andersen',
    year: '2015',
    title: 'Improving vision among older adults: behavioral training to improve sight.',
    journal: 'Psychological Science 26(4):456–466',
  },
  {
    authors: 'Levi',
    year: '2008',
    title: 'Crowding — an essential bottleneck for object recognition.',
    journal: 'Vision Research 48(5):635–654',
  },
  {
    authors: 'Calabrèse et al.',
    year: '2014',
    title: 'Investigating the utility of the MNREAD chart for evaluating reading performance.',
    journal: 'Vision Research 103:33–42',
  },
]

export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-12">
      <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
        Scientific posture
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">About Foveal Forge</h1>

      <div className="mt-8 space-y-6 text-slate-600">
        <p>
          Presbyopia is a mechanical condition: the crystalline lens loses elasticity with age.
          No published randomised trial has demonstrated that eye exercises restore lens
          accommodation. That claim is pseudoscience.
        </p>
        <p>
          What <em>can</em> be trained is the neural pipeline downstream of the lens — contrast
          sensitivity, blur tolerance, crowding resistance, and reading speed. These are cortical
          functions, and the cortex retains plasticity in adults. This is the mechanism behind
          peer-reviewed perceptual learning research and the commercial GlassesOff product.
        </p>
        <p>
          Foveal Forge implements those training paradigms as an offline-first PWA. No telemetry.
          No accounts. No cloud. All session data lives in IndexedDB on your device.
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-slate-900">What this app is not</h2>
        <ul className="mt-4 space-y-2 text-sm text-slate-600" role="list">
          {[
            'A cure or reversal for presbyopia.',
            'A substitute for an ophthalmologist.',
            'A Bates Method or "natural vision correction" product — those are pseudoscience.',
            'A data collection vehicle.',
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-slate-300">—</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12">
        <h2 className="text-lg font-semibold text-slate-900">References</h2>
        <ol className="mt-4 space-y-4" role="list">
          {references.map(({ authors, year, title, journal }) => (
            <li
              key={title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-900">
                {authors} ({year})
              </p>
              <p className="mt-0.5 text-sm italic text-slate-600">{title}</p>
              <p className="mt-0.5 text-xs text-slate-400">{journal}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-sm text-slate-500">
          <strong className="text-slate-700">Version:</strong> pre-alpha · protocol v0.1.0 ·{' '}
          <a
            href="https://github.com/arananet/foveal-forge"
            className="text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source on GitHub
          </a>
        </p>
      </div>
    </main>
  )
}
