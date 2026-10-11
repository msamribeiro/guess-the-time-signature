# Session Handoff

Last updated: 2026-10-11

## Resume here

The first usable procedural version is live at:

<https://msamribeiro.com/guess-the-time-signature/>

The repository is `msamribeiro/guess-the-time-signature`, with `main` deployed
automatically through `.github/workflows/deploy-pages.yml`. `BACKLOG.md` is the
current roadmap. The next implementation slice is **Release 1, step 1: validate
the generator conservatively**.

Do not restart the UI, framework, audio architecture, or session model. They are
implemented and working. Begin by reviewing the existing generator tests and add
structural invariants in small, testable increments.

## Current product

- Static Vite and TypeScript application with no runtime backend.
- Practice flow: configure → listen → answer or learn → reveal → next → results.
- Procedural `2/4`, `3/4`, `4/4`, and `6/8` exercises.
- Learn, Clear, and Grooves modes.
- Finite sessions with an in-memory overall and per-meter summary.
- Deterministic generation recipes containing meter, grouping, pattern, tempo,
  bars, seed, and playback transform.
- Audio Lab for controlled recipe editing, JSON import/export, generation, and
  playback.
- Catppuccin Latte/Mocha presentation with system-aware, non-persistent theme
  selection.
- Responsive headers that place appearance and cross-page navigation in a
  compact mobile menu.
- GitHub Pages deployment from `main`.

## Product decisions to preserve

- Everything remains in browser memory. Do not add accounts, persistence,
  cookies, analytics, saved history, or tracking.
- Procedural exercises are the first release. Curated music clips are deferred
  because sourcing, licensing, and perceptual verification require separate
  work.
- The learner is not expected to validate musical correctness. Listening
  feedback can reveal confusing examples but is not ground truth.
- Generator output is deterministic for a supplied seed.
- Generation produces a rhythmic score before rendering; musical logic stays
  separate from timbre and UI markup.
- Sample-based kick, snare, hi-hat, and bass rendering remains a later fidelity
  improvement behind the existing playback boundary.
- Meter feedback describes the intended or best-supported hearing where audio
  could admit another interpretation.

## Verified at handoff

- `npm run typecheck` passes.
- `npm test` passes: 7 test files and 36 tests.
- `npm run build` passes and produces the multi-page static site in `dist/`.
- `git diff --check` passes.
- GitHub Pages workflow run `38176652513` completed successfully for commit
  `39e5a88`.
- The canonical deployed URL returns HTTP 200. The standard `github.io` project
  URL redirects to the configured `msamribeiro.com` domain.
- The learner listened to the procedural samples and found the revised rhythmic
  approach increasingly understandable with repetition.
- Narrow mobile layouts were reviewed during development, including the compact
  header menus on Practice and Audio Lab.

## Next slice: generator validation

Start with automated, structural facts that do not require trusting the
learner's ear:

1. Inventory the invariants already covered by `src/audio/*.test.ts`.
2. Add checks for event positions, bar boundaries, subdivision, and score
   duration across every supported meter and beginner pattern family.
3. Check accent hierarchy and ensure ornaments cannot remove or overpower the
   events that communicate grouping.
4. Check tempo and perceived-beat semantics, especially compound meter.
5. Confirm seeded output is deterministic while different seeds provide bounded
   variation.
6. Cross-check Learn labels, written counts, helper accents, grouping metadata,
   and generated events.
7. Document a short manual listening matrix for the combinations that automated
   tests cannot certify.

After this slice, continue with session hardening, application-level tests, and
real-device verification as listed in `BACKLOG.md`.

## Known gaps and cautions

- The procedural library has not received an independent review from a
  musically experienced reviewer.
- Automated tests do not yet establish every generator invariant described in
  the roadmap.
- Rapid audio interaction, page backgrounding, suspended audio contexts, and
  failure recovery need a dedicated hardening pass.
- The complete flow lacks browser-level integration tests.
- The public build currently includes the unlinked `design-options.html` and
  `redesign-guidance.html` comparison pages. Decide whether to keep or remove
  them from the release build before tagging Release 1.
- The public first version is deployed, but Release 1 should not be tagged until
  the remaining acceptance checks in `BACKLOG.md` are complete.

## Useful commands

```sh
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

Every push to `main` runs the same checks and deploys `dist/` to GitHub Pages.
