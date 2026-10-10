import { BEGINNER_PATTERN_DEFINITIONS } from '../audio/examples'
import { generateRhythm } from '../audio/generateRhythm'
import type { PatternFamily, RhythmScore, SupportedMeter } from '../audio/types'

export type PracticeMeter = SupportedMeter
export type PracticePhase = 'ready' | 'answered'

export interface PracticeExercise {
  id: string
  source: 'procedural'
  title: string
  listeningCue: string
  score: RhythmScore
}
export interface PracticeSession {
  exercise: PracticeExercise
  phase: PracticePhase
  selectedMeter?: PracticeMeter
  isCorrect?: boolean
  exerciseNumber: number
}

export function createPracticeExercise(
  seed: string,
  previousFamily?: PatternFamily,
  random: () => number = Math.random,
  meters: readonly PracticeMeter[] = ['3/4', '6/8'],
): PracticeExercise {
  const candidates = BEGINNER_PATTERN_DEFINITIONS.filter(
    (definition) =>
      definition.patternFamily !== previousFamily && meters.includes(definition.meter),
  )
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length))
  const definition = candidates[index]

  if (!definition) throw new Error('No beginner patterns are available.')

  return {
    id: `${definition.patternFamily}:${seed}`,
    source: 'procedural',
    title: definition.title,
    listeningCue: definition.listeningCue,
    score: generateRhythm({
      meter: definition.meter,
      patternFamily: definition.patternFamily,
      seed,
      tempoBpm: definition.tempoBpm,
      bars: definition.bars,
    }),
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
    isCorrect: session.selectedMeter === session.exercise.score.meter,
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
