import { describe, expect, it } from 'vitest'
import { AUDIO_EXAMPLES } from './examples'
import {
  createGenerationRecipe,
  normalizeGenerationRecipe,
  regenerateFromRecipe,
  renderRecipeScore,
  serializeGenerationRecipe,
} from './generationRecipe'

describe('generation recipe', () => {
  it('reconstructs every authored score exactly', () => {
    for (const example of AUDIO_EXAMPLES) {
      const recipe = createGenerationRecipe(example.score, 'full-groove')
      expect(regenerateFromRecipe(recipe)).toEqual(example.score)
    }
  })

  it('serializes every input needed to regenerate a score', () => {
    const recipe = createGenerationRecipe(AUDIO_EXAMPLES[0]!.score, 'clear-practice')
    const serialized = JSON.parse(serializeGenerationRecipe(recipe)) as Record<string, unknown>

    expect(serialized).toMatchObject({
      meter: '3/4',
      patternFamily: 'waltz-bass',
      seed: 'waltz-bass-01',
      tempoBpm: 104,
      bars: 4,
      playbackTransform: 'clear-practice',
    })
  })

  it('applies the requested playback transformation', () => {
    const example = AUDIO_EXAMPLES[0]!
    const clear = renderRecipeScore(createGenerationRecipe(example.score, 'clear-practice'))
    const accented = renderRecipeScore(
      createGenerationRecipe(example.score, 'accented-replay'),
    )

    expect(clear.events.some((event) => event.instrument === 'bass')).toBe(false)
    expect(accented.events.some((event) => event.instrument === 'accent-click')).toBe(true)
  })

  it('normalizes imported recipes and replaces derived metadata', () => {
    const recipe = normalizeGenerationRecipe({
      meter: '6/8',
      grouping: 'untrusted value',
      patternFamily: 'compound-rock',
      seed: ' imported-seed ',
      tempoBpm: 90,
      tempoBeatUnit: 'quarter',
      bars: 3,
      playbackTransform: 'full-groove',
    })

    expect(recipe).toMatchObject({
      meter: '6/8',
      grouping: '3+3',
      patternFamily: 'compound-rock',
      seed: 'imported-seed',
      tempoBpm: 90,
      tempoBeatUnit: 'dotted-quarter',
      bars: 3,
      playbackTransform: 'full-groove',
    })
  })

  it('rejects a pattern family that is incompatible with the selected meter', () => {
    expect(() =>
      normalizeGenerationRecipe({
        meter: '3/4',
        patternFamily: 'compound-rock',
        seed: 'mismatched-family',
        tempoBpm: 90,
        bars: 4,
        playbackTransform: 'clear-practice',
      }),
    ).toThrow('compound-rock is not a pattern family for 3/4')
  })
})
