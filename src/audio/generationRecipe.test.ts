import { describe, expect, it } from 'vitest'
import { AUDIO_EXAMPLES } from './examples'
import {
  createGenerationRecipe,
  regenerateFromRecipe,
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
})
