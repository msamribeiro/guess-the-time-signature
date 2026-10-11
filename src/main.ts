import './styles.css'
import { serializeGenerationRecipe } from './audio'
import type { PlaybackTransform } from './audio'
import { METER_GUIDES, METER_ORDER, practiceSetCopy } from './lessons'
import { ExercisePlayer, ProceduralPlaybackAdapter } from './playback/exercisePlayer'
import { generationRecipeFor } from './practice/exercise'
import {
  advancePracticeRun,
  createPracticeRun,
  currentExercise,
  selectRunMeter,
  submitRunAnswer,
  summarizePracticeRun,
  validatePracticePlan,
  type PracticeMode,
  type PracticePlan,
  type PracticeRun,
} from './practice/practiceRun'
import type { PracticeMeter } from './practice/practiceSession'

function requireElement<ElementType extends Element>(
  selector: string,
  root: ParentNode = document,
): ElementType {
  const element = root.querySelector<ElementType>(selector)
  if (!element) throw new Error(`Required element not found: ${selector}`)
  return element
}

const appSubtitle = requireElement<HTMLParagraphElement>('.app-subtitle')
const setupView = requireElement<HTMLElement>('#setup-view')
const sessionView = requireElement<HTMLElement>('#session-view')
const resultsView = requireElement<HTMLElement>('#results-view')
const setupForm = requireElement<HTMLFormElement>('#setup-form')
const meterInputs = Array.from(
  document.querySelectorAll<HTMLInputElement>('.meter-options input[type="checkbox"]'),
)
const modeInputs = Array.from(
  document.querySelectorAll<HTMLInputElement>('.mode-options input[type="radio"]'),
)
const exerciseCount = requireElement<HTMLSelectElement>('#exercise-count')
const setupStatus = requireElement<HTMLParagraphElement>('#setup-status')
const startSessionButton = requireElement<HTMLButtonElement>('#start-session')

const practiceLevel = requireElement<HTMLParagraphElement>('#practice-level')
const practiceTitle = requireElement<HTMLHeadingElement>('#practice-title')
const practiceDescription = requireElement<HTMLParagraphElement>('#practice-description')
const exerciseNumber = requireElement<HTMLParagraphElement>('#exercise-number')
const sessionProgress = requireElement<HTMLProgressElement>('#session-progress')
const learnExercise = requireElement<HTMLElement>('#learn-exercise')
const learnMeter = requireElement<HTMLParagraphElement>('#learn-meter')
const learnTitle = requireElement<HTMLHeadingElement>('#learn-title')
const learnCount = requireElement<HTMLParagraphElement>('#learn-count')
const learnExplanation = requireElement<HTMLParagraphElement>('#learn-explanation')
const playButton = requireElement<HTMLButtonElement>('#play-audio')
const stopButton = requireElement<HTMLButtonElement>('#stop-audio')
const audioStatus = requireElement<HTMLParagraphElement>('#audio-status')
const learnNextButton = requireElement<HTMLButtonElement>('#learn-next')
const answerSection = requireElement<HTMLElement>('#answer-section')
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
const endSessionButton = requireElement<HTMLButtonElement>('#end-session')

const resultsTitle = requireElement<HTMLHeadingElement>('#results-title')
const resultsSummary = requireElement<HTMLParagraphElement>('#results-summary')
const scoreCallout = requireElement<HTMLDivElement>('#score-callout')
const resultsChart = requireElement<HTMLDivElement>('#results-chart')
const repeatSessionButton = requireElement<HTMLButtonElement>('#repeat-session')
const changeSettingsButton = requireElement<HTMLButtonElement>('#change-settings')

const exercisePlayer = new ExercisePlayer([new ProceduralPlaybackAdapter()])
let run: PracticeRun | undefined
let answerButtons: HTMLButtonElement[] = []

function selectedMeters(): PracticeMeter[] {
  return METER_ORDER.filter((meter) =>
    meterInputs.some((input) => input.value === meter && input.checked),
  )
}

function selectedMode(): PracticeMode {
  const selected = modeInputs.find((input) => input.checked)?.value
  if (selected !== 'learn' && selected !== 'clear' && selected !== 'groove') {
    throw new Error('Choose a practice mode.')
  }
  return selected
}

function planFromForm(): PracticePlan {
  return {
    meters: selectedMeters(),
    mode: selectedMode(),
    exerciseCount: Number(exerciseCount.value),
  }
}

function modeLabel(mode: PracticeMode): string {
  switch (mode) {
    case 'learn':
      return 'Learn'
    case 'clear':
      return 'Clear practice'
    case 'groove':
      return 'Full grooves'
  }
}

function playbackTransform(mode: PracticeMode): PlaybackTransform {
  switch (mode) {
    case 'learn':
      return 'accented-replay'
    case 'clear':
      return 'clear-practice'
    case 'groove':
      return 'full-groove'
  }
}

function updateSetupValidation(): void {
  const plan = planFromForm()
  const error = validatePracticePlan(plan)
  startSessionButton.disabled = Boolean(error)
  setupStatus.textContent =
    error ??
    (plan.mode === 'learn'
      ? `${plan.exerciseCount} labeled examples. Learn sessions are not scored.`
      : `${plan.exerciseCount} scored exercises using ${plan.meters.join(', ')}.`)
}

function showOnly(view: HTMLElement): void {
  setupView.hidden = view !== setupView
  sessionView.hidden = view !== sessionView
  resultsView.hidden = view !== resultsView
}

function currentRun(): PracticeRun {
  if (!run) throw new Error('No practice session is active.')
  return run
}

function setPlaybackIdle(message = 'Ready to play.'): void {
  playButton.disabled = false
  stopButton.disabled = true
  audioStatus.textContent = message
}

function renderAnswerButtons(plan: PracticePlan): void {
  answerGrid.replaceChildren()
  answerButtons = plan.meters.map((meter) => {
    const guide = METER_GUIDES[meter]
    const button = document.createElement('button')
    const meterLabel = document.createElement('strong')
    const description = document.createElement('span')
    button.className = 'answer-button'
    button.type = 'button'
    button.dataset.meter = meter
    button.setAttribute('aria-pressed', 'false')
    meterLabel.textContent = meter
    description.textContent = guide.answerLabel
    button.append(meterLabel, description)
    button.addEventListener('click', () => {
      run = selectRunMeter(currentRun(), meter)
      renderSelection()
    })
    answerGrid.append(button)
    return button
  })
}

function renderSelection(): void {
  const activeRun = currentRun()
  submitButton.disabled = !activeRun.selectedMeter || activeRun.phase === 'answered'
  for (const button of answerButtons) {
    const meter = button.dataset.meter as PracticeMeter
    button.disabled = activeRun.phase === 'answered'
    button.setAttribute('aria-pressed', String(activeRun.selectedMeter === meter))
  }
}

function renderExercise(): void {
  const activeRun = currentRun()
  const exercise = currentExercise(activeRun)
  if (!exercise) {
    renderResults()
    return
  }

  exercisePlayer.stop()
  showOnly(sessionView)
  appSubtitle.textContent = `${modeLabel(activeRun.plan.mode)} · ${activeRun.plan.exerciseCount} exercises`
  practiceLevel.textContent = modeLabel(activeRun.plan.mode)
  exerciseNumber.textContent = `Exercise ${activeRun.currentIndex + 1} of ${activeRun.plan.exerciseCount}`
  sessionProgress.max = activeRun.plan.exerciseCount
  sessionProgress.value = activeRun.currentIndex + 1
  feedback.hidden = true
  generationDetails.open = false
  playButton.textContent = activeRun.plan.mode === 'learn' ? 'Play labeled example' : 'Play excerpt'
  setPlaybackIdle()

  const isLearn = activeRun.plan.mode === 'learn'
  learnExercise.hidden = !isLearn
  learnNextButton.hidden = !isLearn
  answerSection.hidden = isLearn

  if (isLearn) {
    const guide = METER_GUIDES[exercise.meter]
    practiceTitle.textContent = `Listen for ${exercise.meter}`
    practiceDescription.textContent =
      'The meter and counting guide stay visible. Follow the main beats as the example plays.'
    learnMeter.textContent = exercise.meter
    learnTitle.textContent = guide.title
    learnCount.textContent = guide.count
    learnCount.setAttribute('aria-label', guide.countAriaLabel)
    learnExplanation.textContent = guide.explanation
    learnNextButton.textContent =
      activeRun.currentIndex === activeRun.exercises.length - 1 ? 'See session summary' : 'Next example'
    return
  }

  practiceTitle.textContent = 'What meter do you hear?'
  practiceDescription.textContent =
    activeRun.plan.mode === 'clear'
      ? 'The grouping is emphasized and musical distractions are reduced.'
      : 'Listen for the underlying grouping inside the complete musical arrangement.'
  renderAnswerButtons(activeRun.plan)
  renderSelection()
}

function renderAnsweredExercise(): void {
  const activeRun = currentRun()
  const exercise = currentExercise(activeRun)
  if (!exercise || activeRun.phase !== 'answered') return

  renderSelection()
  feedback.hidden = false
  feedback.dataset.result = activeRun.isCorrect ? 'correct' : 'incorrect'
  feedbackHeading.textContent = activeRun.isCorrect ? 'Correct' : 'Not quite'
  feedbackAnswer.textContent = `The intended hearing is ${exercise.meter}, grouped ${exercise.grouping}.`
  feedbackCount.textContent = METER_GUIDES[exercise.meter].count
  feedbackCue.textContent = exercise.explanation
  const ambiguityNote = practiceSetCopy(activeRun.plan.meters).ambiguityNote
  feedbackAmbiguity.hidden = !ambiguityNote
  feedbackAmbiguity.textContent = ambiguityNote ?? ''
  feedbackSource.textContent = `Source: ${exercise.playback.kind} · ${exercise.title}`
  nextButton.textContent =
    activeRun.currentIndex === activeRun.exercises.length - 1 ? 'See results' : 'Next exercise'

  const recipe = generationRecipeFor(exercise, playbackTransform(activeRun.plan.mode))
  generationDetails.hidden = !recipe
  regenerateReplayButton.hidden = !recipe
  accentedReplayButton.hidden = !recipe
  if (recipe) {
    detailTempo.textContent = `${recipe.tempoBpm} BPM (${recipe.tempoBeatUnit.replace('-', ' ')})`
    detailBars.textContent = `${recipe.bars} bars`
    detailPattern.textContent = recipe.patternFamily
    detailSeed.textContent = recipe.seed
    detailTransform.textContent = modeLabel(activeRun.plan.mode)
    generationRecipe.textContent = serializeGenerationRecipe(recipe)
  }
  feedback.focus()
}

function startSession(plan: PracticePlan): void {
  run = createPracticeRun(plan, `session-${Date.now()}`)
  renderExercise()
  playButton.focus()
}

function finishCurrentExercise(): void {
  run = advancePracticeRun(currentRun())
  if (run.phase === 'complete') renderResults()
  else renderExercise()
}

function renderResults(): void {
  const activeRun = currentRun()
  exercisePlayer.stop()
  showOnly(resultsView)
  appSubtitle.textContent = 'Session complete'
  const summary = summarizePracticeRun(activeRun)
  const isLearn = activeRun.plan.mode === 'learn'

  resultsTitle.textContent = isLearn ? 'Learning session complete' : 'Your results'
  resultsSummary.textContent = isLearn
    ? `You completed ${summary.completed} labeled examples across ${activeRun.plan.meters.length} time signature${activeRun.plan.meters.length === 1 ? '' : 's'}.`
    : `You identified ${summary.correct} of ${summary.attempted} exercises correctly.`
  scoreCallout.replaceChildren()
  const score = document.createElement('strong')
  const scoreLabel = document.createElement('span')
  score.textContent = isLearn ? String(summary.completed) : `${summary.accuracyPercentage ?? 0}%`
  scoreLabel.textContent = isLearn ? 'examples completed' : 'overall accuracy'
  scoreCallout.append(score, scoreLabel)

  resultsChart.replaceChildren()
  const largestLearnCount = Math.max(1, ...summary.byMeter.map((item) => item.completed))
  for (const meterSummary of summary.byMeter) {
    const row = document.createElement('div')
    const heading = document.createElement('div')
    const meter = document.createElement('strong')
    const result = document.createElement('span')
    const track = document.createElement('div')
    const bar = document.createElement('span')
    const percentage = isLearn
      ? Math.round((meterSummary.completed / largestLearnCount) * 100)
      : (meterSummary.accuracyPercentage ?? 0)

    row.className = 'result-row'
    heading.className = 'result-row-heading'
    track.className = 'result-track'
    bar.className = 'result-bar'
    bar.style.width = `${percentage}%`
    meter.textContent = meterSummary.meter
    result.textContent = isLearn
      ? `${meterSummary.completed} example${meterSummary.completed === 1 ? '' : 's'}`
      : `${meterSummary.correct}/${meterSummary.attempted} · ${meterSummary.accuracyPercentage ?? 0}%`
    row.setAttribute('aria-label', `${meterSummary.meter}: ${result.textContent}`)
    track.setAttribute('aria-hidden', 'true')
    heading.append(meter, result)
    track.append(bar)
    row.append(heading, track)
    resultsChart.append(row)
  }
  resultsTitle.focus()
}

function returnToSetup(message = ''): void {
  exercisePlayer.stop()
  run = undefined
  showOnly(setupView)
  appSubtitle.textContent = 'Build a focused listening session'
  updateSetupValidation()
  if (message) setupStatus.textContent = message
  requireElement<HTMLHeadingElement>('#setup-title').focus()
}

setupForm.addEventListener('submit', (event) => {
  event.preventDefault()
  const plan = planFromForm()
  const error = validatePracticePlan(plan)
  if (error) {
    setupStatus.textContent = error
    return
  }
  startSession(plan)
})

for (const input of [...meterInputs, ...modeInputs]) {
  input.addEventListener('change', updateSetupValidation)
}
exerciseCount.addEventListener('change', updateSetupValidation)

playButton.addEventListener('click', async () => {
  const activeRun = currentRun()
  const exercise = currentExercise(activeRun)
  if (!exercise) return
  playButton.disabled = true
  stopButton.disabled = false
  audioStatus.textContent = 'Playing excerpt…'
  try {
    await exercisePlayer.play(exercise, playbackTransform(activeRun.plan.mode), () => {
      playButton.textContent = 'Replay excerpt'
      setPlaybackIdle('Excerpt finished. Replay it as often as you need.')
    })
  } catch {
    setPlaybackIdle('Audio could not start. Check your browser settings and try again.')
  }
})

stopButton.addEventListener('click', () => {
  exercisePlayer.stop()
  playButton.textContent = 'Replay excerpt'
  setPlaybackIdle('Playback stopped.')
})

submitButton.addEventListener('click', () => {
  run = submitRunAnswer(currentRun())
  renderAnsweredExercise()
})

nextButton.addEventListener('click', finishCurrentExercise)
learnNextButton.addEventListener('click', finishCurrentExercise)

accentedReplayButton.addEventListener('click', async () => {
  const exercise = currentExercise(currentRun())
  if (!exercise) return
  playButton.disabled = true
  stopButton.disabled = false
  audioStatus.textContent = 'Replaying with a clear click on every main beat…'
  try {
    await exercisePlayer.play(exercise, 'accented-replay', () => {
      setPlaybackIdle('Accented replay finished.')
    })
  } catch {
    setPlaybackIdle('Audio could not start. Check your browser settings and try again.')
  }
})

regenerateReplayButton.addEventListener('click', async () => {
  const activeRun = currentRun()
  const exercise = currentExercise(activeRun)
  if (!exercise) return
  playButton.disabled = true
  stopButton.disabled = false
  audioStatus.textContent = 'Regenerating the score from the displayed parameters…'
  try {
    await exercisePlayer.play(exercise, playbackTransform(activeRun.plan.mode), () => {
      setPlaybackIdle('Regenerated replay finished.')
    })
  } catch {
    setPlaybackIdle('Audio could not start. Check your browser settings and try again.')
  }
})

endSessionButton.addEventListener('click', () => returnToSetup('Session ended. Nothing was saved.'))
changeSettingsButton.addEventListener('click', () => returnToSetup())
repeatSessionButton.addEventListener('click', () => {
  const plan = currentRun().plan
  startSession(plan)
})

window.addEventListener('pagehide', () => void exercisePlayer.close())

updateSetupValidation()
showOnly(setupView)
