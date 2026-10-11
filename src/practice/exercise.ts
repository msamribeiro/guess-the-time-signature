import type { GenerationRecipe, PlaybackTransform, SupportedMeter } from '../audio'

export type ExerciseDifficulty = 'beginner'

export interface ExerciseVerification {
  status: 'reviewed' | 'verified'
  method: string
  notes?: string
}

export interface ProceduralPlayback {
  kind: 'procedural'
  recipe: GenerationRecipe
}

export interface CuratedPlayback {
  kind: 'curated'
  assetPath: string
  durationSeconds: number
}

export type ExercisePlayback = ProceduralPlayback | CuratedPlayback

export interface PracticeExercise {
  id: string
  meter: SupportedMeter
  grouping: string
  difficulty: ExerciseDifficulty
  title: string
  explanation: string
  verification: ExerciseVerification
  playback: ExercisePlayback
}

export function generationRecipeFor(
  exercise: PracticeExercise,
  playbackTransform: PlaybackTransform,
): GenerationRecipe | undefined {
  if (exercise.playback.kind !== 'procedural') return undefined
  return { ...exercise.playback.recipe, playbackTransform }
}
