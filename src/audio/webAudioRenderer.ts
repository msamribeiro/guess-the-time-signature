import type { RhythmEvent, RhythmScore } from './types'

export function scoreDurationSeconds(score: RhythmScore): number {
  return score.bars * score.beatsPerBar * (60 / score.tempoBpm)
}

function midiToFrequency(note: number): number {
  return 440 * 2 ** ((note - 69) / 12)
}

export class WebAudioRenderer {
  private context: AudioContext | undefined
  private output: AudioNode | undefined
  private noiseBuffer: AudioBuffer | undefined
  private activeSources = new Set<AudioScheduledSourceNode>()
  private endTimer: number | undefined
  private playbackGeneration = 0

  async play(score: RhythmScore, onEnded?: () => void): Promise<number> {
    this.stop()
    this.ensureAudioGraph()
    const generation = this.playbackGeneration
    await this.context?.resume()

    if (!this.context || !this.output) throw new Error('Audio context could not be created.')
    if (generation !== this.playbackGeneration) return 0

    const startAt = this.context.currentTime + 0.06
    const stepDuration = 60 / score.tempoBpm / score.stepsPerBeat
    const duration = scoreDurationSeconds(score)

    for (const event of score.events) {
      this.scheduleEvent(event, startAt + event.step * stepDuration, stepDuration)
    }

    this.endTimer = window.setTimeout(() => {
      if (generation !== this.playbackGeneration) return
      this.activeSources.clear()
      this.endTimer = undefined
      onEnded?.()
    }, (duration + 0.12) * 1000)

    return duration
  }

  stop(): void {
    this.playbackGeneration += 1

    if (this.endTimer !== undefined) {
      window.clearTimeout(this.endTimer)
      this.endTimer = undefined
    }

    for (const source of this.activeSources) {
      try {
        source.stop()
      } catch {
        // A source may already have naturally ended.
      }
    }

    this.activeSources.clear()
  }

  async close(): Promise<void> {
    this.stop()
    await this.context?.close()
    this.context = undefined
    this.output = undefined
    this.noiseBuffer = undefined
  }

  private ensureAudioGraph(): void {
    if (this.context) return

    this.context = new AudioContext()
    const master = this.context.createGain()
    const compressor = this.context.createDynamicsCompressor()
    master.gain.value = 0.72
    compressor.threshold.value = -18
    compressor.knee.value = 12
    compressor.ratio.value = 5
    master.connect(compressor)
    compressor.connect(this.context.destination)
    this.output = master
    this.noiseBuffer = this.createNoiseBuffer()
  }

  private createNoiseBuffer(): AudioBuffer {
    if (!this.context) throw new Error('Audio context is unavailable.')

    const length = Math.ceil(this.context.sampleRate * 0.2)
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate)
    const channel = buffer.getChannelData(0)
    let state = 0x12345678

    for (let index = 0; index < length; index += 1) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0
      channel[index] = (state / 4294967296) * 2 - 1
    }

    return buffer
  }

  private scheduleEvent(event: RhythmEvent, startAt: number, stepDuration: number): void {
    switch (event.instrument) {
      case 'kick':
        this.scheduleKick(event, startAt)
        break
      case 'snare':
        this.scheduleSnare(event, startAt)
        break
      case 'closed-hat':
        this.scheduleHat(event, startAt)
        break
      case 'bass':
        this.scheduleBass(event, startAt, stepDuration)
        break
      case 'accent-click':
        this.scheduleAccentClick(event, startAt)
        break
    }
  }

  private scheduleKick(event: RhythmEvent, startAt: number): void {
    if (!this.context || !this.output) return
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    const duration = 0.16
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(150, startAt)
    oscillator.frequency.exponentialRampToValueAtTime(48, startAt + duration)
    gain.gain.setValueAtTime(0.7 * event.velocity, startAt)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
    oscillator.connect(gain)
    gain.connect(this.output)
    this.startSource(oscillator, startAt, startAt + duration)
  }

  private scheduleSnare(event: RhythmEvent, startAt: number): void {
    if (!this.context || !this.output || !this.noiseBuffer) return
    const noise = this.context.createBufferSource()
    const filter = this.context.createBiquadFilter()
    const gain = this.context.createGain()
    const duration = 0.11
    noise.buffer = this.noiseBuffer
    filter.type = 'bandpass'
    filter.frequency.value = 1700
    filter.Q.value = 0.7
    gain.gain.setValueAtTime(0.32 * event.velocity, startAt)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.output)
    this.startSource(noise, startAt, startAt + duration)
  }

  private scheduleHat(event: RhythmEvent, startAt: number): void {
    if (!this.context || !this.output || !this.noiseBuffer) return
    const noise = this.context.createBufferSource()
    const filter = this.context.createBiquadFilter()
    const gain = this.context.createGain()
    const duration = 0.035
    noise.buffer = this.noiseBuffer
    filter.type = 'highpass'
    filter.frequency.value = 6500
    gain.gain.setValueAtTime(0.17 * event.velocity, startAt)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(this.output)
    this.startSource(noise, startAt, startAt + duration)
  }

  private scheduleBass(event: RhythmEvent, startAt: number, stepDuration: number): void {
    if (!this.context || !this.output) return
    const oscillator = this.context.createOscillator()
    const filter = this.context.createBiquadFilter()
    const gain = this.context.createGain()
    const duration = Math.max(0.08, event.durationSteps * stepDuration * 0.88)
    const frequency = midiToFrequency(event.pitch ?? 36)
    oscillator.type = 'sawtooth'
    oscillator.frequency.setValueAtTime(frequency, startAt)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(520, startAt)
    filter.frequency.exponentialRampToValueAtTime(180, startAt + duration)
    filter.Q.value = 1.8
    gain.gain.setValueAtTime(0.18 * event.velocity, startAt)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(this.output)
    this.startSource(oscillator, startAt, startAt + duration)
  }

  private scheduleAccentClick(event: RhythmEvent, startAt: number): void {
    if (!this.context || !this.output) return
    const oscillator = this.context.createOscillator()
    const gain = this.context.createGain()
    const duration = 0.055
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(event.role === 'downbeat' ? 1320 : 990, startAt)
    oscillator.frequency.exponentialRampToValueAtTime(720, startAt + duration)
    gain.gain.setValueAtTime(0.2 * event.velocity, startAt)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
    oscillator.connect(gain)
    gain.connect(this.output)
    this.startSource(oscillator, startAt, startAt + duration)
  }

  private startSource(
    source: AudioScheduledSourceNode,
    startAt: number,
    stopAt: number,
  ): void {
    this.activeSources.add(source)
    source.addEventListener('ended', () => this.activeSources.delete(source), { once: true })
    source.start(startAt)
    source.stop(stopAt)
  }
}
