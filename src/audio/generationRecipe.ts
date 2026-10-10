import { generateRhythm } from './generateRhythm'
import type { BeatUnit, PatternFamily, RhythmScore, SupportedMeter } from './types'

export type PlaybackTransform = 'clear-practice' | 'full-groove'

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

export function serializeGenerationRecipe(recipe: GenerationRecipe): string {
  return JSON.stringify(recipe, null, 2)
}
