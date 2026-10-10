# Procedural audio design

The first procedural-audio slice separates musical decisions from browser sound:

1. `generateRhythm` creates a deterministic `RhythmScore` from a meter and seed.
2. The score contains integer subdivision positions, instruments, velocities,
   durations, musical roles, and optional MIDI pitches.
3. `WebAudioRenderer` converts those events to scheduled browser audio.

The practice flow will depend on the score and renderer interfaces, not on the
current oscillator sounds. This keeps future sampled percussion or MIDI-style
rendering from changing the generator or exercise model.

## Tempo semantics

`tempoBpm` always describes the perceived main beat:

- `2/4`, `3/4`, and `4/4` use a quarter-note beat.
- `6/8` uses a dotted-quarter beat, divided into three eighth-note steps.

This avoids the common ambiguity where “80 BPM in 6/8” might mean either eighth
notes or dotted-quarter beats.

## Initial practice comparison

The practice page currently concentrates on `3/4` versus `6/8`. Both contain six
eighth-note subdivisions but organize them differently: three groups of two
versus two groups of three. It selects from two reproducible, four-bar pattern
families for each meter. The initial library currently contains four families per
meter at several tempos, while preserving the same underlying beat hierarchy.

The learning progression has three explicit stages:

1. **Learn:** labeled examples, written counts, and a clear click on every main beat.
2. **Clear practice:** blind exercises without bass or ornaments and with exaggerated
   hi-hat accents.
3. **Full grooves:** blind exercises using the complete generated arrangement.

After any answer, the learner can replay that exact score with main-beat clicks.
These teaching and replay scores are derived without mutating the generated score.

The feedback also exposes a generation recipe containing the meter, grouping,
pattern family, seed, tempo and its beat unit, bar count, and playback transform.
“Regenerate and replay” reconstructs the base score solely from that recipe and
then reapplies the Clear or Groove transform. This provides an executable check
that the displayed parameters are sufficient for reproduction.

The `2/4` versus `4/4` lesson uses longer, equal-length phrases: eight bars of
`2/4` and four bars of `4/4`, each totaling sixteen quarter-note beats. This keeps
duration from revealing the answer. Its teaching cues emphasize whether the
strongest downbeat returns after two beats or after a larger four-beat cycle, and
the feedback explicitly notes that short passages can support either notation.

The renderer synthesizes four local instruments:

- kick drum
- snare drum
- closed hi-hat
- pitched bass

The seed controls small ornaments and phrase-level bass choices, but it never
removes a main beat boundary or structural accent. Calling the generator with the
same meter, seed, family, bar count, and tempo produces the same score.

## Audio Lab

The practice page links to `/audio-lab.html`, a free-form companion for exploring
and authoring rhythms. Its form limits meter, pattern family, and playback
transform to supported values; changing the meter also limits the available
pattern families. Tempo and bar count use the generator's supported ranges.

The JSON panel supports two directions:

- Form changes produce a complete, reproducible generation recipe.
- Pasted JSON is validated, loaded into the controlled fields, and normalized.

`grouping` and `tempoBeatUnit` are derived from the meter during import rather
than trusted from JSON. Import also rejects a pattern family belonging to a
different meter. Generating audio still requires an explicit button press.

## Listening check

Run `npm run dev`, then listen to every example without watching its label.

- Can the main pulse be found within one bar?
- Does `3/4` feel cyclic in three quarter-note beats?
- Does `6/8` read as two main beats, each split into three?
- Are the downbeat and subdivision sounds distinct at phone-speaker volume?
- Does starting a different example immediately stop the previous one?

Automated tests verify timing structure and determinism. The comparison is a
learning aid rather than a request for the learner to certify musical correctness;
expert review is still required before treating generated patterns as finished
exercise content.

## Deliberately deferred

- Realistic samples and instrument kits
- Swing, humanized timing, and velocity jitter
- Multiple difficulty levels
- Syncopated or style-specific patterns
- Offline audio-file export
- Additional meters
