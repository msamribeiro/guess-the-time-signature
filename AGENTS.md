# Codex Project Instructions

## Mission

Build a minimal, mobile-friendly time-signature ear-training web app. It should help one learner practice identifying meter from sound through a fast listen → guess → reveal → next loop.

The product direction is intentionally hybrid:

- Procedural exercises offer control and pedagogical clarity.
- Curated, manually verified audio clips offer realism and musical variety.
- Both must share one exercise model and one UI flow.

Read `README.md` and `SESSION_HANDOFF.md` before making product or architecture
decisions. `BACKLOG.md` is the current roadmap; `IMPLEMENTATION_PLAN.md` retains
the original sequence for historical context.

## Current status

The first procedural version is implemented and publicly deployed. It uses
vanilla TypeScript, Vite, Vitest, browser Web Audio, and a GitHub Pages Actions
workflow. Practice sessions, theme choices, answers, and results remain in
browser memory only.

The next release work is generator validation, followed by session hardening,
application-level tests, deployed-browser checks, and an explicitly tagged
procedural release. Curated music is intentionally deferred until after that
release. Inspect the repository and preserve user-authored work before making
changes; do not introduce a framework merely in anticipation of complexity.

## Product constraints

- Client-only and deployable as static files on GitHub Pages
- No backend, database, accounts, analytics, or tracking
- No live AI generation
- No elaborate interface or premature design system
- Mobile-first, but usable on desktop
- Accessible touch targets, keyboard controls, visible focus, and semantic labels
- Exercise source hidden until after the learner submits an answer
- Audio begins only after a user action; never autoplay on page load
- Core practice must not require a network connection after static assets load

Do not broaden scope without a clear user request.

## Delivery priorities

Work in thin, testable slices, following `BACKLOG.md`:

1. Add conservative structural validation for the procedural generator.
2. Harden audio lifecycle, accessibility, and session edge cases.
3. Add application-level regression coverage for the learner flow.
4. Complete deployed mobile and desktop verification, documentation, and the
   first procedural release tag.
5. Treat advanced controls, sampled instruments, and curated clips as later
   work unless the user explicitly reprioritizes them.

At each step, keep the app runnable. Prefer finishing the end-to-end learning loop over adding settings, meters, genres, statistics, or visual polish.

## Architecture guidance

Keep these concerns separate even if the initial implementation is small:

- **Exercise data:** meter, grouping, difficulty, explanation, and verification
- **Selection:** filtering and choosing the next exercise
- **Playback:** curated audio versus procedural rendering
- **Session state:** ready, playing, answered, revealed, and advancing
- **Presentation:** controls and feedback

The UI should consume a normalized exercise interface. It must not branch on source type except where playback is delegated to the appropriate adapter or where the source is revealed after answering.

Keep curated clip metadata in a manifest. Validate required fields at development/build time when practical, and fail with a useful message when an asset is missing or malformed.

Model procedural content as a rhythmic score or timed event sequence before rendering sound. Keep generation deterministic when supplied with a seed so bugs and musical examples can be reproduced. Separate generation from timbre/rendering to allow realistic samples or MIDI-style playback later.

Avoid encoding music logic in component markup.

## Musical correctness

Meter is perceptual and not always uniquely determined by audio. Code and copy must reflect that.

- Never trust an AI prompt, filename, tag, or model output as verification.
- Only include curated clips marked as manually verified.
- Verify pulse, subdivision, beat grouping, downbeat clarity, and meter stability.
- Exclude changing-meter and materially ambiguous clips from beginner content.
- Permit verification notes and plausible alternate interpretations in the data model.
- Phrase feedback as the intended or best-supported hearing when ambiguity exists.
- Do not generate procedural patterns that technically fit a meter but fail to communicate its grouping at the selected difficulty.

When changing generator rules or adding content, test by listening as well as by inspecting data.

## UX behavior

- Put the primary practice controls within comfortable thumb reach on narrow screens.
- Keep the answer choices obvious and stable while an exercise is active.
- Allow replay before and after answering.
- Prevent accidental double advancement and overlapping playback.
- Stop or clean up audio when changing exercises or leaving the practice view.
- Reveal correctness, intended meter, grouping explanation, and source only after submission.
- Never use source-specific styling before the answer.
- Respect reduced-motion preferences and do not rely on color alone for correctness.

## Engineering standards

- Use clear types or schemas for exercise data.
- Keep dependencies few, current, and justified.
- Avoid committing secrets, generated dependency directories, or unlicensed audio.
- Prefer repository-relative asset handling that works under a GitHub Pages subpath.
- Add focused tests for state transitions, exercise selection, manifest validation, and deterministic generation.
- For audio behavior that automated tests cannot establish, document a short manual check.
- Test at least one narrow mobile viewport and one desktop viewport.
- Keep documentation synchronized with meaningful behavior or schema changes.

Before declaring a slice complete, run the available checks and exercise the changed path manually where browser audio is involved. Report what was verified and any remaining uncertainty.

## Scope guardrails

Defer these unless the user explicitly reprioritizes them:

- Authentication and cloud sync
- Persistent learning analytics or streaks
- Leaderboards and social features
- Server-side APIs
- On-demand generative audio
- Advanced notation editing
- Large sample libraries
- Adaptive-learning algorithms
- Installation as a native mobile app

When a requested feature would introduce one of these, explain the scope impact before implementing it.
