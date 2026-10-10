import type { BeatUnit, SupportedMeter } from './types'

export interface MeterConfig {
  grouping: string
  beatsPerBar: number
  stepsPerBeat: number
  tempoBeatUnit: BeatUnit
  defaultTempoBpm: number
}
export const METER_CONFIG: Record<SupportedMeter, MeterConfig> = {
  '2/4': {
    grouping: '2',
    beatsPerBar: 2,
    stepsPerBeat: 2,
    tempoBeatUnit: 'quarter',
    defaultTempoBpm: 92,
  },
  '3/4': {
    grouping: '3',
    beatsPerBar: 3,
    stepsPerBeat: 2,
    tempoBeatUnit: 'quarter',
    defaultTempoBpm: 104,
  },
  '4/4': {
    grouping: '2+2',
    beatsPerBar: 4,
    stepsPerBeat: 2,
    tempoBeatUnit: 'quarter',
    defaultTempoBpm: 104,
  },
  '6/8': {
    grouping: '3+3',
    beatsPerBar: 2,
    stepsPerBeat: 3,
    tempoBeatUnit: 'dotted-quarter',
    defaultTempoBpm: 80,
  },
}
