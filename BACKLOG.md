# Product Roadmap and Backlog

This is the current execution roadmap. It replaces the original milestone order
in `IMPLEMENTATION_PLAN.md` where the two disagree.

The first release is a procedural ear trainer. Curated music clips are valuable,
but sourcing, licensing, and perceptual verification make them a post-release
content project rather than a prerequisite for publishing the app.

## Product constraints

- Keep the app client-only and deployable as static files on GitHub Pages.
- Keep configuration, exercise queues, answers, and results in browser memory
  only. Do not add accounts, analytics, history, cookies, or persistence.
- Preserve one normalized exercise model and one learner flow across playback
  sources.
- Require a user action before audio starts and keep exercises usable after the
  static assets have loaded.
- Treat meter as an intended, best-supported hearing rather than an infallible
  property of sound.

## Already in place

- [x] Minimal Vite and TypeScript foundation with a static production build.
- [x] Source-neutral exercise metadata and playback adapters.
- [x] Deterministic rhythmic scores separated from Web Audio rendering.
- [x] Reproducible recipes with meter, grouping, pattern, tempo, bars, seed, and
  playback transform.
- [x] Learn, Clear, and Grooves playback modes.
- [x] Audio Lab for controlled recipe editing, import, and reproduction.
- [x] Configurable, finite practice sessions for `2/4`, `3/4`, `4/4`, and `6/8`.
- [x] In-memory results with overall and per-meter summaries.
- [x] Play/stop controls and cleanup when changing exercises or leaving the page.

## Release 1: procedural trainer

### 1. Validate the generator conservatively

The learner is using this app to develop their ear and is not expected to certify
musical correctness. Their experience can reveal confusion or weak teaching
cues, but it is learner feedback rather than ground truth.

- [ ] Add structural checks for beat positions, subdivision, accent hierarchy,
  bar length, tempo semantics, and deterministic seeded variation.
- [ ] Ensure ornaments cannot remove or overpower the structural cues that
  communicate the intended grouping.
- [ ] Confirm that Learn labels, written counts, helper clicks, and generated
  events all describe the same meter.
- [ ] Keep beginner patterns deliberately clear and phrase feedback as the
  intended or best-supported hearing where notation could be ambiguous.
- [ ] Use the learner's listening sessions to identify examples that feel
  confusing, without treating their answer as verification or failure.
- [ ] Seek an independent musically experienced review before presenting the
  procedural library as broadly validated teaching content.
- [ ] Record reviewed combinations, known ambiguity, and generator-rule changes
  in version-controlled project data.

Exit condition: automated structural checks cover the generator invariants, the
learner aids agree with the score, and the release is described honestly as a
procedural trainer pending independent musical review.

### 2. Harden the session experience

- [ ] Test rapid play/stop/replay, repeated submission, and accidental double
  advancement.
- [ ] Handle audio-context suspension, playback failure, interruption, page
  backgrounding, and exercise changes without overlapping sound.
- [ ] Complete a session using only the keyboard.
- [ ] Verify focus order, visible focus, semantic labels, live announcements,
  contrast, touch targets, and reduced-motion behavior.
- [ ] Check a narrow mobile viewport and a desktop viewport in supported browsers.
- [ ] Decide whether following the Audio Lab link during an active session needs
  a warning that the ephemeral session will end.

Exit condition: the complete setup → listen → answer → reveal → next → results
flow behaves reliably on mobile and desktop.

### 3. Add application-level tests

- [ ] Cover the setup → practice → results integration, not only the underlying
  state functions.
- [ ] Cover single-meter Learn and the two-meter minimum for scored modes.
- [ ] Cover the final exercise, early exit, replay, and starting another session.
- [ ] Cover useful error messages for unavailable or failed audio.
- [ ] Retain focused tests for deterministic generation, balanced selection, and
  session transitions.

Exit condition: the important learner paths have automated regression coverage,
with browser-audio limitations called out for manual testing.

### 4. Deploy and verify

- [ ] Add a GitHub Pages deployment workflow.
- [ ] Verify relative assets and navigation under the repository subpath.
- [ ] Test the deployed build on at least one real phone and one desktop browser.
- [ ] Document supported browsers, local development, deployment, structural
  checks, and the limits of current musical review.
- [ ] Tag the procedural-only first release once the acceptance checks pass.

Exit condition: the public static site satisfies the release checks above without
requiring a network connection during an active, already-loaded session.

## After Release 1

### Advanced session controls

Add these gradually and keep the default setup compact. Every option remains
per-session and ephemeral.

- [ ] Tempo or tempo-range control.
- [ ] Phrase length or bar-count control.
- [ ] Optional metronome or main-beat helper.
- [ ] Stronger beat-one and accent controls.
- [ ] Ornament inclusion or density control.
- [ ] Clear validation for combinations the generator cannot support.
- [ ] Preserve the effective settings in each reproducible exercise recipe.

### Audio Lab recipes in practice

- [ ] Import one validated Audio Lab recipe into a practice session.
- [ ] Later, accept a small in-memory set of recipes as a custom exercise pool.
- [ ] Keep this as controlled recipe editing, not an advanced notation editor.
- [ ] Ensure custom recipes use the same player, answer flow, and result model.

### Ephemeral review improvements

- [ ] Let the learner review missed meters or exercise recipes at the end of the
  current session.
- [ ] Make it explicit that the review disappears when the session ends.
- [ ] Do not turn this into saved history, streaks, or adaptive profiling.

## Audio fidelity and content expansion

### Sampled procedural instruments

Replace or supplement synthesized timbres with small, pre-recorded instrument
sounds such as kick, snare, closed hi-hat, and bass notes. This remains
procedural generation: the deterministic event score chooses when and how the
samples play. It is distinct from adding complete curated music excerpts.

- [ ] Select or record compact, clearly licensed one-shot samples.
- [ ] Define a small instrument-kit manifest with provenance and license notes.
- [ ] Preload and decode samples after an appropriate user action.
- [ ] Add a sample-based renderer behind the existing playback boundary.
- [ ] Keep the current synthesizer as a fallback when assets fail to decode.
- [ ] Confirm that recipes reproduce the same rhythmic score regardless of
  renderer, while documenting that timbre may differ.
- [ ] Listen-test accents, bass pitch, mixing, clipping, and phone-speaker clarity.
- [ ] Keep all required samples local so active practice does not depend on a
  remote service.

### Curated music clips — post-release

- [ ] Establish sourcing, licensing, attribution, trimming, and normalization
  rules before collecting clips.
- [ ] Define and validate a version-controlled clip manifest.
- [ ] Manually verify pulse, subdivision, grouping, downbeat clarity, meter
  stability, and plausible alternate interpretations for every clip.
- [ ] Begin with only two to four unambiguous, licensed examples.
- [ ] Exercise loading, decode failure, interruption, replay, and cleanup through
  the existing curated playback adapter.
- [ ] Add Real Music and Mixed modes only when the verified pool is large enough
  to make those modes honest and useful.
- [ ] Keep source identity hidden until after the learner submits an answer.

## Later possibilities

- More meters, groupings, procedural families, and difficulty levels.
- Pedagogical comparison sets such as `3/4` versus `6/8` and `2/4` versus `4/4`.
- More sampled kits or style-specific rendering, subject to asset size and
  licensing.

These remain outside the current scope: authentication, cloud sync, persistent
history, analytics, streaks, leaderboards, server APIs, live AI generation,
adaptive-learning profiles, a full notation editor, and native mobile apps.
