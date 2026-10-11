import { BEGINNER_PATTERN_DEFINITIONS } from '../audio/examples'
import { createGenerationRecipe } from '../audio/generationRecipe'
import { generateRhythm } from '../audio/generateRhythm'
import type { SupportedMeter } from '../audio/types'
import type { PracticeExercise } from './exercise'

export type { PracticeExercise } from './exercise'

export type PracticeMeter = SupportedMeter
export type PracticePhase = 'ready' | 'answered'

export interface PracticeSession {
  exercise: PracticeExercise
  phase: PracticePhase
  selectedMeter?: PracticeMeter
  isCorrect?: boolean
  exerciseNumber: number
}

export function createPracticeExercise(
  seed: string,
  previousExercise?: PracticeExercise,
  random: () => number = Math.random,
  meters: readonly PracticeMeter[] = ['3/4', '6/8'],
): PracticeExercise {
  const previousFamily =
    previousExercise?.playback.kind === 'procedural'
      ? previousExercise.playback.recipe.patternFamily
      : undefined
  const candidates = BEGINNER_PATTERN_DEFINITIONS.filter(
    (definition) =>
      definition.patternFamily !== previousFamily && meters.includes(definition.meter),
  )
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length))
  const definition = candidates[index]

  if (!definition) throw new Error('No beginner patterns are available.')

  const score = generateRhythm({
    meter: definition.meter,
    patternFamily: definition.patternFamily,
    seed,
    tempoBpm: definition.tempoBpm,
    bars: definition.bars,
  })

  return {
    id: `${definition.patternFamily}:${seed}`,
    meter: score.meter,
    grouping: score.grouping,
    difficulty: 'beginner',
    title: definition.title,
    explanation: definition.listeningCue,
    verification: {
      status: 'reviewed',
      method: 'deterministic generator rules and manual listening',
      notes: 'Structural accents remain stable while seeded ornaments may vary.',
    },
    playback: {
      kind: 'procedural',
      recipe: createGenerationRecipe(score, 'full-groove'),
    },
  }
}

export function createPracticeSession(exercise: PracticeExercise): PracticeSession {
  return { exercise, phase: 'ready', exerciseNumber: 1 }
}

export function selectMeter(
  session: PracticeSession,
  meter: PracticeMeter,
): PracticeSession {
  if (session.phase === 'answered') return session
  return { ...session, selectedMeter: meter }
}

export function submitAnswer(session: PracticeSession): PracticeSession {
  if (session.phase === 'answered' || !session.selectedMeter) return session

  return {
    ...session,
    phase: 'answered',
    isCorrect: session.selectedMeter === session.exercise.meter,
  }
}

export function advanceExercise(
  session: PracticeSession,
  exercise: PracticeExercise,
): PracticeSession {
  return {
    exercise,
    phase: 'ready',
    exerciseNumber: session.exerciseNumber + 1,
  }
}
