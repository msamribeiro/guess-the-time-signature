import { generateRhythm } from './generateRhythm'
import type { PatternFamily, RhythmScore, SupportedMeter } from './types'

export interface AudioExample {
  title: string
  listeningCue: string
  score: RhythmScore
}

export interface PatternDefinition {
  meter: SupportedMeter
  patternFamily: PatternFamily
  seed: string
  tempoBpm: number
  title: string
  listeningCue: string
}

export const BEGINNER_PATTERN_DEFINITIONS: PatternDefinition[] = [
  {
    meter: '3/4',
    patternFamily: 'waltz-bass',
    seed: 'waltz-bass-01',
    tempoBpm: 104,
    title: 'Waltz bass',
    listeningCue: 'Hear one strong beat followed by two lighter quarter-note beats.',
  },
  {
    meter: '3/4',
    patternFamily: 'flowing-three',
    seed: 'flowing-three-01',
    tempoBpm: 96,
    title: 'Flowing three',
    listeningCue: 'Follow the bass through three beats before the downbeat returns.',
  },
  {
    meter: '3/4',
    patternFamily: 'light-waltz',
    seed: 'light-waltz-01',
    tempoBpm: 88,
    title: 'Light waltz',
    listeningCue: 'Hear the gentle cycle of three: a grounded first beat and two lighter beats.',
  },
  {
    meter: '3/4',
    patternFamily: 'three-beat-rock',
    seed: 'three-beat-rock-01',
    tempoBpm: 112,
    title: 'Three-beat rock',
    listeningCue: 'Track three firm quarter-note beats before the strong downbeat returns.',
  },
  {
    meter: '6/8',
    patternFamily: 'compound-rock',
    seed: 'compound-rock-01',
    tempoBpm: 80,
    title: 'Compound rock',
    listeningCue: 'Hear two main beats, each containing three hi-hat subdivisions.',
  },
  {
    meter: '6/8',
    patternFamily: 'rolling-six',
    seed: 'rolling-six-01',
    tempoBpm: 92,
    title: 'Rolling six',
    listeningCue: 'Count the six pulses as two groups: ONE-two-three, FOUR-five-six.',
  },
  {
    meter: '6/8',
    patternFamily: 'compound-folk',
    seed: 'compound-folk-01',
    tempoBpm: 72,
    title: 'Compound folk',
    listeningCue: 'Let each broad beat carry three smaller pulses before the next one begins.',
  },
  {
    meter: '6/8',
    patternFamily: 'six-eight-drive',
    seed: 'six-eight-drive-01',
    tempoBpm: 104,
    title: 'Six-eight drive',
    listeningCue: 'Hear a quick two-beat cycle, with each beat divided into three.',
  },
]

export const AUDIO_EXAMPLES: AudioExample[] = BEGINNER_PATTERN_DEFINITIONS.map((definition) => ({
  title: definition.title,
  listeningCue: definition.listeningCue,
  score: generateRhythm({
    meter: definition.meter,
    patternFamily: definition.patternFamily,
    seed: definition.seed,
    tempoBpm: definition.tempoBpm,
  }),
}))
