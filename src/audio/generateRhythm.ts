import { METER_CONFIG } from './meterConfig'
import { createRandom } from './random'
import type {
  EventRole,
  GenerateRhythmOptions,
  Instrument,
  PatternFamily,
  RhythmEvent,
  RhythmScore,
  SupportedMeter,
} from './types'

const MIN_BARS = 1
const MAX_BARS = 16
const MIN_TEMPO_BPM = 40
const MAX_TEMPO_BPM = 220

const FAMILIES_BY_METER: Record<SupportedMeter, readonly PatternFamily[]> = {
  '2/4': ['duple-groove'],
  '3/4': ['waltz-bass', 'flowing-three', 'light-waltz', 'three-beat-rock'],
  '4/4': ['common-time-groove'],
  '6/8': ['compound-rock', 'rolling-six', 'compound-folk', 'six-eight-drive'],
}

interface PatternContext {
  bar: number
  start: number
  random: () => number
  add: (
    step: number,
    instrument: Instrument,
    velocity: number,
    role: EventRole,
    durationSteps?: number,
    pitch?: number,
  ) => void
}

function validateRange(name: string, value: number, min: number, max: number): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new RangeError(`${name} must be between ${min} and ${max}.`)
  }
}

function addHatGrid(context: PatternContext, velocities: readonly number[]): void {
  velocities.forEach((velocity, step) => {
    context.add(
      step,
      'closed-hat',
      velocity,
      step === 0 ? 'downbeat' : velocity >= 0.45 ? 'beat' : 'subdivision',
    )
  })
}

function composeBar(family: PatternFamily, context: PatternContext): void {
  const root = context.bar % 4 === 3 ? 43 : 36

  switch (family) {
    case 'duple-groove':
      addHatGrid(context, [0.72, 0.28, 0.5, 0.28])
      context.add(0, 'kick', 0.95, 'downbeat')
      context.add(2, 'snare', 0.72, 'beat')
      context.add(0, 'bass', 0.8, 'downbeat', 1.8, root)
      break

    case 'waltz-bass':
      addHatGrid(context, [0.72, 0.28, 0.52, 0.25, 0.5, 0.25])
      context.add(0, 'kick', 0.95, 'downbeat')
      context.add(2, 'snare', 0.48, 'beat')
      context.add(4, 'snare', 0.44, 'beat')
      context.add(0, 'bass', 0.82, 'downbeat', 1.8, root)
      context.add(2, 'bass', 0.46, 'beat', 1.5, 43)
      context.add(4, 'bass', 0.43, 'beat', 1.5, 43)
      if (context.random() > 0.62) context.add(5, 'snare', 0.2, 'ornament')
      break

    case 'flowing-three':
      addHatGrid(context, [0.7, 0.3, 0.48, 0.32, 0.46, 0.3])
      context.add(0, 'kick', 0.92, 'downbeat')
      context.add(2, 'snare', 0.38, 'beat')
      context.add(4, 'snare', 0.5, 'beat')
      context.add(0, 'bass', 0.78, 'downbeat', 1.7, root)
      context.add(2, 'bass', 0.5, 'beat', 1.7, context.bar % 2 === 0 ? 40 : 41)
      context.add(4, 'bass', 0.48, 'beat', 1.7, 43)
      break

    case 'light-waltz':
      addHatGrid(context, [0.68, 0.2, 0.48, 0.18, 0.46, 0.18])
      context.add(0, 'kick', 0.9, 'downbeat')
      context.add(2, 'snare', 0.4, 'beat')
      context.add(4, 'snare', 0.38, 'beat')
      context.add(0, 'bass', 0.75, 'downbeat', 1.6, root)
      context.add(2, 'bass', 0.42, 'beat', 1.2, context.bar % 2 === 0 ? 40 : 41)
      context.add(4, 'bass', 0.4, 'beat', 1.2, 43)
      if (context.random() > 0.58) context.add(5, 'snare', 0.16, 'ornament')
      break

    case 'three-beat-rock':
      addHatGrid(context, [0.76, 0.3, 0.52, 0.28, 0.5, 0.28])
      context.add(0, 'kick', 0.98, 'downbeat')
      context.add(2, 'snare', 0.62, 'beat')
      context.add(4, 'kick', 0.52, 'beat')
      context.add(4, 'snare', 0.3, 'beat')
      context.add(0, 'bass', 0.82, 'downbeat', 1.7, root)
      context.add(2, 'bass', 0.5, 'beat', 1.5, 43)
      context.add(4, 'bass', 0.46, 'beat', 1.5, 48)
      if (context.random() > 0.66) context.add(1, 'kick', 0.18, 'ornament')
      break

    case 'common-time-groove':
      addHatGrid(context, [0.72, 0.28, 0.48, 0.26, 0.58, 0.28, 0.46, 0.26])
      context.add(0, 'kick', 0.95, 'downbeat')
      context.add(2, 'snare', 0.72, 'beat')
      context.add(4, 'kick', 0.65, 'beat')
      context.add(6, 'snare', 0.72, 'beat')
      context.add(0, 'bass', 0.8, 'downbeat', 3.5, root)
      context.add(4, 'bass', 0.6, 'beat', 3.5, 43)
      break

    case 'compound-rock':
      addHatGrid(context, [0.74, 0.25, 0.28, 0.56, 0.24, 0.27])
      context.add(0, 'kick', 0.96, 'downbeat')
      context.add(3, 'snare', 0.76, 'beat')
      context.add(0, 'bass', 0.82, 'downbeat', 2.7, root)
      context.add(3, 'bass', 0.58, 'beat', 2.7, 43)
      if (context.random() > 0.48) context.add(5, 'kick', 0.28, 'ornament')
      break

    case 'rolling-six':
      addHatGrid(context, [0.72, 0.3, 0.32, 0.54, 0.28, 0.3])
      context.add(0, 'kick', 0.94, 'downbeat')
      context.add(3, 'kick', 0.55, 'beat')
      context.add(3, 'snare', 0.55, 'beat')
      context.add(0, 'bass', 0.8, 'downbeat', 2.6, root)
      context.add(3, 'bass', 0.6, 'beat', 2.6, context.bar % 2 === 0 ? 40 : 43)
      if (context.random() > 0.6) context.add(2, 'snare', 0.2, 'ornament')
      break

    case 'compound-folk':
      addHatGrid(context, [0.7, 0.2, 0.24, 0.52, 0.18, 0.22])
      context.add(0, 'kick', 0.9, 'downbeat')
      context.add(3, 'snare', 0.66, 'beat')
      context.add(0, 'bass', 0.76, 'downbeat', 2.5, root)
      context.add(3, 'bass', 0.54, 'beat', 2.5, context.bar % 2 === 0 ? 43 : 40)
      if (context.random() > 0.55) context.add(5, 'kick', 0.2, 'ornament')
      break

    case 'six-eight-drive':
      addHatGrid(context, [0.78, 0.3, 0.32, 0.58, 0.28, 0.3])
      context.add(0, 'kick', 0.98, 'downbeat')
      context.add(3, 'kick', 0.56, 'beat')
      context.add(3, 'snare', 0.68, 'beat')
      context.add(0, 'bass', 0.84, 'downbeat', 2.5, root)
      context.add(3, 'bass', 0.62, 'beat', 2.5, 43)
      if (context.random() > 0.5) context.add(4, 'kick', 0.22, 'ornament')
      break
  }
}

function chooseFamily(
  meter: SupportedMeter,
  requestedFamily: PatternFamily | undefined,
  random: () => number,
): PatternFamily {
  const available = FAMILIES_BY_METER[meter]

  if (requestedFamily) {
    if (!available.includes(requestedFamily)) {
      throw new RangeError(`${requestedFamily} is not a pattern family for ${meter}.`)
    }
    return requestedFamily
  }

  return available[Math.floor(random() * available.length)] ?? available[0]
}

export function generateRhythm({
  meter,
  seed,
  bars = 4,
  tempoBpm,
  patternFamily,
}: GenerateRhythmOptions): RhythmScore {
  const config = METER_CONFIG[meter]
  const resolvedTempo = tempoBpm ?? config.defaultTempoBpm

  validateRange('bars', bars, MIN_BARS, MAX_BARS)
  validateRange('tempoBpm', resolvedTempo, MIN_TEMPO_BPM, MAX_TEMPO_BPM)
  if (!Number.isInteger(bars)) throw new TypeError('bars must be an integer.')

  const random = createRandom(`${meter}:${seed}`)
  const resolvedFamily = chooseFamily(meter, patternFamily, random)
  const stepsPerBar = config.beatsPerBar * config.stepsPerBeat
  const events: RhythmEvent[] = []

  for (let bar = 0; bar < bars; bar += 1) {
    const start = bar * stepsPerBar
    const context: PatternContext = {
      bar,
      start,
      random,
      add(step, instrument, velocity, role, durationSteps = 0.5, pitch) {
        events.push({
          step: start + step,
          durationSteps,
          instrument,
          velocity,
          role,
          ...(pitch === undefined ? {} : { pitch }),
        })
      },
    }
    composeBar(resolvedFamily, context)
  }

  events.sort((left, right) => left.step - right.step)

  return {
    meter,
    grouping: config.grouping,
    tempoBpm: resolvedTempo,
    tempoBeatUnit: config.tempoBeatUnit,
    beatsPerBar: config.beatsPerBar,
    stepsPerBeat: config.stepsPerBeat,
    bars,
    seed,
    patternFamily: resolvedFamily,
    events,
  }
}
