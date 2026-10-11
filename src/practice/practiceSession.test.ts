import { describe, expect, it } from 'vitest'
import {
  advanceExercise,
  createPracticeExercise,
  createPracticeSession,
  selectMeter,
  submitAnswer,
} from './practiceSession'
import { BEGINNER_PATTERN_DEFINITIONS } from '../audio/examples'
import type { PracticeExercise } from './exercise'

function proceduralFamily(exercise: PracticeExercise) {
  if (exercise.playback.kind !== 'procedural') throw new Error('Expected a procedural exercise.')
  return exercise.playback.recipe.patternFamily
}

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

    expect(exercise.meter).toBe('3/4')
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
    const second = createPracticeExercise('second', first, () => 0)

    expect(proceduralFamily(second)).not.toBe(proceduralFamily(first))
  })

  it('clears the answer and increments the exercise number on advance', () => {
    const first = createPracticeExercise('first', undefined, () => 0)
    const answered = submitAnswer(selectMeter(createPracticeSession(first), '3/4'))
    const second = createPracticeExercise('second', first, () => 0.9)
    const advanced = advanceExercise(answered, second)

    expect(advanced).toMatchObject({ phase: 'ready', exerciseNumber: 2 })
    expect(advanced.selectedMeter).toBeUndefined()
    expect(advanced.isCorrect).toBeUndefined()
  })

  it('offers a balanced library with several tempos and families per meter', () => {
    const twoFour = BEGINNER_PATTERN_DEFINITIONS.filter(
      (definition) => definition.meter === '2/4',
    )
    const threeFour = BEGINNER_PATTERN_DEFINITIONS.filter(
      (definition) => definition.meter === '3/4',
    )
    const fourFour = BEGINNER_PATTERN_DEFINITIONS.filter(
      (definition) => definition.meter === '4/4',
    )
    const sixEight = BEGINNER_PATTERN_DEFINITIONS.filter(
      (definition) => definition.meter === '6/8',
    )

    expect(twoFour).toHaveLength(4)
    expect(threeFour).toHaveLength(4)
    expect(fourFour).toHaveLength(4)
    expect(sixEight).toHaveLength(4)
    expect(new Set(threeFour.map((definition) => definition.tempoBpm)).size).toBeGreaterThan(1)
    expect(new Set(sixEight.map((definition) => definition.tempoBpm)).size).toBeGreaterThan(1)
    expect(twoFour.every((definition) => definition.bars * 2 === 16)).toBe(true)
    expect(fourFour.every((definition) => definition.bars * 4 === 16)).toBe(true)
  })

  it('selects exercises only from the active meter set', () => {
    const first = createPracticeExercise('two-four', undefined, () => 0, ['2/4', '4/4'])
    const last = createPracticeExercise('four-four', undefined, () => 0.999, ['2/4', '4/4'])

    expect(['2/4', '4/4']).toContain(first.meter)
    expect(['2/4', '4/4']).toContain(last.meter)
    expect(['3/4', '6/8']).not.toContain(first.meter)
    expect(['3/4', '6/8']).not.toContain(last.meter)
  })

  it('supports custom comparisons that were not predefined lessons', () => {
    const first = createPracticeExercise('two-six', undefined, () => 0, ['2/4', '6/8'])
    const last = createPracticeExercise('six-two', undefined, () => 0.999, ['2/4', '6/8'])

    expect(new Set([first.meter, last.meter])).toEqual(new Set(['2/4', '6/8']))
  })

  it('answers a curated exercise through the same session state', () => {
    const exercise: PracticeExercise = {
      id: 'curated-6-8-001',
      meter: '6/8',
      grouping: '3+3',
      difficulty: 'beginner',
      title: 'Verified compound groove',
      explanation: 'Two broad beats, each divided into three.',
      verification: {
        status: 'verified',
        method: 'manual count and downbeat review',
      },
      playback: {
        kind: 'curated',
        assetPath: 'audio/curated-6-8-001.ogg',
        durationSeconds: 12,
      },
    }

    const answered = submitAnswer(selectMeter(createPracticeSession(exercise), '6/8'))
    expect(answered).toMatchObject({ phase: 'answered', isCorrect: true })
  })
})
