import { generateRhythm } from './generateRhythm'
import { createAccentedReplayScore, createClearPracticeScore } from './teachingScores'
import type { BeatUnit, PatternFamily, RhythmScore, SupportedMeter } from './types'

export type PlaybackTransform = 'clear-practice' | 'full-groove' | 'accented-replay'

export const SUPPORTED_METERS: readonly SupportedMeter[] = ['2/4', '3/4', '4/4', '6/8']
export const PLAYBACK_TRANSFORMS: readonly PlaybackTransform[] = [
  'clear-practice',
  'full-groove',
  'accented-replay',
]

export interface GenerationRecipe {
  meter: SupportedMeter
  grouping: string
  patternFamily: PatternFamily
  seed: string
  tempoBpm: number
  tempoBeatUnit: BeatUnit
  bars: number
  playbackTransform: PlaybackTransform
}
export function createGenerationRecipe(
  score: RhythmScore,
  playbackTransform: PlaybackTransform,
): GenerationRecipe {
  return {
    meter: score.meter,
    grouping: score.grouping,
    patternFamily: score.patternFamily,
    seed: score.seed,
    tempoBpm: score.tempoBpm,
    tempoBeatUnit: score.tempoBeatUnit,
    bars: score.bars,
    playbackTransform,
  }
}

/** Reconstructs the untransformed score from the recipe's generation inputs. */
export function regenerateFromRecipe(recipe: GenerationRecipe): RhythmScore {
  return generateRhythm({
    meter: recipe.meter,
    patternFamily: recipe.patternFamily,
    seed: recipe.seed,
    tempoBpm: recipe.tempoBpm,
    bars: recipe.bars,
  })
}

export function renderRecipeScore(recipe: GenerationRecipe): RhythmScore {
  const score = regenerateFromRecipe(recipe)

  switch (recipe.playbackTransform) {
    case 'clear-practice':
      return createClearPracticeScore(score)
    case 'accented-replay':
      return createAccentedReplayScore(score)
    case 'full-groove':
      return score
  }
}

/** Validates imported JSON and derives display-only fields from the generated score. */
export function normalizeGenerationRecipe(value: unknown): GenerationRecipe {
  if (!value || typeof value !== 'object') {
    throw new TypeError('Recipe must be a JSON object.')
  }

  const input = value as Record<string, unknown>
  if (!SUPPORTED_METERS.includes(input.meter as SupportedMeter)) {
    throw new RangeError('Choose a supported meter.')
  }
  if (!PLAYBACK_TRANSFORMS.includes(input.playbackTransform as PlaybackTransform)) {
    throw new RangeError('Choose a supported playback transformation.')
  }
  if (typeof input.patternFamily !== 'string' || input.patternFamily.trim() === '') {
    throw new TypeError('Pattern family must be a non-empty string.')
  }
  if (typeof input.seed !== 'string' || input.seed.trim() === '') {
    throw new TypeError('Seed must be a non-empty string.')
  }
  if (typeof input.tempoBpm !== 'number') {
    throw new TypeError('Tempo must be a number.')
  }
  if (typeof input.bars !== 'number') {
    throw new TypeError('Bars must be a number.')
  }

  const score = generateRhythm({
    meter: input.meter as SupportedMeter,
    patternFamily: input.patternFamily as PatternFamily,
    seed: input.seed.trim(),
    tempoBpm: input.tempoBpm,
    bars: input.bars,
  })

  return createGenerationRecipe(score, input.playbackTransform as PlaybackTransform)
}

export function serializeGenerationRecipe(recipe: GenerationRecipe): string {
  return JSON.stringify(recipe, null, 2)
}
