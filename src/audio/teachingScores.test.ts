import { describe, expect, it } from 'vitest'
import { generateRhythm } from './generateRhythm'
import { AUDIO_EXAMPLES } from './examples'
import { createAccentedReplayScore, createClearPracticeScore } from './teachingScores'

describe('teaching scores', () => {
  it('removes bass and ornaments from clear practice', () => {
    const score = generateRhythm({
      meter: '6/8',
      seed: 'clear',
      patternFamily: 'compound-rock',
      bars: 4,
    })
    const clear = createClearPracticeScore(score)

    expect(clear.events.some((event) => event.instrument === 'bass')).toBe(false)
    expect(clear.events.some((event) => event.role === 'ornament')).toBe(false)
    expect(clear.events.some((event) => event.instrument === 'closed-hat')).toBe(true)
  })

  it('adds one accent click per perceived beat', () => {
    const threeFour = createAccentedReplayScore(
      generateRhythm({ meter: '3/4', seed: 'three', bars: 4 }),
    )
    const sixEight = createAccentedReplayScore(
      generateRhythm({ meter: '6/8', seed: 'six', bars: 4 }),
    )

    expect(
      threeFour.events.filter((event) => event.instrument === 'accent-click'),
    ).toHaveLength(12)
    expect(
      sixEight.events.filter((event) => event.instrument === 'accent-click'),
    ).toHaveLength(8)
  })

  it('does not mutate the generated score', () => {
    const score = generateRhythm({ meter: '3/4', seed: 'immutable' })
    const originalEvents = structuredClone(score.events)

    createAccentedReplayScore(score)

    expect(score.events).toEqual(originalEvents)
  })

  it('preserves every main beat across the full beginner library', () => {
    for (const example of AUDIO_EXAMPLES) {
      const score = createClearPracticeScore(example.score)
      const stepsPerBar = score.beatsPerBar * score.stepsPerBeat

      for (let bar = 0; bar < score.bars; bar += 1) {
        for (let beat = 0; beat < score.beatsPerBar; beat += 1) {
          const step = bar * stepsPerBar + beat * score.stepsPerBeat
          expect(score.events).toContainEqual(
            expect.objectContaining({
              step,
              instrument: 'closed-hat',
              role: beat === 0 ? 'downbeat' : 'beat',
            }),
          )
        }
      }
    }
  })
})
