# foveal-forge

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

Offline-first perceptual vision training for presbyopia. Daily Gabor-patch contrast sensitivity drills, saccade tracking, and reading fluency exercises — trains the visual cortex to extract more signal from a stiffening lens.

**Not a cure; a workout.**

## Scientific posture

Presbyopia is a mechanical condition: the crystalline lens loses elasticity with age. No eye exercise has been shown in randomized trials to restore lens accommodation. What *can* be trained is the neural pipeline downstream of the lens — contrast sensitivity, blur tolerance, reading speed, and saccadic efficiency. This is the mechanism behind published perceptual learning research (Polat et al., 2012; DeLoss et al., 2015) and the GlassesOff commercial product.

This project does **not** claim to:
- Reverse presbyopia
- Reduce the need for reading glasses
- Replace ophthalmological care

This project **does** attempt to:
- Improve contrast sensitivity at near distances
- Reduce subjective reading fatigue
- Provide measurable baselines and progress tracking
- Stay fully offline and local-first — no telemetry, no cloud

## Quick start

```bash
git clone https://github.com/arananet/foveal-forge.git
cd foveal-forge
pnpm install
pnpm dev
```

## Stack

- React + Vite PWA (installable, offline-capable)
- IndexedDB for session history
- Web Audio API for cued timing
- Canvas 2D for stimulus rendering (Gabor patches, tumbling-E, Sloan charts)
- No backend. No analytics. No accounts.

## Status

Pre-alpha. Spec-driven build governed by `SKILL.md`.

## References

- Polat, U. et al. (2012). *Training the brain to overcome the effect of aging on the human eye.* Scientific Reports.
- DeLoss, D. J. et al. (2015). *Improving vision among older adults: behavioral training to improve sight.* Psychological Science.
- Levi, D. M. & Li, R. W. (2009). *Perceptual learning as a potential treatment for amblyopia.* Vision Research.

## License

MIT
