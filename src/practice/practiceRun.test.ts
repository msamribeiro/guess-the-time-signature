import { describe, expect, it } from 'vitest'
import {
  advancePracticeRun,
  createPracticeRun,
  currentExercise,
  selectRunMeter,
  submitRunAnswer,
  summarizePracticeRun,
  validatePracticePlan,
  type PracticePlan,
} from './practiceRun'

describe('practice run', () => {
  it('allows one meter for Learn but requires two for scored modes', () => {
    expect(validatePracticePlan({ meters: ['4/4'], mode: 'learn', exerciseCount: 5 })).toBeUndefined()
    expect(validatePracticePlan({ meters: ['4/4'], mode: 'groove', exerciseCount: 5 })).toContain(
      'at least two',
    )
  })

  it('creates a balanced finite queue across selected meters', () => {
    const plan: PracticePlan = {
      meters: ['2/4', '3/4', '4/4', '6/8'],
      mode: 'clear',
      exerciseCount: 10,
    }
    const run = createPracticeRun(plan, 'balanced', () => 0.4)
    const counts = new Map<string, number>()
    for (const exercise of run.exercises) {
      counts.set(exercise.meter, (counts.get(exercise.meter) ?? 0) + 1)
    }

    expect(run.exercises).toHaveLength(10)
    expect(Math.max(...counts.values()) - Math.min(...counts.values())).toBeLessThanOrEqual(1)
  })

  it('records answers and completes after the configured exercise count', () => {
    let run = createPracticeRun(
      { meters: ['3/4', '6/8'], mode: 'clear', exerciseCount: 2 },
      'finite',
      () => 0,
    )

    const first = currentExercise(run)!
    run = submitRunAnswer(selectRunMeter(run, first.meter))
    run = advancePracticeRun(run)
    const second = currentExercise(run)!
    run = submitRunAnswer(selectRunMeter(run, second.meter === '3/4' ? '6/8' : '3/4'))
    run = advancePracticeRun(run)

    expect(run.phase).toBe('complete')
    expect(summarizePracticeRun(run)).toMatchObject({
      completed: 2,
      attempted: 2,
      correct: 1,
      accuracyPercentage: 50,
    })
  })

  it('completes Learn exercises without fabricating an accuracy score', () => {
    let run = createPracticeRun(
      { meters: ['4/4'], mode: 'learn', exerciseCount: 1 },
      'learn-only',
      () => 0,
    )
    run = advancePracticeRun(run)

    expect(run.phase).toBe('complete')
    expect(summarizePracticeRun(run)).toMatchObject({
      completed: 1,
      attempted: 0,
      correct: 0,
      accuracyPercentage: undefined,
    })
  })
})
