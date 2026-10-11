import type { PracticeMeter } from './practice/practiceSession'

export interface LessonMeter {
  meter: PracticeMeter
  title: string
  count: string
  countAriaLabel: string
  explanation: string
  answerLabel: string
}

export interface PracticeSetCopy {
  subtitle: string
  title: string
  introduction: string
  ambiguityNote?: string
}

export const METER_ORDER: readonly PracticeMeter[] = ['2/4', '3/4', '4/4', '6/8']

export const METER_GUIDES: Record<PracticeMeter, LessonMeter> = {
  '2/4': {
    meter: '2/4',
    title: 'Two-beat units',
    count: 'ONE &  TWO &  |  ONE &  TWO &',
    countAriaLabel: 'Count: one and two and, one and two and',
    explanation: 'Notice the strong–weak pair restarting every two quarter-note beats.',
    answerLabel: 'Downbeat every two beats',
  },
  '3/4': {
    meter: '3/4',
    title: 'Three beats of two',
    count: 'ONE &  TWO &  THREE &',
    countAriaLabel: 'Count: one and two and three and',
    explanation: 'Notice three evenly spaced main beats before the downbeat returns.',
    answerLabel: 'Three beats of two',
  },
  '4/4': {
    meter: '4/4',
    title: 'One four-beat cycle',
    count: 'ONE &  TWO &  THREE &  FOUR &',
    countAriaLabel: 'Count: one and two and three and four and',
    explanation:
      'Notice one strong opening beat, a secondary anchor on beat three, and the full return after four beats.',
    answerLabel: 'Larger four-beat cycle',
  },
  '6/8': {
    meter: '6/8',
    title: 'Two beats of three',
    count: 'ONE two three  FOUR five six',
    countAriaLabel: 'Count: one two three four five six',
    explanation: 'Notice two broad main beats, each filled by three quicker pulses.',
    answerLabel: 'Two beats of three',
  },
}

function hasExactMeters(meters: readonly PracticeMeter[], expected: readonly PracticeMeter[]) {
  return meters.length === expected.length && expected.every((meter) => meters.includes(meter))
}

export function practiceSetCopy(meters: readonly PracticeMeter[]): PracticeSetCopy {
  if (hasExactMeters(meters, ['3/4', '6/8'])) {
    return {
      subtitle: 'Three against six',
      title: 'Hear how six pulses can divide.',
      introduction:
        'The same six eighth notes can feel like three beats of two or two beats of three. Start with the labels visible and listen for where each main beat begins.',
    }
  }

  if (hasExactMeters(meters, ['2/4', '4/4'])) {
    return {
      subtitle: 'Two against four',
      title: 'Hear where the larger cycle returns.',
      introduction:
        'Both meters use quarter-note beats. Listen across the whole phrase for whether the strongest downbeat returns after two beats or after a larger four-beat cycle.',
      ambiguityNote:
        'Short passages can reasonably support either 2/4 or 4/4. These exercises use phrase-level accents to establish the intended hearing.',
    }
  }

  const ambiguityNotes: string[] = []
  if (meters.includes('2/4') && meters.includes('4/4')) {
    ambiguityNotes.push(
      'Short passages can reasonably support either 2/4 or 4/4; phrase-level accents establish the intended hearing here.',
    )
  }
  if (meters.includes('3/4') && meters.includes('6/8')) {
    ambiguityNotes.push(
      '3/4 and 6/8 contain the same number of eighth-note pulses but group them differently.',
    )
  }

  return {
    subtitle: meters.join(' · '),
    title: 'Learn the selected meters.',
    introduction:
      'Listen to each labeled example, then practice identifying any of the selected signatures from its pulse, subdivision, and larger cycle.',
    ambiguityNote: ambiguityNotes.length > 0 ? ambiguityNotes.join(' ') : undefined,
  }
}
