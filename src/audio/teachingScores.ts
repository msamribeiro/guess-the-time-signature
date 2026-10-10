import type { RhythmEvent, RhythmScore } from './types'

function mainBeatSteps(score: RhythmScore): number[] {
  const stepsPerBar = score.beatsPerBar * score.stepsPerBeat
  const steps: number[] = []

  for (let bar = 0; bar < score.bars; bar += 1) {
    for (let beat = 0; beat < score.beatsPerBar; beat += 1) {
      steps.push(bar * stepsPerBar + beat * score.stepsPerBeat)
    }
  }

  return steps
}
/**
 * Removes musical decoration and exaggerates the pulse hierarchy for the first
 * blind-practice stage. The underlying generated score remains unchanged.
 */
export function createClearPracticeScore(score: RhythmScore): RhythmScore {
  const events = score.events
    .filter((event) => event.instrument !== 'bass' && event.role !== 'ornament')
    .map((event): RhythmEvent => {
      if (event.instrument !== 'closed-hat') return { ...event }

      const velocity =
        event.role === 'downbeat' ? 0.95 : event.role === 'beat' ? 0.68 : 0.2
      return { ...event, velocity }
    })

  return { ...score, events }
}

/** Adds a consistent high click to every perceived beat for post-answer replay. */
export function createAccentedReplayScore(score: RhythmScore): RhythmScore {
  const clearScore = createClearPracticeScore(score)
  const accentEvents: RhythmEvent[] = mainBeatSteps(score).map((step) => ({
    step,
    durationSteps: 0.3,
    instrument: 'accent-click',
    velocity: step % (score.beatsPerBar * score.stepsPerBeat) === 0 ? 1 : 0.72,
    role: step % (score.beatsPerBar * score.stepsPerBeat) === 0 ? 'downbeat' : 'beat',
  }))

  return {
    ...clearScore,
    events: [...clearScore.events, ...accentEvents].sort(
      (left, right) => left.step - right.step,
    ),
  }
}
