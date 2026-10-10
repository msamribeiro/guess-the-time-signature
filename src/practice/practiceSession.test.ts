import { describe, expect, it } from 'vitest'
import {
  advanceExercise,
  createPracticeExercise,
  createPracticeSession,
  selectMeter,
  submitAnswer,
} from './practiceSession'
import { BEGINNER_PATTERN_DEFINITIONS } from '../audio/examples'

describe('practice session', () => {
  it('keeps the answer absent until submission', () => {
    const exercise = createPracticeExercise('hidden', undefined, () => 0)
    const ready = createPracticeSession(exercise)
    const selected = selectMeter(ready, '3/4')

    expect(ready.phase).toBe('ready')
    expect(ready.isCorrect).toBeUndefined()
    expect(selected.phase).toBe('ready')
    expect(selected.isCorrect).toBeUndefined()
  })

  it('reveals whether the submitted answer matches the intended meter', () => {
    const exercise = createPracticeExercise('answer', undefined, () => 0)
    const answered = submitAnswer(selectMeter(createPracticeSession(exercise), '3/4'))

    expect(exercise.score.meter).toBe('3/4')
    expect(answered).toMatchObject({ phase: 'answered', isCorrect: true })
  })

  it('does not submit without a selection or change an answered selection', () => {
    const initial = createPracticeSession(createPracticeExercise('guarded', undefined, () => 0))
    expect(submitAnswer(initial)).toBe(initial)

    const answered = submitAnswer(selectMeter(initial, '6/8'))
    expect(selectMeter(answered, '3/4')).toBe(answered)
  })

  it('avoids repeating the same pattern family immediately', () => {
    const first = createPracticeExercise('first', undefined, () => 0)
    const second = createPracticeExercise('second', first.score.patternFamily, () => 0)

    expect(second.score.patternFamily).not.toBe(first.score.patternFamily)
  })

  it('clears the answer and increments the exercise number on advance', () => {
    const first = createPracticeExercise('first', undefined, () => 0)
    const answered = submitAnswer(selectMeter(createPracticeSession(first), '3/4'))
    const second = createPracticeExercise('second', first.score.patternFamily, () => 0.9)
    const advanced = advanceExercise(answered, second)

    expect(advanced).toMatchObject({ phase: 'ready', exerciseNumber: 2 })
    expect(advanced.selectedMeter).toBeUndefined()
    expect(advanced.isCorrect).toBeUndefined()
  })

  it('offers a balanced library with several tempos and families per meter', () => {
    const threeFour = BEGINNER_PATTERN_DEFINITIONS.filter(
      (definition) => definition.meter === '3/4',
    )
    const sixEight = BEGINNER_PATTERN_DEFINITIONS.filter(
      (definition) => definition.meter === '6/8',
    )

    expect(threeFour).toHaveLength(4)
    expect(sixEight).toHaveLength(4)
    expect(new Set(threeFour.map((definition) => definition.tempoBpm)).size).toBeGreaterThan(1)
    expect(new Set(sixEight.map((definition) => definition.tempoBpm)).size).toBeGreaterThan(1)
  })
})
