import type { PracticeExercise } from './exercise'
import { createPracticeExercise, type PracticeMeter } from './practiceSession'

export type PracticeMode = 'learn' | 'clear' | 'groove'
export type PracticeRunPhase = 'ready' | 'answered' | 'complete'

export interface PracticePlan {
  meters: readonly PracticeMeter[]
  mode: PracticeMode
  exerciseCount: number
}

export interface ExerciseResult {
  exerciseId: string
  meter: PracticeMeter
  selectedMeter?: PracticeMeter
  isCorrect?: boolean
}

export interface PracticeRun {
  plan: PracticePlan
  exercises: readonly PracticeExercise[]
  currentIndex: number
  phase: PracticeRunPhase
  selectedMeter?: PracticeMeter
  isCorrect?: boolean
  results: readonly ExerciseResult[]
}

export interface MeterResultSummary {
  meter: PracticeMeter
  completed: number
  attempted: number
  correct: number
  accuracyPercentage?: number
}

export interface PracticeSummary {
  completed: number
  attempted: number
  correct: number
  accuracyPercentage?: number
  byMeter: readonly MeterResultSummary[]
}

export function validatePracticePlan(plan: PracticePlan): string | undefined {
  if (plan.meters.length === 0) return 'Choose at least one time signature.'
  if (new Set(plan.meters).size !== plan.meters.length) {
    return 'Choose each time signature only once.'
  }
  if (plan.mode !== 'learn' && plan.meters.length < 2) {
    return 'Clear and Groove sessions need at least two time signatures.'
  }
  if (!Number.isInteger(plan.exerciseCount) || plan.exerciseCount < 1 || plan.exerciseCount > 100) {
    return 'Choose between 1 and 100 exercises.'
  }
  return undefined
}

export function createExerciseQueue(
  plan: PracticePlan,
  seedPrefix: string,
  random: () => number = Math.random,
): PracticeExercise[] {
  const validationError = validatePracticePlan(plan)
  if (validationError) throw new RangeError(validationError)

  const meterSchedule = Array.from(
    { length: plan.exerciseCount },
    (_, index) => plan.meters[index % plan.meters.length]!,
  )

  for (let index = meterSchedule.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = meterSchedule[index]!
    meterSchedule[index] = meterSchedule[swapIndex]!
    meterSchedule[swapIndex] = current
  }

  let previousExercise: PracticeExercise | undefined
  return meterSchedule.map((meter, index) => {
    const exercise = createPracticeExercise(
      `${seedPrefix}-${index + 1}`,
      previousExercise,
      random,
      [meter],
    )
    previousExercise = exercise
    return exercise
  })
}

export function createPracticeRun(
  plan: PracticePlan,
  seedPrefix: string,
  random: () => number = Math.random,
): PracticeRun {
  return {
    plan: { ...plan, meters: [...plan.meters] },
    exercises: createExerciseQueue(plan, seedPrefix, random),
    currentIndex: 0,
    phase: 'ready',
    results: [],
  }
}

export function currentExercise(run: PracticeRun): PracticeExercise | undefined {
  return run.phase === 'complete' ? undefined : run.exercises[run.currentIndex]
}

export function selectRunMeter(run: PracticeRun, meter: PracticeMeter): PracticeRun {
  if (run.plan.mode === 'learn' || run.phase !== 'ready' || !run.plan.meters.includes(meter)) {
    return run
  }
  return { ...run, selectedMeter: meter }
}

export function submitRunAnswer(run: PracticeRun): PracticeRun {
  if (run.plan.mode === 'learn' || run.phase !== 'ready' || !run.selectedMeter) return run
  const exercise = currentExercise(run)
  if (!exercise) return run
  return {
    ...run,
    phase: 'answered',
    isCorrect: run.selectedMeter === exercise.meter,
  }
}

export function advancePracticeRun(run: PracticeRun): PracticeRun {
  if (run.phase === 'complete') return run
  if (run.plan.mode !== 'learn' && run.phase !== 'answered') return run

  const exercise = currentExercise(run)
  if (!exercise) return run
  const result: ExerciseResult = {
    exerciseId: exercise.id,
    meter: exercise.meter,
    selectedMeter: run.selectedMeter,
    isCorrect: run.isCorrect,
  }
  const results = [...run.results, result]

  if (run.currentIndex === run.exercises.length - 1) {
    return {
      ...run,
      phase: 'complete',
      selectedMeter: undefined,
      isCorrect: undefined,
      results,
    }
  }

  return {
    ...run,
    currentIndex: run.currentIndex + 1,
    phase: 'ready',
    selectedMeter: undefined,
    isCorrect: undefined,
    results,
  }
}

export function summarizePracticeRun(run: PracticeRun): PracticeSummary {
  const scoredResults = run.results.filter((result) => result.isCorrect !== undefined)
  const correct = scoredResults.filter((result) => result.isCorrect).length
  const attempted = scoredResults.length

  return {
    completed: run.results.length,
    attempted,
    correct,
    accuracyPercentage: attempted > 0 ? Math.round((correct / attempted) * 100) : undefined,
    byMeter: run.plan.meters.map((meter) => {
      const results = run.results.filter((result) => result.meter === meter)
      const scored = results.filter((result) => result.isCorrect !== undefined)
      const meterCorrect = scored.filter((result) => result.isCorrect).length
      return {
        meter,
        completed: results.length,
        attempted: scored.length,
        correct: meterCorrect,
        accuracyPercentage:
          scored.length > 0 ? Math.round((meterCorrect / scored.length) * 100) : undefined,
      }
    }),
  }
}
