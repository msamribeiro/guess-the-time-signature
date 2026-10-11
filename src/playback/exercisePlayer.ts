import { renderRecipeScore, WebAudioRenderer } from '../audio'
import type { PlaybackTransform, RhythmScore } from '../audio'
import type { ExercisePlayback, PracticeExercise } from '../practice/exercise'

export interface ExercisePlaybackAdapter {
  readonly kind: ExercisePlayback['kind']
  play(
    playback: ExercisePlayback,
    transform: PlaybackTransform,
    onEnded?: () => void,
  ): Promise<number>
  stop(): void
  close(): Promise<void>
}

interface ScoreRenderer {
  play(score: RhythmScore, onEnded?: () => void): Promise<number>
  stop(): void
  close(): Promise<void>
}

export class ProceduralPlaybackAdapter implements ExercisePlaybackAdapter {
  readonly kind = 'procedural'

  constructor(private readonly renderer: ScoreRenderer = new WebAudioRenderer()) {}

  play(
    playback: ExercisePlayback,
    transform: PlaybackTransform,
    onEnded?: () => void,
  ): Promise<number> {
    if (playback.kind !== this.kind) {
      throw new TypeError(`The procedural adapter cannot play ${playback.kind} audio.`)
    }

    const score = renderRecipeScore({ ...playback.recipe, playbackTransform: transform })
    return this.renderer.play(score, onEnded)
  }

  stop(): void {
    this.renderer.stop()
  }

  close(): Promise<void> {
    return this.renderer.close()
  }
}

export class ExercisePlayer {
  constructor(private readonly adapters: readonly ExercisePlaybackAdapter[]) {}

  play(
    exercise: PracticeExercise,
    transform: PlaybackTransform,
    onEnded?: () => void,
  ): Promise<number> {
    this.stop()
    const adapter = this.adapters.find((candidate) => candidate.kind === exercise.playback.kind)
    if (!adapter) {
      throw new Error(`No playback adapter is registered for ${exercise.playback.kind} exercises.`)
    }
    return adapter.play(exercise.playback, transform, onEnded)
  }

  stop(): void {
    for (const adapter of this.adapters) adapter.stop()
  }

  async close(): Promise<void> {
    await Promise.all(this.adapters.map((adapter) => adapter.close()))
  }
}
