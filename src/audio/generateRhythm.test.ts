import { describe, expect, it } from 'vitest'
import { generateRhythm } from './generateRhythm'
import { scoreDurationSeconds } from './webAudioRenderer'

describe('generateRhythm', () => {
  it('repeats exactly when given the same seed', () => {
    const options = { meter: '4/4' as const, seed: 'repeatable-example' }

    expect(generateRhythm(options)).toEqual(generateRhythm(options))
  })

  it('uses the seed to vary non-structural pulses', () => {
    const first = generateRhythm({
      meter: '3/4',
      patternFamily: 'waltz-bass',
      seed: 'variation-a',
      bars: 8,
    })
    const second = generateRhythm({
      meter: '3/4',
      patternFamily: 'waltz-bass',
      seed: 'variation-b',
      bars: 8,
    })

    expect(first.events).not.toEqual(second.events)
  })

  it('models 6/8 as two dotted-quarter beats with triple subdivision', () => {
    const score = generateRhythm({ meter: '6/8', seed: 'compound-meter', bars: 1 })
    const hats = score.events.filter((event) => event.instrument === 'closed-hat')

    expect(score).toMatchObject({
      grouping: '3+3',
      beatsPerBar: 2,
      stepsPerBeat: 3,
      tempoBeatUnit: 'dotted-quarter',
    })
    expect(hats).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ step: 0, role: 'downbeat' }),
        expect.objectContaining({ step: 3, role: 'beat' }),
      ]),
    )
  })

  it('supports four explicit families for each comparison meter', () => {
    const families = [
      ['3/4', 'waltz-bass'],
      ['3/4', 'flowing-three'],
      ['3/4', 'light-waltz'],
      ['3/4', 'three-beat-rock'],
      ['6/8', 'compound-rock'],
      ['6/8', 'rolling-six'],
      ['6/8', 'compound-folk'],
      ['6/8', 'six-eight-drive'],
    ] as const

    for (const [meter, patternFamily] of families) {
      expect(generateRhythm({ meter, seed: patternFamily, patternFamily }).patternFamily).toBe(
        patternFamily,
      )
    }
  })

  it('gives every bar a structural downbeat and pitched bass material', () => {
    const score = generateRhythm({
      meter: '3/4',
      seed: 'structure',
      patternFamily: 'flowing-three',
      bars: 4,
    })
    const stepsPerBar = score.beatsPerBar * score.stepsPerBeat

    for (let bar = 0; bar < score.bars; bar += 1) {
      const downbeat = bar * stepsPerBar
      expect(score.events).toContainEqual(
        expect.objectContaining({ step: downbeat, instrument: 'kick', role: 'downbeat' }),
      )
      expect(score.events).toContainEqual(
        expect.objectContaining({ step: downbeat, instrument: 'bass', pitch: expect.any(Number) }),
      )
    }
  })

  it('keeps every event inside the score grid', () => {
    const score = generateRhythm({ meter: '2/4', seed: 'bounded', bars: 3 })
    const totalSteps = score.bars * score.beatsPerBar * score.stepsPerBeat

    expect(score.events.every((event) => event.step >= 0 && event.step < totalSteps)).toBe(true)
  })

  it('derives duration from perceptual beats and tempo', () => {
    const score = generateRhythm({ meter: '6/8', seed: 'duration', bars: 4, tempoBpm: 80 })

    expect(scoreDurationSeconds(score)).toBe(6)
  })

  it('rejects invalid generation limits', () => {
    expect(() => generateRhythm({ meter: '4/4', seed: 'bad', bars: 0 })).toThrow(RangeError)
    expect(() => generateRhythm({ meter: '4/4', seed: 'bad', bars: 1.5 })).toThrow(TypeError)
    expect(() => generateRhythm({ meter: '4/4', seed: 'bad', tempoBpm: 300 })).toThrow(
      RangeError,
    )
    expect(() =>
      generateRhythm({ meter: '3/4', seed: 'bad', patternFamily: 'compound-rock' }),
    ).toThrow(RangeError)
  })
})
