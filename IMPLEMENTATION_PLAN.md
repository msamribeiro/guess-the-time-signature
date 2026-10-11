# Incremental Implementation Plan

> This file records the original implementation sequence. The current roadmap,
> release boundary, and prioritized backlog are maintained in
> [`BACKLOG.md`](BACKLOG.md). Follow that document where the plans differ.

This plan is deliberately small and sequential. Each milestone should leave a working, reviewable result.

## 0. Choose the smallest static foundation

- Confirm the implementation stack and GitHub Pages build/deploy approach.
- Add only the minimum project structure and quality checks needed for that stack.
- Establish a narrow-screen layout shell and an accessible audio-start interaction.

Exit condition: an empty but deployable static page works locally and at a repository subpath.

## 1. Build the practice loop with fixtures

- Define the normalized exercise schema and practice state transitions.
- Use a few in-memory fixtures before adding real audio.
- Implement play/replay placeholders, answer selection, submission, reveal, and next.
- Ensure the source is unavailable in the visible UI until reveal.

Exit condition: the complete interaction can be exercised without implementing two playback systems at once.

## 2. Add curated clip playback

- Add a small manifest and two to four short, licensed, manually verified clips.
- Load and play clips through a playback adapter.
- Handle loading, decode, missing-file, interruption, replay, and cleanup states.
- Display meter, grouping, explanation, and source after answering.

Exit condition: a learner can complete consecutive recorded-audio exercises on a phone.

## 3. Add controlled procedural rhythms

- Represent a pattern as timed rhythmic events separate from its sound.
- Generate clear beginner patterns for the initial meters.
- Support tempo, accent structure, and a reproducible random seed.
- Render with simple browser audio while preventing overlapping playback.
- Listen-test each generator rule for perceptual clarity.

Exit condition: generated and curated exercises run through the same practice interface.

## 4. Add selection and minimal modes

- Add a finite, in-memory session setup for meter choices, procedural mode, and
  exercise count.
- Show one exercise at a time and finish with an ephemeral accuracy summary.
- Add Real Music and Mixed filters only when each has enough verified content.
- Avoid immediate repeats and handle undersized or empty pools gracefully.
- Keep source identity hidden in Mixed until reveal.

Exit condition: selection behavior is predictable, tested, and honest about available content.

## 5. Harden and publish

- Test common mobile browser audio restrictions and interruption behavior.
- Verify keyboard and screen-reader labels, focus flow, contrast, touch targets, and reduced motion.
- Test manifest validation and broken asset behavior.
- Configure GitHub Pages and verify asset paths on the deployed subpath.
- Document how to add and verify a clip.

Exit condition: the MVP meets the success criteria in `README.md` on its deployed URL.

## Later, only after the MVP is useful

- Expand meters, groupings, genres, and difficulty levels cautiously.
- Add advanced per-session controls, such as tempo, bars, beat-unit guidance,
  accents, or a manually supplied Audio Lab recipe, without persisting them.
- Improve procedural realism by rendering the event sequence through sampled instruments or a MIDI-oriented layer.
- Explore pedagogically useful comparisons, such as paired `3/4` and `6/8` examples.

Session configuration, answers, and results remain in browser memory only. Do
not add saved preferences, history, accounts, analytics, cookies, or another
persistence mechanism unless the product direction is explicitly changed.

Do not make later upgrades prerequisites for validating the core practice loop.
