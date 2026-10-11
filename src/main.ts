import './styles.css'
import {
  AUDIO_EXAMPLES,
  createAccentedReplayScore,
  serializeGenerationRecipe,
  WebAudioRenderer,
} from './audio'
import type { PlaybackTransform, RhythmScore } from './audio'
import { METER_GUIDES, METER_ORDER, practiceSetCopy } from './lessons'
import { ExercisePlayer, ProceduralPlaybackAdapter } from './playback/exercisePlayer'
import { generationRecipeFor } from './practice/exercise'
import {
  advanceExercise,
  createPracticeExercise,
  createPracticeSession,
  selectMeter,
  submitAnswer,
  type PracticeMeter,
  type PracticeSession,
} from './practice/practiceSession'

type AppMode = 'learn' | 'clear' | 'groove'

function requireElement<ElementType extends Element>(
  selector: string,
  root: ParentNode = document,
): ElementType {
  const element = root.querySelector<ElementType>(selector)
  if (!element) throw new Error(`Required element not found: ${selector}`)
  return element
}

const modeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-mode]'))
const appSubtitle = requireElement<HTMLParagraphElement>('.app-subtitle')
const meterInputs = Array.from(
  document.querySelectorAll<HTMLInputElement>('.meter-options input[type="checkbox"]'),
)
const meterSelectionStatus = requireElement<HTMLParagraphElement>('#meter-selection-status')
const learnView = requireElement<HTMLElement>('#learn-view')
const practiceView = requireElement<HTMLElement>('#practice-view')
const pageTitle = requireElement<HTMLHeadingElement>('#page-title')
const lessonIntroduction = requireElement<HTMLParagraphElement>('#lesson-introduction')
const lessonGrid = requireElement<HTMLDivElement>('#lesson-grid')
const lessonStatus = requireElement<HTMLParagraphElement>('#lesson-status')
const startClearButton = requireElement<HTMLButtonElement>('#start-clear-practice')
const practiceLevel = requireElement<HTMLParagraphElement>('#practice-level')
const practiceDescription = requireElement<HTMLParagraphElement>('#practice-description')
const exerciseNumber = requireElement<HTMLParagraphElement>('#exercise-number')
const playButton = requireElement<HTMLButtonElement>('#play-audio')
const stopButton = requireElement<HTMLButtonElement>('#stop-audio')
const answerGrid = requireElement<HTMLDivElement>('#answer-grid')
const submitButton = requireElement<HTMLButtonElement>('#submit-answer')
const feedback = requireElement<HTMLElement>('#feedback')
const feedbackHeading = requireElement<HTMLHeadingElement>('#feedback-heading')
const feedbackAnswer = requireElement<HTMLParagraphElement>('#feedback-answer')
const feedbackCount = requireElement<HTMLParagraphElement>('#feedback-count')
const feedbackCue = requireElement<HTMLParagraphElement>('#feedback-cue')
const feedbackAmbiguity = requireElement<HTMLParagraphElement>('#feedback-ambiguity')
const feedbackSource = requireElement<HTMLParagraphElement>('#feedback-source')
const generationDetails = requireElement<HTMLDetailsElement>('#generation-details')
const detailTempo = requireElement<HTMLElement>('#detail-tempo')
const detailBars = requireElement<HTMLElement>('#detail-bars')
const detailPattern = requireElement<HTMLElement>('#detail-pattern')
const detailSeed = requireElement<HTMLElement>('#detail-seed')
const detailTransform = requireElement<HTMLElement>('#detail-transform')
const generationRecipe = requireElement<HTMLElement>('#generation-recipe')
const regenerateReplayButton = requireElement<HTMLButtonElement>('#regenerate-replay')
const accentedReplayButton = requireElement<HTMLButtonElement>('#accented-replay')
const nextButton = requireElement<HTMLButtonElement>('#next-exercise')
const advanceStageButton = requireElement<HTMLButtonElement>('#advance-stage')
const audioStatus = requireElement<HTMLParagraphElement>('#audio-status')

const renderer = new WebAudioRenderer()
const exercisePlayer = new ExercisePlayer([new ProceduralPlaybackAdapter(renderer)])
let seedCounter = 1
let activeMode: AppMode = 'learn'
let activeMeters: readonly PracticeMeter[] = ['3/4', '6/8']
let answerButtons: HTMLButtonElement[] = []
let guideButtons = new Map<PracticeMeter, HTMLButtonElement>()
let activeGuideMeter: PracticeMeter | undefined
let session: PracticeSession = createPracticeSession(
  createPracticeExercise(`practice-${seedCounter}`, undefined, Math.random, activeMeters),
)

function guideScore(meter: PracticeMeter): RhythmScore {
  const example = AUDIO_EXAMPLES.find((candidate) => candidate.score.meter === meter)
  if (!example) throw new Error(`No guided ${meter} example is available.`)
  return createAccentedReplayScore(example.score)
}

function activePlaybackTransform(): PlaybackTransform {
  return activeMode === 'clear' ? 'clear-practice' : 'full-groove'
}

function setPracticePlaybackIdle(message = 'Ready to play.'): void {
  playButton.disabled = false
  stopButton.disabled = true
  audioStatus.textContent = message
}

function setGuidedPlaybackIdle(message?: string): void {
  activeGuideMeter = undefined
  for (const [meter, button] of guideButtons) {
    button.textContent = `Play ${meter} example`
    button.setAttribute('aria-pressed', 'false')
  }
  if (message) lessonStatus.textContent = message
}

async function playGuidedExample(meter: PracticeMeter): Promise<void> {
  if (activeGuideMeter === meter) {
    exercisePlayer.stop()
    setGuidedPlaybackIdle(`${meter} example stopped.`)
    return
  }

  exercisePlayer.stop()
  setGuidedPlaybackIdle()
  activeGuideMeter = meter
  const activeButton = guideButtons.get(meter)
  if (activeButton) {
    activeButton.textContent = `Stop ${meter} example`
    activeButton.setAttribute('aria-pressed', 'true')
  }
  lessonStatus.textContent = `Playing the labeled ${meter} grouping…`
  try {
    await renderer.play(guideScore(meter), () => {
      setGuidedPlaybackIdle(
        `${meter} example finished. Listen again or compare it with the other selected meters.`,
      )
    })
  } catch {
    setGuidedPlaybackIdle('Audio could not start. Check your browser settings and try again.')
  }
}

function renderLesson(): void {
  const copy = practiceSetCopy(activeMeters)
  appSubtitle.textContent = copy.subtitle
  pageTitle.textContent = copy.title
  lessonIntroduction.textContent = copy.introduction
  lessonGrid.replaceChildren()
  guideButtons = new Map()
  activeGuideMeter = undefined

  activeMeters.forEach((selectedMeter) => {
    const details = METER_GUIDES[selectedMeter]
    const card = document.createElement('article')
    card.className = 'lesson-card'

    const meter = document.createElement('p')
    meter.className = 'meter-label'
    meter.textContent = details.meter

    const heading = document.createElement('h2')
    heading.textContent = details.title

    const count = document.createElement('p')
    count.className = 'count-line'
    count.setAttribute('aria-label', details.countAriaLabel)
    count.textContent = details.count

    const explanation = document.createElement('p')
    explanation.textContent = details.explanation

    const play = document.createElement('button')
    play.className = 'lesson-play'
    play.type = 'button'
    play.textContent = `Play ${details.meter} example`
    play.setAttribute('aria-pressed', 'false')
    play.addEventListener('click', () => void playGuidedExample(details.meter))
    guideButtons.set(details.meter, play)

    card.append(meter, heading, count, explanation, play)
    lessonGrid.append(card)
  })

  answerGrid.replaceChildren()
  answerButtons = activeMeters.map((selectedMeter) => {
    const details = METER_GUIDES[selectedMeter]
    const button = document.createElement('button')
    const meter = document.createElement('strong')
    const description = document.createElement('span')

    button.className = 'answer-button'
    button.type = 'button'
    button.dataset.meter = details.meter
    button.setAttribute('aria-pressed', 'false')
    meter.textContent = details.meter
    description.textContent = details.answerLabel
    button.append(meter, description)
    button.addEventListener('click', () => {
      session = selectMeter(session, details.meter)
      renderSession()
    })
    answerGrid.append(button)
    return button
  })
}

function renderSession(): void {
  const isAnswered = session.phase === 'answered'
  exerciseNumber.textContent = `Exercise ${session.exerciseNumber}`
  submitButton.disabled = !session.selectedMeter || isAnswered
  feedback.hidden = !isAnswered

  for (const button of answerButtons) {
    const meter = button.dataset.meter as PracticeMeter
    button.disabled = isAnswered
    button.setAttribute('aria-pressed', String(session.selectedMeter === meter))
  }

  if (!isAnswered) return

  const exercise = session.exercise
  feedback.dataset.result = session.isCorrect ? 'correct' : 'incorrect'
  feedbackHeading.textContent = session.isCorrect ? 'Correct' : 'Not quite'
  feedbackAnswer.textContent = `The intended hearing is ${exercise.meter}, grouped ${exercise.grouping}.`
  feedbackCount.textContent = METER_GUIDES[exercise.meter].count
  feedbackCue.textContent = exercise.explanation
  const ambiguityNote = practiceSetCopy(activeMeters).ambiguityNote
  feedbackAmbiguity.hidden = !ambiguityNote
  feedbackAmbiguity.textContent = ambiguityNote ?? ''
  feedbackSource.textContent = `Source: ${exercise.playback.kind} · ${exercise.title}`

  const recipe = generationRecipeFor(exercise, activePlaybackTransform())
  generationDetails.hidden = !recipe
  regenerateReplayButton.hidden = !recipe
  accentedReplayButton.hidden = !recipe
  if (!recipe) return
  detailTempo.textContent = `${recipe.tempoBpm} BPM (${recipe.tempoBeatUnit.replace('-', ' ')})`
  detailBars.textContent = `${recipe.bars} bars`
  detailPattern.textContent = recipe.patternFamily
  detailSeed.textContent = recipe.seed
  detailTransform.textContent =
    recipe.playbackTransform === 'clear-practice' ? 'Clear practice' : 'Full groove'
  generationRecipe.textContent = serializeGenerationRecipe(recipe)
}

function resetPractice(mode: Exclude<AppMode, 'learn'>): void {
  exercisePlayer.stop()
  seedCounter += 1
  session = createPracticeSession(
    createPracticeExercise(
      `practice-${seedCounter}-${Date.now()}`,
      undefined,
      Math.random,
      activeMeters,
    ),
  )
  activeMode = mode
  practiceLevel.textContent = mode === 'clear' ? 'Clear practice' : 'Full grooves'
  practiceDescription.textContent =
    mode === 'clear'
      ? 'Bass and ornaments are removed, and the main beats are strongly accented.'
      : 'The bass and musical variations are back. Listen for the same underlying grouping.'
  nextButton.textContent = mode === 'clear' ? 'Next clear exercise' : 'Next groove'
  advanceStageButton.hidden = mode !== 'clear'
  playButton.textContent = 'Play excerpt'
  setPracticePlaybackIdle()
  renderSession()
}

function showMode(mode: AppMode): void {
  exercisePlayer.stop()
  setGuidedPlaybackIdle()
  activeMode = mode
  learnView.hidden = mode !== 'learn'
  practiceView.hidden = mode === 'learn'

  for (const button of modeButtons) {
    const isActive = button.dataset.mode === mode
    button.setAttribute('aria-pressed', String(isActive))
    if (isActive) button.setAttribute('aria-current', 'step')
    else button.removeAttribute('aria-current')
  }

  if (mode === 'learn') {
    lessonStatus.textContent = 'Choose any labeled example to compare the selected meters.'
    return
  }

  resetPractice(mode)
  playButton.focus()
}

for (const button of modeButtons) {
  button.addEventListener('click', () => {
    const mode = button.dataset.mode as AppMode
    if (mode !== activeMode) showMode(mode)
  })
}

for (const input of meterInputs) {
  input.addEventListener('change', () => {
    const selectedMeters = METER_ORDER.filter((meter) =>
      meterInputs.some((candidate) => candidate.value === meter && candidate.checked),
    )

    if (selectedMeters.length < 2) {
      input.checked = true
      meterSelectionStatus.textContent = 'Keep at least two signatures selected for comparison.'
      return
    }

    activeMeters = selectedMeters
    meterSelectionStatus.textContent = `Practicing ${activeMeters.join(', ')}.`
    renderLesson()
    showMode('learn')
  })
}

startClearButton.addEventListener('click', () => showMode('clear'))

playButton.addEventListener('click', async () => {
  playButton.disabled = true
  stopButton.disabled = false
  audioStatus.textContent = 'Playing excerpt…'

  try {
    await exercisePlayer.play(session.exercise, activePlaybackTransform(), () => {
      playButton.textContent = 'Replay excerpt'
      setPracticePlaybackIdle('Excerpt finished. Replay it as often as you need.')
    })
  } catch {
    setPracticePlaybackIdle('Audio could not start. Check your browser settings and try again.')
  }
})

stopButton.addEventListener('click', () => {
  exercisePlayer.stop()
  playButton.textContent = 'Replay excerpt'
  setPracticePlaybackIdle('Playback stopped.')
})

submitButton.addEventListener('click', () => {
  session = submitAnswer(session)
  renderSession()
  feedback.focus()
})

accentedReplayButton.addEventListener('click', async () => {
  playButton.disabled = true
  stopButton.disabled = false
  audioStatus.textContent = 'Replaying with a clear click on every main beat…'
  try {
    await exercisePlayer.play(session.exercise, 'accented-replay', () => {
      setPracticePlaybackIdle('Accented replay finished.')
    })
  } catch {
    setPracticePlaybackIdle('Audio could not start. Check your browser settings and try again.')
  }
})

regenerateReplayButton.addEventListener('click', async () => {
  playButton.disabled = true
  stopButton.disabled = false
  audioStatus.textContent = 'Regenerating the score from the displayed parameters…'
  try {
    await exercisePlayer.play(session.exercise, activePlaybackTransform(), () => {
      setPracticePlaybackIdle('Regenerated replay finished.')
    })
  } catch {
    setPracticePlaybackIdle('Audio could not start. Check your browser settings and try again.')
  }
})

nextButton.addEventListener('click', () => {
  exercisePlayer.stop()
  seedCounter += 1
  const nextExercise = createPracticeExercise(
    `practice-${seedCounter}-${Date.now()}`,
    session.exercise,
    Math.random,
    activeMeters,
  )
  session = advanceExercise(session, nextExercise)
  playButton.textContent = 'Play excerpt'
  setPracticePlaybackIdle()
  renderSession()
  playButton.focus()
})

advanceStageButton.addEventListener('click', () => showMode('groove'))

window.addEventListener('pagehide', () => void exercisePlayer.close())

renderLesson()
showMode('learn')
