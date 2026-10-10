import type { PracticeMeter } from './practice/practiceSession'

export type LessonId = 'three-vs-six' | 'two-vs-four'

export interface LessonMeter {
  meter: PracticeMeter
  title: string
  count: string
  countAriaLabel: string
  explanation: string
  answerLabel: string
}

export interface LessonDefinition {
  id: LessonId
  label: string
  subtitle: string
  title: string
  introduction: string
  meters: readonly [LessonMeter, LessonMeter]
  ambiguityNote?: string
}

export const LESSONS: Record<LessonId, LessonDefinition> = {
  'three-vs-six': {
    id: 'three-vs-six',
    label: '3/4 versus 6/8',
    subtitle: 'Three against six',
    title: 'Hear how six pulses can divide.',
    introduction:
      'The same six eighth notes can feel like three beats of two or two beats of three. Start with the labels visible and listen for where each main beat begins.',
    meters: [
      {
        meter: '3/4',
        title: 'Three beats of two',
        count: 'ONE &  TWO &  THREE &',
        countAriaLabel: 'Count: one and two and three and',
        explanation: 'Notice three evenly spaced main beats before the downbeat returns.',
        answerLabel: 'Three beats of two',
      },
      {
        meter: '6/8',
        title: 'Two beats of three',
        count: 'ONE two three  FOUR five six',
        countAriaLabel: 'Count: one two three four five six',
        explanation: 'Notice two broad main beats, each filled by three quicker pulses.',
        answerLabel: 'Two beats of three',
      },
    ],
  },
  'two-vs-four': {
    id: 'two-vs-four',
    label: '2/4 versus 4/4',
    subtitle: 'Two against four',
    title: 'Hear where the larger cycle returns.',
    introduction:
      'Both meters use quarter-note beats. Listen across the whole phrase for whether the strongest downbeat returns after two beats or after a larger four-beat cycle.',
    meters: [
      {
        meter: '2/4',
        title: 'Two-beat units',
        count: 'ONE &  TWO &  |  ONE &  TWO &',
        countAriaLabel: 'Count: one and two and, one and two and',
        explanation: 'Notice the strong–weak pair restarting every two quarter-note beats.',
        answerLabel: 'Downbeat every two beats',
      },
      {
        meter: '4/4',
        title: 'One four-beat cycle',
        count: 'ONE &  TWO &  THREE &  FOUR &',
        countAriaLabel: 'Count: one and two and three and four and',
        explanation:
          'Notice one strong opening beat, a secondary anchor on beat three, and the full return after four beats.',
        answerLabel: 'Larger four-beat cycle',
      },
    ],
    ambiguityNote:
      'Short passages can reasonably support either 2/4 or 4/4. These exercises use phrase-level accents to establish the intended hearing.',
  },
}

export const DEFAULT_LESSON_ID: LessonId = 'three-vs-six'
