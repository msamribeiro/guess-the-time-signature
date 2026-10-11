# Time Signature Ear Trainer

A personal, mobile-friendly web app for learning to recognize time signatures by ear.

The project is in early development. It currently includes a minimal Vite and
TypeScript foundation plus the product brief and implementation guidance; the
practice loop has not been built yet.

## Local development

Requirements: Node.js 22.12 or newer and npm.

```sh
npm install
npm run dev
```

Use `npm run typecheck` for a focused TypeScript check and `npm run build` to
produce the static site in `dist/`. Build assets use relative URLs so the output
can run under a GitHub Pages repository subpath.

`npm test` runs the focused automated checks. The current page lets the learner
select any two or more of `2/4`, `3/4`, `4/4`, and `6/8`, then practice them in
three stages: labeled examples, clear accented practice, and full musical grooves. See
[`docs/audio-generation.md`](docs/audio-generation.md) for the score model, tempo
semantics, and manual listening check.

Use the **Audio Lab** link beside the practice modes to configure and audition
procedural exercises. The Audio Lab constrains category fields to supported
options and can load or copy a normalized JSON recipe containing everything
needed to reproduce the generated score. It is a free-form companion to the
focused learner flow.

The visual direction references are kept in [`docs/design`](docs/design). They
include ideas beyond the initial MVP and should not be treated as a requirement
to implement progress tracking or advanced meters early.

## Product idea

The trainer will combine two complementary kinds of exercises:

- **Procedural exercises** provide controlled, repeatable rhythmic examples with known meter, tempo, grouping, accents, and difficulty.
- **Curated audio clips** provide more natural and varied musical examples. These may be AI-generated, but every clip must be manually checked before it is included.

Both sources should use the same exercise experience:

1. Play or replay the excerpt.
2. Choose a time signature.
3. Reveal the answer and a short explanation.
4. Continue to the next exercise.

The source of an exercise must remain hidden until the learner answers. This avoids biasing the guess and makes mixed practice feel coherent.

## Goals

- Make short practice sessions pleasant on a phone.
- Teach meter recognition rather than music-theory trivia.
- Start with a small, dependable set of common meters.
- Support tightly controlled learning examples and realistic listening tests.
- Keep exercises and audio easy to add without changing application code.
- Work as a static browser-based site that can be hosted on GitHub Pages.

## Non-goals for the initial version

- A backend or database
- User accounts or cross-device progress
- Analytics or tracking
- Social, competitive, or sharing features
- A large design system or elaborate interface
- Live AI music generation
- A full notation editor or digital audio workstation
- Perfect coverage of every meter, genre, or ambiguity

## Initial MVP

The first useful version should include:

- A single responsive practice screen
- Play, pause/replay, guess, reveal, and next controls
- A small answer set, initially `2/4`, `3/4`, `4/4`, and `6/8`
- A modest collection of locally stored, manually verified clips
- A simple procedural rhythm generator using browser audio
- Mixed practice drawing from both sources
- Lightweight feedback that identifies the meter and describes its beat grouping
- Sensible audio loading, error, and empty-library states

Practice modes such as **Learn**, **Real Music**, and **Mixed Practice** are a useful direction, but they do not all need distinct screens in the first release. A small mode selector is enough when the content supports it.

## Exercise model

Procedural and recorded exercises should be normalized into one runtime shape so the player and answer flow do not care where an exercise came from.

An exercise should have, at minimum:

- A stable unique ID
- The correct time signature
- A perceptual grouping, such as `2+2`, `3+3`, or `2+2+3`
- Difficulty
- Tempo or an approximate tempo range
- Duration
- Source type: procedural or curated clip
- Playback information: generator parameters or an audio-file path
- A short explanation shown after answering
- Verification status and notes

For curated clips, keep metadata in a version-controlled manifest rather than embedding it in UI code. A future manifest entry might resemble:

```json
{
  "id": "clip-6-8-001",
  "source": "curated",
  "audio": "audio/clip-6-8-001.ogg",
  "meter": "6/8",
  "grouping": "3+3",
  "difficulty": "beginner",
  "tempoBpm": 92,
  "durationSeconds": 12,
  "explanation": "Two main beats, each divided into three eighth notes.",
  "verification": {
    "status": "verified",
    "method": "manual count and downbeat review",
    "notes": "Stable compound-duple pulse throughout."
  }
}
```

The exact schema can be refined during implementation. Prefer explicit, boring data over clever inference.

## Musical and verification cautions

A notated time signature is not always uniquely recoverable from sound alone. The same passage may reasonably be heard or written in more than one way—for example, `3/4` versus `6/8`, `2/4` versus `4/4`, or a syncopated passage whose downbeat is obscured.

Therefore:

- Treat the exercise's intended meter as a curated teaching label, not an infallible property extracted from audio.
- Verify the perceived pulse, subdivision, grouping, and downbeat—not just a generator prompt or file name.
- Reject or explicitly label clips whose intended answer is not sufficiently defensible.
- Avoid clips that change meter in the initial version.
- Do not imply that a plausible alternate hearing is simply a learner failure.
- Where useful, explain why the chosen answer is intended and acknowledge a close alternative.
- AI-generated clips must never enter the exercise library solely because their prompts requested a particular meter.

The quality of the exercise set matters more than its size.

## Technical direction

- Build a client-only static web app.
- Keep deployment compatible with GitHub Pages, including repository subpaths and static asset URLs.
- Prefer a small dependency footprint and standard browser APIs.
- Store curated audio in the repository initially, subject to repository-size and licensing constraints.
- Use the Web Audio API or a similarly lightweight browser approach for the first procedural rhythms.
- Design the exercise interface independently from playback implementations.
- Make the core flow usable with touch, keyboard, and screen readers.
- Assume mobile browsers may block audio until a user gesture and may interrupt playback when backgrounded.

Higher-quality procedural playback is an eventual upgrade: generate a rhythmic score or MIDI-like event sequence, then render it with realistic sampled instruments. Preserve the separation between score generation and sound rendering so this can be added without replacing the exercise model or UI flow.

## Content workflow

For each curated clip:

1. Create or obtain the audio with clear usage rights.
2. Trim and normalize it for a short exercise.
3. Listen without relying on its prompt or claimed metadata.
4. Confirm the pulse, grouping, downbeat, and stability of the intended meter.
5. Ask a second listener to review ambiguous or advanced examples when practical.
6. Add it to the manifest only after verification.
7. Record useful caveats in the verification notes.

Keep original generation prompts and provenance in internal content notes if useful, but do not reveal the source before the learner answers.

## Success criteria for the first release

- The full listen → guess → reveal → next loop works reliably on a phone.
- Both procedural and curated exercises can appear through the same interface.
- The learner cannot see the source before answering.
- Every bundled clip has explicit verification metadata.
- The site can be built and deployed as static files on GitHub Pages.
- A new verified clip can be added by placing the asset and editing the manifest.

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for a staged build outline. Repository-level instructions for Codex are in [AGENTS.md](AGENTS.md).
