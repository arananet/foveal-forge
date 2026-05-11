const readmeContent = `
# foveal-forge

Offline-first perceptual vision training for presbyopia. Daily Gabor-patch contrast sensitivity
drills, saccade tracking, and reading fluency exercises — trains the visual cortex to extract
more signal from a stiffening lens.

**Not a cure; a workout.**

## Scientific posture

Presbyopia is a mechanical condition: the crystalline lens loses elasticity with age. No eye
exercise has been shown in randomized trials to restore lens accommodation. What can be trained
is the neural pipeline downstream of the lens — contrast sensitivity, blur tolerance, reading
speed, and saccadic efficiency.

## This project does not claim to

- Reverse presbyopia
- Reduce the need for reading glasses
- Replace ophthalmological care

## References

- Polat et al. (2012). Training the brain to overcome the effect of aging on the human eye. Scientific Reports.
- DeLoss et al. (2015). Improving vision among older adults. Psychological Science.
- Levi & Li (2009). Perceptual learning as a potential treatment for amblyopia. Vision Research.
`

export default function About() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-neutral-900">About</h1>
      <pre className="mt-6 whitespace-pre-wrap text-sm text-neutral-700 font-sans leading-relaxed">
        {readmeContent.trim()}
      </pre>
    </main>
  )
}
