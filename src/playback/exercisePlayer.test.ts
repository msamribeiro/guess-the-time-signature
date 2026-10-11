import { describe, expect, it, vi } from 'vitest'
import type { ExercisePlaybackAdapter } from './exercisePlayer'
import { ExercisePlayer, ProceduralPlaybackAdapter } from './exercisePlayer'
import { createPracticeExercise } from '../practice/practiceSession'
import type { PracticeExercise } from '../practice/exercise'

function curatedExercise(): PracticeExercise {
  return {
    id: 'curated-test',
    meter: '6/8',
    grouping: '3+3',
    difficulty: 'beginner',
    title: 'Curated test clip',
    explanation: 'Two beats divided into three.',
    verification: {
      status: 'verified',
      method: 'manual review',
    },
    playback: {
      kind: 'curated',
      assetPath: 'audio/test.ogg',
      durationSeconds: 10,
    },
  }
}

describe('exercise player', () => {
  it('routes playback by source kind without exposing source logic to the caller', async () => {
    const adapter: ExercisePlaybackAdapter = {
      kind: 'curated',
      play: vi.fn().mockResolvedValue(10),
      stop: vi.fn(),
      close: vi.fn().mockResolvedValue(undefined),
    }
    const player = new ExercisePlayer([adapter])
    const exercise = curatedExercise()

    await expect(player.play(exercise, 'full-groove')).resolves.toBe(10)
    expect(adapter.play).toHaveBeenCalledWith(exercise.playback, 'full-groove', undefined)
  })

  it('fails with a useful message when a source has no registered adapter', () => {
    const player = new ExercisePlayer([])
    expect(() => player.play(curatedExercise(), 'full-groove')).toThrow(
      'No playback adapter is registered for curated exercises.',
    )
  })

  it('lets the procedural adapter apply a requested teaching transform', async () => {
    const play = vi.fn().mockResolvedValue(4)
    const adapter = new ProceduralPlaybackAdapter({
      play,
      stop: vi.fn(),
      close: vi.fn().mockResolvedValue(undefined),
    })
    const exercise = createPracticeExercise('adapter-transform', undefined, () => 0)
    if (exercise.playback.kind !== 'procedural') throw new Error('Expected procedural audio.')

    await adapter.play(exercise.playback, 'clear-practice')

    const renderedScore = play.mock.calls[0]?.[0]
    expect(renderedScore.events.some((event: { instrument: string }) => event.instrument === 'bass')).toBe(
      false,
    )
  })
})
