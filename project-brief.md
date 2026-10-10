# Project Brief: Time Signature Trainer

## 1. Project Overview

**Time Signature Trainer** is a small, personal, mobile-friendly web application designed to improve musical ear training through a simple game: listen to a short musical excerpt and guess its time signature.

The goal is to develop an intuitive understanding of musical meter by regularly listening to different rhythmic patterns and musical arrangements.

This is a hobby project intended primarily for personal use. It should remain lightweight, easy to maintain, and enjoyable to use for occasional practice sessions.

**Core philosophy:** Keep the application simple, but make the musical exercises diverse, interesting, and educationally useful.

## 2. Core Experience

The primary interaction is straightforward:

1. Open the application on a phone or computer.
2. Listen to a short musical excerpt (approximately 10–20 seconds).
3. Select the time signature from several options.
4. Receive immediate feedback.
5. Optionally learn why the answer is correct.
6. Continue to the next exercise.

Example time signatures include:

`2/4` · `3/4` · `4/4` · `5/4` · `6/8` · `7/8` · `9/8`

Not all signatures need to be supported initially.

The application should encourage repeated listening and learning rather than competitive gameplay.

### Interface

The UI should be minimal and optimized for mobile devices.

The main screen should contain:

- A prominent play/replay button.
- A simple question: "What's the time signature?"
- Large, touch-friendly answer buttons.
- Immediate correct/incorrect feedback.
- A button to proceed to the next exercise.

Avoid unnecessary navigation, dashboards, accounts, achievements, or complicated settings.

A clean, modern, dark interface is preferred.

## 3. Hybrid Audio Approach

The central architectural decision is to support **two complementary sources of musical exercises**.

### A. Procedurally Generated Exercises

The application generates musical patterns programmatically using predefined musical rules.

This provides precise control over:

- Time signature and beat grouping.
- Tempo.
- Rhythmic complexity.
- Instrumentation.
- Accent patterns.
- Syncopation and rests.
- Number of measures.
- Musical variation.

For example:

```json
{
  "source": "procedural",
  "timeSignature": "7/8",
  "grouping": [2, 2, 3],
  "tempo": 112,
  "bars": 8,
  "style": "funk",
  "difficulty": "medium"
}
```

The generator should create different exercises from the same configuration through randomized rhythmic patterns.

A 7/8 exercise should not always sound identical. It might use groupings of 2+2+3, 3+2+2, or 2+3+2, with different instruments and rhythmic variations.

**Important:** The generated exercises should sound musical, not merely like metronome clicks.

#### Audio Generation

A proof of concept was successfully created during the initial exploration.

It generated approximately 23 seconds of 7/8 music at 116 BPM using:

- Synthesized kick drum.
- Synthesized snare.
- Synthesized hi-hat.
- Simple melodic bass.
- Multiple rhythmic patterns.
- Velocity variations.
- Basic reverb.

The result was recognizable as a musical groove, although the primitive synthesis introduced some audible artifacts.

This demonstrated that procedural generation is feasible.

For the application, the preferred direction is to **separate musical composition from sound generation**.

The procedural engine should produce musical events describing which notes or sounds to play, when to play them, and with what velocity.

A separate audio engine should render those events using realistic instrument samples or suitable synthesizers.

Potential technologies include the Web Audio API, sampled instruments, and MIDI-style event sequencing.

A small collection of quality instrument samples could substantially improve audio realism without requiring a complicated synthesis engine.

### B. AI-Generated Music Excerpts

The second source consists of prerecorded musical snippets generated using AI music tools.

These provide greater musical realism and stylistic diversity.

Possible styles include jazz, rock, funk, electronic music, classical, progressive rock, and folk.

For example, an AI music generator might receive a prompt requesting:

> A short instrumental jazz-funk groove in 7/8 time, grouped 2+2+3, featuring acoustic drums, electric bass, and piano. Maintain a consistent time signature throughout.

**Critical limitation:** AI-generated music may not reliably follow time-signature instructions.

Every excerpt must therefore be manually checked before inclusion in the exercise library.

The app should never assume that a generated excerpt has the requested time signature merely because it appeared in the prompt.

AI-generated excerpts would be stored as compressed audio files (e.g., MP3), together with metadata.

Example:

```json
{
  "id": "jazz-7-8-001",
  "source": "ai",
  "file": "audio/7-8/jazz-001.mp3",
  "timeSignature": "7/8",
  "grouping": [2, 2, 3],
  "genre": "jazz",
  "difficulty": "medium",
  "verified": true
}
```

The metadata could eventually include the original generation prompt, tempo, duration, and additional educational information.

## 4. Exercise Modes

The architecture should support three conceptual practice modes.

| Mode | Description |
|---|---|
| Learn | Controlled procedural exercises designed to develop rhythmic understanding. |
| Real Music | Curated AI-generated excerpts with verified time signatures. |
| Mixed Practice | Random exercises drawn from both sources. |

**Mixed Practice is the intended default experience.**

The source of an exercise should ideally remain hidden until the user submits an answer.

This helps prevent the user from approaching procedural and AI-generated exercises differently.

These modes do not all need to be implemented in the first version.

## 5. Educational Considerations

The goal is not simply to recognize a particular drum pattern, but to develop an understanding of musical meter.

The procedural generator should avoid teaching misleading associations, such as always placing the same kick or snare on particular beats.

Exercises should eventually vary in difficulty.

**Easy:** Clear accents, simple rhythms, recognizable groupings.

**Medium:** More natural grooves, rhythmic variation, occasional syncopation.

**Hard:** Weaker downbeats, syncopation, rests, and more complex arrangements.

Particular attention should be given to commonly confused meters, such as 3/4 versus 6/8.

An important musical consideration is that **time signatures are not always uniquely identifiable from audio alone**.

For example, a short passage may reasonably be interpreted as either 3/4 or 6/8 depending on phrasing and accent structure.

Similarly, 2/4 and 4/4 can be difficult to distinguish without sufficient musical context.

The generator should therefore create exercises with enough musical evidence to support the intended answer, especially at lower difficulty levels.

Potential future educational features include:

- Replay with accented beats.
- Visual representation of beat groupings.
- Explanation of the correct answer.
- Exercises focusing on commonly confused signatures.

These are optional enhancements rather than initial requirements.

## 6. Technical Architecture

The preferred implementation is a **static, client-side web application**.

It should run in modern desktop and mobile browsers without requiring a backend.

Potential deployment target: GitHub Pages.

The application should have three logically separate components:

### Exercise Engine

Responsible for selecting and managing exercises.

It should provide a common interface regardless of whether the exercise comes from procedural generation or a prerecorded audio file.

### Procedural Music Engine

Responsible for generating musical events according to meter, tempo, grouping, and difficulty.

It should be independent of the user interface.

### Audio Playback

Responsible for playing generated musical events or prerecorded audio files.

The audio implementation should be replaceable or extensible without requiring changes to the core game logic.

A possible future project structure:

```text
time-signature-trainer/
│
├── index.html
├── src/
│   ├── app.js
│   ├── exercises.js
│   ├── generator.js
│   └── audio.js
│
├── audio/
│   ├── 3-4/
│   ├── 4-4/
│   ├── 5-4/
│   ├── 6-8/
│   └── 7-8/
│
├── samples/
│   ├── drums/
│   └── bass/
│
├── data/
│   └── exercises.json
│
├── README.md
└── AGENTS.md
```

This structure is illustrative, not a strict requirement.

The implementation should prioritize simplicity over architectural sophistication.

## 7. Audio Assets and Storage

Both the application source code and its audio assets should be stored in a GitHub repository.

Prerecorded excerpts can be stored as compressed audio files.

Procedural exercises should generally be generated dynamically rather than stored as individual recordings.

Instrument samples can be sourced from freely licensed libraries, preferably using CC0 assets where practical.

Potential sources identified during exploration include:

- VSCO 2 Community Edition.
- Freesound.
- Philharmonia Orchestra sample library.

Licensing must be checked before distributing or publicly hosting audio assets, including AI-generated excerpts.

The project should not require an external audio-generation API during normal use.

## 8. Initial MVP

The first version should demonstrate the core concept with minimal implementation complexity.

### Required

- Mobile-friendly single-page interface.
- Play/replay audio.
- Choose a time signature.
- Correct/incorrect feedback.
- Next exercise.
- Basic procedural rhythm generation.
- Support for prerecorded audio clips.
- A simple exercise metadata format.
- No backend or authentication.

### Initial Meter Support

Start with a small selection, potentially:

`3/4` · `4/4` · `5/4` · `6/8` · `7/8`

Additional meters can be introduced later.

### Not Required Initially

- User accounts.
- Cloud storage.
- Analytics dashboards.
- Leaderboards.
- Elaborate progress tracking.
- AI music generation inside the application.
- Automatic time-signature detection.
- Advanced music synthesis.
- Native mobile applications.

## 9. Development Principles

This project should be developed incrementally.

**Simplicity first.** Avoid unnecessary dependencies, frameworks, and infrastructure.

**Musical correctness matters.** The generated exercises should genuinely represent their intended meter.

**Separate composition from playback.** The procedural generator should not depend on specific instrument sounds.

**Audio quality matters.** Prefer realistic samples where possible, but do not let audio-engine complexity prevent progress.

**Mobile-first.** The application should feel natural on a phone.

**Easy content expansion.** Adding a prerecorded exercise should require little more than adding an audio file and metadata.

**Personal project scope.** Optimize for maintainability and enjoyment rather than scalability.

## 10. Suggested Development Sequence

**Phase 1 — Basic Game**

Implement the mobile-friendly interface and game flow using a few prerecorded audio files.

**Phase 2 — Procedural Generator**

Implement a simple rhythmic event generator supporting several time signatures.

**Phase 3 — Better Audio**

Introduce sampled instruments and improve the musical quality of procedural exercises.

**Phase 4 — Hybrid Exercise Library**

Integrate curated AI-generated clips and procedural exercises into a shared exercise system.

**Phase 5 — Educational Improvements**

Introduce difficulty levels, grouping explanations, accented replay, and more sophisticated generation rules.

The precise implementation order can be adjusted based on technical considerations.

---

## 11. Instructions for Codex

This project is currently in the planning stage.

Before writing application code:

1. Review this brief.
2. Propose a minimal technical architecture.
3. Recommend a lightweight technology stack.
4. Identify the smallest useful MVP.
5. Propose a practical implementation sequence.
6. Highlight any important technical or musical risks.

Avoid introducing unnecessary complexity.

The objective is not to build a comprehensive music education platform. It is to build a **small, enjoyable, technically straightforward personal tool for practicing time-signature recognition**.

The hybrid audio approach—procedural generation combined with curated AI-generated recordings—is the central design decision and should be preserved throughout development.