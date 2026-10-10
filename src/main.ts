import './styles.css'
import {
  AUDIO_EXAMPLES,
  createAccentedReplayScore,
  createClearPracticeScore,
  createGenerationRecipe,
  regenerateFromRecipe,
  serializeGenerationRecipe,
  WebAudioRenderer,
} from './audio'
import type { GenerationRecipe, RhythmScore } from './audio'
import { DEFAULT_LESSON_ID, LESSONS, type LessonDefinition, type LessonId } from './lessons'
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
const lessonSelect = requireElement<HTMLSelectElement>('#lesson-select')
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
const answerButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>('[data-answer-index]'),
)
const submitButton = requireElement<HTMLButtonElement>('#submit-answer')
const feedback = requireElement<HTMLElement>('#feedback')
const feedbackHeading = requireElement<HTMLHeadingElement>('#feedback-heading')
const feedbackAnswer = requireElement<HTMLParagraphElement>('#feedback-answer')
const feedbackCount = requireElement<HTMLParagraphElement>('#feedback-count')
const feedbackCue = requireElement<HTMLParagraphElement>('#feedback-cue')
const feedbackAmbiguity = requireElement<HTMLParagraphElement>('#feedback-ambiguity')
const feedbackSource = requireElement<HTMLParagraphElement>('#feedback-source')
const detailTempo = requireElement<HTMLElement>('#detail-tempo')
const detailBars = requireElement<HTMLElement>('#detail-bars')
const detailPattern = requireElement<HTMLElement>('#detail-pattern')
const detailSeed = requireElement<HTMLElement>('#detail-seed')
const detailTransform = requireElement<HTMLElement>('#detail-transform')
const generationRecipe = requireElement<HTMLElement>('#generation-recipe')
const regenerateReplayButton = requireElement<HTMLButtonElement>('#regenerate-replay')
const accentedReplayButton = requireElement<HTMLButtonElement>('#accented-replay')
const nextButton = requireElement<HTMLButtonElement>('#next-exercise')
const audioStatus = requireElement<HTMLParagraphElement>('#audio-status')

const renderer = new WebAudioRenderer()
let seedCounter = 1
let activeMode: AppMode = 'learn'
let activeLessonId: LessonId = DEFAULT_LESSON_ID
let session: PracticeSession = createPracticeSession(
  createPracticeExercise(`practice-${seedCounter}`),
)

function activeLesson(): LessonDefinition {
  return LESSONS[activeLessonId]
}

function guideScore(meter: PracticeMeter): RhythmScore {
  const example = AUDIO_EXAMPLES.find((candidate) => candidate.score.meter === meter)
  if (!example) throw new Error(`No guided ${meter} example is available.`)
  return createAccentedReplayScore(example.score)
}

function practiceScore(): RhythmScore {
  return activeMode === 'clear'
    ? createClearPracticeScore(session.exercise.score)
    : session.exercise.score
}

function currentRecipe(): GenerationRecipe {
  return createGenerationRecipe(
    session.exercise.score,
    activeMode === 'clear' ? 'clear-practice' : 'full-groove',
  )
}

function scoreForRecipe(recipe: GenerationRecipe): RhythmScore {
  const score = regenerateFromRecipe(recipe)
  return recipe.playbackTransform === 'clear-practice'
    ? createClearPracticeScore(score)
    : score
}

function setPracticePlaybackIdle(message = 'Ready to play.'): void {
  playButton.disabled = false
  stopButton.disabled = true
  audioStatus.textContent = message
}

async function playGuidedExample(meter: PracticeMeter): Promise<void> {
  lessonStatus.textContent = `Playing the labeled ${meter} grouping…`
  try {
    await renderer.play(guideScore(meter), () => {
      lessonStatus.textContent = `${meter} example finished. Listen again or compare it with the other meter.`
    })
  } catch {
    lessonStatus.textContent = 'Audio could not start. Check your browser settings and try again.'
  }
}

function renderLesson(): void {
  const lesson = activeLesson()
  appSubtitle.textContent = lesson.subtitle
  pageTitle.textContent = lesson.title
  lessonIntroduction.textContent = lesson.introduction
  lessonGrid.replaceChildren()

  lesson.meters.forEach((details) => {
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
    play.addEventListener('click', () => void playGuidedExample(details.meter))

    card.append(meter, heading, count, explanation, play)
    lessonGrid.append(card)
  })

  answerButtons.forEach((button, index) => {
    const details = lesson.meters[index]
    if (!details) return
    button.dataset.meter = details.meter
    requireElement<HTMLElement>('strong', button).textContent = details.meter
    requireElement<HTMLElement>('span', button).textContent = details.answerLabel
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

  const score = session.exercise.score
  feedback.dataset.result = session.isCorrect ? 'correct' : 'incorrect'
  feedbackHeading.textContent = session.isCorrect ? 'Correct' : 'Not quite'
  feedbackAnswer.textContent = `The intended hearing is ${score.meter}, grouped ${score.grouping}.`
  feedbackCount.textContent =
    activeLesson().meters.find((details) => details.meter === score.meter)?.count ?? ''
  feedbackCue.textContent = session.exercise.listeningCue
  feedbackAmbiguity.hidden = !activeLesson().ambiguityNote
  feedbackAmbiguity.textContent = activeLesson().ambiguityNote ?? ''
  feedbackSource.textContent = `Source: procedural · ${session.exercise.title}`

  const recipe = currentRecipe()
  detailTempo.textContent = `${recipe.tempoBpm} BPM (${recipe.tempoBeatUnit.replace('-', ' ')})`
  detailBars.textContent = `${recipe.bars} bars`
  detailPattern.textContent = recipe.patternFamily
  detailSeed.textContent = recipe.seed
  detailTransform.textContent =
    recipe.playbackTransform === 'clear-practice' ? 'Clear practice' : 'Full groove'
  generationRecipe.textContent = serializeGenerationRecipe(recipe)
}

function resetPractice(mode: Exclude<AppMode, 'learn'>): void {
  renderer.stop()
  seedCounter += 1
  session = createPracticeSession(
    createPracticeExercise(
      `practice-${seedCounter}-${Date.now()}`,
      undefined,
      Math.random,
      activeLesson().meters.map((details) => details.meter),
    ),
  )
  activeMode = mode
  practiceLevel.textContent = mode === 'clear' ? 'Clear practice' : 'Full grooves'
  practiceDescription.textContent =
    mode === 'clear'
      ? 'Bass and ornaments are removed, and the main beats are strongly accented.'
      : 'The bass and musical variations are back. Listen for the same underlying grouping.'
  playButton.textContent = 'Play excerpt'
  setPracticePlaybackIdle()
  renderSession()
}

function showMode(mode: AppMode): void {
  renderer.stop()
  activeMode = mode
  learnView.hidden = mode !== 'learn'
  practiceView.hidden = mode === 'learn'

  for (const button of modeButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.mode === mode))
  }

  if (mode === 'learn') {
    lessonStatus.textContent = 'Choose either labeled example.'
    return
  }

  resetPractice(mode)
  playButton.focus()
}

for (const button of modeButtons) {
  button.addEventListener('click', () => showMode(button.dataset.mode as AppMode))
}

lessonSelect.addEventListener('change', () => {
  activeLessonId = lessonSelect.value as LessonId
  renderLesson()
  showMode('learn')
})

startClearButton.addEventListener('click', () => showMode('clear'))

playButton.addEventListener('click', async () => {
  playButton.disabled = true
  stopButton.disabled = false
  audioStatus.textContent = 'Playing excerpt…'

  try {
    await renderer.play(practiceScore(), () => {
      playButton.textContent = 'Replay excerpt'
      setPracticePlaybackIdle('Excerpt finished. Replay it as often as you need.')
    })
  } catch {
    setPracticePlaybackIdle('Audio could not start. Check your browser settings and try again.')
  }
})

stopButton.addEventListener('click', () => {
  renderer.stop()
  playButton.textContent = 'Replay excerpt'
  setPracticePlaybackIdle('Playback stopped.')
})

for (const button of answerButtons) {
  button.addEventListener('click', () => {
    session = selectMeter(session, button.dataset.meter as PracticeMeter)
    renderSession()
  })
}

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
    await renderer.play(createAccentedReplayScore(session.exercise.score), () => {
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
    await renderer.play(scoreForRecipe(currentRecipe()), () => {
      setPracticePlaybackIdle('Regenerated replay finished.')
    })
  } catch {
    setPracticePlaybackIdle('Audio could not start. Check your browser settings and try again.')
  }
})

nextButton.addEventListener('click', () => {
  renderer.stop()
  seedCounter += 1
  const nextExercise = createPracticeExercise(
    `practice-${seedCounter}-${Date.now()}`,
    session.exercise.score.patternFamily,
    Math.random,
    activeLesson().meters.map((details) => details.meter),
  )
  session = advanceExercise(session, nextExercise)
  playButton.textContent = 'Play excerpt'
  setPracticePlaybackIdle()
  renderSession()
  playButton.focus()
})

window.addEventListener('pagehide', () => void renderer.close())

renderLesson()
showMode('learn')
