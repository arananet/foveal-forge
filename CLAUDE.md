# CLAUDE.md — foveal-forge

This file is the operating contract for Claude Code in this repository. Read it before any task. The `SKILL.md` file is the declarative spec for the training protocol itself; this file is about *how we build*.

## Project identity

**foveal-forge** is an offline-first PWA that delivers perceptual vision training drills targeting the neural correlates of near vision in presbyopic adults. It is governed by `SKILL.md`, which defines the training protocol as a declarative contract.

## Non-negotiables

1. **Scientific honesty over marketing.** No claim in code, copy, or UI may suggest this app cures, reverses, or eliminates the need for corrective lenses for presbyopia. The lens stiffens; we train the cortex. Every user-facing claim must trace back to a citation in `references/evidence.md`.

2. **Offline-first, local-only.** No telemetry. No analytics. No cloud sync. No account system. All session data lives in IndexedDB on the user's device. If a feature requires network access, it does not ship.

3. **Spec-driven development.** The training protocol is defined in `SKILL.md`. The app implements the spec. If the spec changes, code changes. If code drifts from spec, code is wrong, not the spec. Never modify drill parameters in code without first updating `SKILL.md`.

4. **No medical advice.** The app surfaces metrics; it does not diagnose, prescribe, or recommend clinical action. Every metrics screen must include a visible "consult an ophthalmologist for clinical assessment" footer.

5. **Accessibility is a hard requirement.** Users have impaired near vision by definition. Minimum body text 18px, controls 48px tap target, WCAG AA contrast, full keyboard nav, screen-reader labels on every interactive element.

## Tech stack (do not change without discussion)

- **Build:** Vite + React 18 + TypeScript (strict mode)
- **Styling:** Tailwind CSS (utility-first, no design system framework)
- **Storage:** IndexedDB via `idb` library
- **PWA:** `vite-plugin-pwa` for service worker + manifest
- **Stimuli rendering:** Canvas 2D (Gabor patches, optotypes) — no WebGL unless a drill demonstrably needs it
- **State:** Zustand for session state, React Context for theme/settings
- **Testing:** Vitest for units, Playwright for E2E flows
- **Lint/format:** ESLint + Prettier, strict TS

No Redux. No Next.js. No backend. No Firebase. No Supabase. If you think you need one of these, stop and ask.

## Repo structure

```
foveal-forge/
├── SKILL.md                  # Training protocol spec (the contract)
├── CLAUDE.md                 # This file
├── README.md                 # Public-facing
├── references/
│   ├── evidence.md           # Cited papers backing each claim
│   └── protocol-rationale.md # Why each drill exists
├── src/
│   ├── drills/               # One module per drill (gabor, saccade, reading, etc.)
│   ├── components/           # Shared UI
│   ├── storage/              # IndexedDB layer
│   ├── lib/                  # Pure functions (psychophysics, scoring)
│   └── pages/                # Routes
├── tests/
└── public/
```

Each drill in `src/drills/` exposes:
- `config.ts` — parameters derived from `SKILL.md` (single source of truth)
- `stimulus.ts` — rendering logic
- `session.ts` — trial loop + scoring
- `index.tsx` — UI component

## Workflow rules

1. **Before any new drill or feature:** read the relevant section of `SKILL.md`. If the spec is silent or ambiguous, ask the user and update `SKILL.md` first.
2. **Commits:** Conventional Commits (`feat:`, `fix:`, `spec:` for SKILL.md changes, `docs:`, `chore:`).
3. **One change per commit.** No mixing spec updates with implementation.
4. **Always run** `pnpm typecheck && pnpm test && pnpm lint` before declaring a task done.
5. **No `any`.** No `// @ts-ignore`. If TypeScript fights you, fix the type, not the lint.

## Communication style with the user

The user (Edu) prefers:
- Precise technical language; no marketing fluff
- Spec/identity before implementation
- Sequential deliberate workflows
- No emojis in code or content
- Direct disagreement when warranted — push back if a request contradicts the non-negotiables

## What "done" looks like for a drill

A drill is shippable when:
1. Its parameters match `SKILL.md` exactly
2. It runs offline (verified with DevTools offline mode)
3. It persists session results to IndexedDB
4. It has a Vitest unit suite covering scoring logic
5. It has a Playwright E2E covering one full session
6. Its rationale is documented in `references/protocol-rationale.md` with citation
7. Accessibility audit (axe-core) passes with zero violations

## What this project is NOT

- A replacement for an ophthalmologist
- A "vision improvement" or "natural vision correction" app
- A Bates Method or See Clearly Method derivative (those are pseudoscience)
- A subscription product
- A data collection vehicle
