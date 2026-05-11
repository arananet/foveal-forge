export default function Landing() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold text-neutral-900">Foveal Forge</h1>
      <p className="mt-4 text-base text-neutral-700">
        Offline-first perceptual vision training for presbyopia. Daily contrast sensitivity drills,
        saccade tracking, and reading fluency exercises — trains the visual cortex, not the lens.
      </p>
      <p className="mt-6 rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Scientific disclaimer:</strong> This app does not cure, reverse, or reduce the
        mechanical effects of presbyopia. It trains the neural pipeline downstream of the lens.
        All claims trace to peer-reviewed citations in{' '}
        <code>references/evidence.md</code>. Consult an ophthalmologist for clinical assessment.
      </p>
    </main>
  )
}
