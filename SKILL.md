---
name: foveal-forge-protocol
description: Declarative specification for the foveal-forge perceptual vision training protocol. Defines the drills, their psychophysical parameters, session structure, scoring, and progression rules. This is the single source of truth for the training contract; code implements this spec.
version: 0.1.0
status: draft
---

# Foveal Forge Training Protocol

## Purpose

Train the neural correlates of near vision (contrast sensitivity, saccadic efficiency, reading fluency) in presbyopic adults via perceptual learning. This spec defines *what* the training does, not *how* it is implemented. Code in `src/` implements this contract.

## Evidence base

Each drill maps to a published mechanism in `references/evidence.md`. Drills without citations do not ship.

## Session structure

A standard session is **12 minutes**, composed of:

| Phase | Duration | Drill |
|-------|----------|-------|
| Warm-up | 1 min | Fixation stability |
| Block A | 4 min | Gabor contrast sensitivity |
| Rest | 30 sec | Distance gaze cue (20-20-20) |
| Block B | 3 min | Saccade + crowding |
| Rest | 30 sec | Distance gaze cue |
| Block C | 2.5 min | Reading fluency (RSVP) |
| Cooldown | 30 sec | Free near-far gaze |

Sessions are intended **5 days per week**. The app does not push notifications; the user opts into a daily local alarm.

## Drills

### D1. Fixation stability (warm-up)

- **Stimulus:** central black fixation cross on neutral-gray field
- **Task:** maintain gaze for 60 sec
- **Purpose:** baseline attentional state; not scored
- **Citation:** N/A (preparatory)

### D2. Gabor contrast sensitivity (Block A)

The core mechanism. Lateral-masking Gabor patch paradigm based on Polat et al. (2012).

- **Stimulus:** central Gabor patch flanked by two collinear Gabor patches at variable separation (1.5λ to 12λ)
- **Spatial frequencies tested:** 3, 6, 12 cycles per degree
- **Orientations:** vertical, ±45°, horizontal (randomized)
- **Task:** 2AFC — did the central patch appear or not? (yes/no with confidence)
- **Adaptive procedure:** 3-down-1-up staircase, terminating at 79% threshold
- **Trials per session:** ~80 (variable, time-boxed to 4 min)
- **Scored metric:** contrast threshold (Michelson) per spatial frequency
- **Progression:** rising spatial frequency mastery; track threshold over sessions
- **Citation:** Polat et al., 2012, *Scientific Reports* 2:278

### D3. Saccade + crowding (Block B)

Trains rapid foveation and reduces crowding interference.

- **Stimulus:** Sloan letter triplets (target flanked by distractors) appearing at random retinal eccentricities up to 8°
- **Task:** identify the center letter
- **Presentation:** 150ms exposure, masked
- **Crowding spacing:** adaptive — starts at 1.5× critical spacing, narrows on correct response
- **Trials per session:** ~60
- **Scored metric:** mean reaction time, accuracy, critical spacing
- **Citation:** Levi, 2008, *Vision Research* 48:635 (crowding); Yu et al., 2010 (perceptual learning of crowding)

### D4. Reading fluency / RSVP (Block C)

Rapid Serial Visual Presentation trains word-level processing speed.

- **Stimulus:** common-word passages (CEFR B1 level, 60-word blocks) presented one word at a time
- **Initial rate:** 200 words per minute
- **Adaptive procedure:** rate increases 5% on correctly answered comprehension question; decreases 10% on failure
- **Font:** sans-serif, 24pt baseline, adjustable
- **Trials per session:** as many 60-word blocks as fit in 2.5 min
- **Scored metric:** sustained WPM at 80% comprehension
- **Citation:** Calabrèse et al., 2014, *Vision Research* 103:33

## Baseline assessment (one-time, on first launch)

Before training begins, the user completes:

1. **Pelli-Robson-style contrast sensitivity test** at standard reading distance (40 cm self-reported)
2. **Standardized reading speed test** (MNREAD-inspired) — measures critical print size and maximum reading speed
3. **Self-report:** age, current correction (glasses/contacts/none), known ocular conditions (with disclaimer: this app is not a substitute for an eye exam)

Baseline establishes per-user starting parameters and the comparison line for progress.

## Progression and metrics

The app surfaces three primary metrics per drill family:

1. **Contrast threshold** (lower = better) — log scale chart, per spatial frequency
2. **Critical crowding spacing** (lower = better) — degrees of visual angle
3. **Sustained reading rate** at 80% comprehension (higher = better) — WPM

A composite "neural near-vision score" is *not* computed. We do not want users equating a single number with their actual vision.

## Re-baseline

Every 30 completed sessions, the app prompts a fresh baseline run to track real progress against the initial measurement.

## What this protocol does NOT include

- Eye-movement "exercises" without a perceptual learning basis (e.g., Bates palming, figure-eight tracing)
- Accommodation drills (no evidence they affect lens elasticity)
- Pinhole training (insufficient evidence)
- Any gamification that rewards continued use over actual learning (no streaks-as-currency, no leaderboards)

## Safety stops

The app must:
- Surface a "stop and rest" prompt if the user reports eye strain (post-session 0-10 scale; ≥7 triggers a recommended rest day)
- Include in onboarding: discontinue use and consult an ophthalmologist if you experience pain, sudden vision changes, flashes, or floaters
- Refuse to start a session within 30 minutes of the last completed session

## Versioning

This spec uses semantic versioning. Code references the protocol version it implements. A spec change with a major-version bump invalidates prior session comparability — the app warns the user before applying.
