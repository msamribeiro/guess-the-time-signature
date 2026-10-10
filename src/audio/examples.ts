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
  bars: number
  title: string
  listeningCue: string
}

export const BEGINNER_PATTERN_DEFINITIONS: PatternDefinition[] = [
  {
    meter: '3/4',
    patternFamily: 'waltz-bass',
    seed: 'waltz-bass-01',
    tempoBpm: 104,
    bars: 4,
    title: 'Waltz bass',
    listeningCue: 'Hear one strong beat followed by two lighter quarter-note beats.',
  },
  {
    meter: '3/4',
    patternFamily: 'flowing-three',
    seed: 'flowing-three-01',
    tempoBpm: 96,
    bars: 4,
    title: 'Flowing three',
    listeningCue: 'Follow the bass through three beats before the downbeat returns.',
  },
  {
    meter: '3/4',
    patternFamily: 'light-waltz',
    seed: 'light-waltz-01',
    tempoBpm: 88,
    bars: 4,
    title: 'Light waltz',
    listeningCue: 'Hear the gentle cycle of three: a grounded first beat and two lighter beats.',
  },
  {
    meter: '3/4',
    patternFamily: 'three-beat-rock',
    seed: 'three-beat-rock-01',
    tempoBpm: 112,
    bars: 4,
    title: 'Three-beat rock',
    listeningCue: 'Track three firm quarter-note beats before the strong downbeat returns.',
  },
  {
    meter: '6/8',
    patternFamily: 'compound-rock',
    seed: 'compound-rock-01',
    tempoBpm: 80,
    bars: 4,
    title: 'Compound rock',
    listeningCue: 'Hear two main beats, each containing three hi-hat subdivisions.',
  },
  {
    meter: '6/8',
    patternFamily: 'rolling-six',
    seed: 'rolling-six-01',
    tempoBpm: 92,
    bars: 4,
    title: 'Rolling six',
    listeningCue: 'Count the six pulses as two groups: ONE-two-three, FOUR-five-six.',
  },
  {
    meter: '6/8',
    patternFamily: 'compound-folk',
    seed: 'compound-folk-01',
    tempoBpm: 72,
    bars: 4,
    title: 'Compound folk',
    listeningCue: 'Let each broad beat carry three smaller pulses before the next one begins.',
  },
  {
    meter: '6/8',
    patternFamily: 'six-eight-drive',
    seed: 'six-eight-drive-01',
    tempoBpm: 104,
    bars: 4,
    title: 'Six-eight drive',
    listeningCue: 'Hear a quick two-beat cycle, with each beat divided into three.',
  },
  {
    meter: '2/4',
    patternFamily: 'duple-groove',
    seed: 'duple-groove-01',
    tempoBpm: 96,
    bars: 8,
    title: 'Duple groove',
    listeningCue: 'Hear the strong beat return after every two quarter-note beats.',
  },
  {
    meter: '2/4',
    patternFamily: 'two-step',
    seed: 'two-step-01',
    tempoBpm: 104,
    bars: 8,
    title: 'Two-step',
    listeningCue: 'Follow the repeating strong–weak pair across the longer phrase.',
  },
  {
    meter: '2/4',
    patternFamily: 'quick-duple',
    seed: 'quick-duple-01',
    tempoBpm: 116,
    bars: 8,
    title: 'Quick duple',
    listeningCue: 'Feel each new downbeat arrive after only two quarter-note beats.',
  },
  {
    meter: '2/4',
    patternFamily: 'duple-march',
    seed: 'duple-march-01',
    tempoBpm: 88,
    bars: 8,
    title: 'Duple march',
    listeningCue: 'Listen for repeated two-beat units: strong–weak, strong–weak.',
  },
  {
    meter: '4/4',
    patternFamily: 'common-time-groove',
    seed: 'common-time-groove-01',
    tempoBpm: 96,
    bars: 4,
    title: 'Common-time groove',
    listeningCue: 'Hear one complete four-beat cycle, with beat three as a secondary anchor.',
  },
  {
    meter: '4/4',
    patternFamily: 'four-beat-rock',
    seed: 'four-beat-rock-01',
    tempoBpm: 104,
    bars: 4,
    title: 'Four-beat rock',
    listeningCue: 'Follow the kick and snare through four beats before the strongest return.',
  },
  {
    meter: '4/4',
    patternFamily: 'half-time-four',
    seed: 'half-time-four-01',
    tempoBpm: 84,
    bars: 4,
    title: 'Half-time four',
    listeningCue: 'Let the broad phrase span four quarter-note beats rather than resetting at two.',
  },
  {
    meter: '4/4',
    patternFamily: 'walking-four',
    seed: 'walking-four-01',
    tempoBpm: 112,
    bars: 4,
    title: 'Walking four',
    listeningCue: 'Track four bass steps, with the strongest emphasis at the start of the cycle.',
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
    bars: definition.bars,
  }),
}))
