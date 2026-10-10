export type SupportedMeter = '2/4' | '3/4' | '4/4' | '6/8'

export type BeatUnit = 'quarter' | 'dotted-quarter'

export type Instrument = 'kick' | 'snare' | 'closed-hat' | 'bass' | 'accent-click'

export type EventRole = 'downbeat' | 'beat' | 'subdivision' | 'ornament'

export type PatternFamily =
  | 'duple-groove'
  | 'waltz-bass'
  | 'flowing-three'
  | 'light-waltz'
  | 'three-beat-rock'
  | 'common-time-groove'
  | 'compound-rock'
  | 'rolling-six'
  | 'compound-folk'
  | 'six-eight-drive'

export interface RhythmEvent {
  /** Integer position on the score's smallest subdivision grid. */
  step: number
  durationSteps: number
  instrument: Instrument
  velocity: number
  role: EventRole
  /** MIDI note number; currently used only by pitched instruments. */
  pitch?: number
}
export interface RhythmScore {
  meter: SupportedMeter
  grouping: string
  tempoBpm: number
  tempoBeatUnit: BeatUnit
  beatsPerBar: number
  stepsPerBeat: number
  bars: number
  seed: string
  patternFamily: PatternFamily
  events: RhythmEvent[]
}

export interface GenerateRhythmOptions {
  meter: SupportedMeter
  seed: string
  bars?: number
  tempoBpm?: number
  patternFamily?: PatternFamily
}
