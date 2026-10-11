import './styles.css'
import './audioLab.css'
import {
  BEGINNER_PATTERN_DEFINITIONS,
  createGenerationRecipe,
  generateRhythm,
  normalizeGenerationRecipe,
  renderRecipeScore,
  scoreDurationSeconds,
  serializeGenerationRecipe,
  SUPPORTED_METERS,
  WebAudioRenderer,
} from './audio'
import type {
  GenerationRecipe,
  PatternFamily,
  PlaybackTransform,
  SupportedMeter,
} from './audio'
import { initializeThemeToggle } from './theme'

initializeThemeToggle()

function requireElement<ElementType extends Element>(selector: string): ElementType {
  const element = document.querySelector<ElementType>(selector)
  if (!element) throw new Error(`Required element not found: ${selector}`)
  return element
}

const form = requireElement<HTMLFormElement>('#recipe-form')
const meterSelect = requireElement<HTMLSelectElement>('#meter')
const patternSelect = requireElement<HTMLSelectElement>('#pattern-family')
const tempoInput = requireElement<HTMLInputElement>('#tempo')
const barsInput = requireElement<HTMLInputElement>('#bars')
const seedInput = requireElement<HTMLInputElement>('#seed')
const playbackSelect = requireElement<HTMLSelectElement>('#playback')
const randomizeSeedButton = requireElement<HTMLButtonElement>('#randomize-seed')
const stopButton = requireElement<HTMLButtonElement>('#stop-lab-audio')
const labStatus = requireElement<HTMLParagraphElement>('#lab-status')
const durationOutput = requireElement<HTMLElement>('#derived-duration')
const eventsOutput = requireElement<HTMLElement>('#derived-events')
const groupingOutput = requireElement<HTMLElement>('#derived-grouping')
const beatUnitOutput = requireElement<HTMLElement>('#derived-beat-unit')
const recipeJson = requireElement<HTMLTextAreaElement>('#recipe-json')
const loadJsonButton = requireElement<HTMLButtonElement>('#load-json')
const copyJsonButton = requireElement<HTMLButtonElement>('#copy-json')
const jsonStatus = requireElement<HTMLParagraphElement>('#json-status')

const renderer = new WebAudioRenderer()

function definitionsForMeter(meter: SupportedMeter) {
  return BEGINNER_PATTERN_DEFINITIONS.filter((definition) => definition.meter === meter)
}

function selectedDefinition() {
  return BEGINNER_PATTERN_DEFINITIONS.find(
    (definition) =>
      definition.meter === meterSelect.value &&
      definition.patternFamily === patternSelect.value,
  )
}

function randomSeed(): string {
  const suffix = crypto.randomUUID?.().slice(0, 8) ?? Date.now().toString(36)
  return `lab-${suffix}`
}

function populateMeters(): void {
  for (const meter of SUPPORTED_METERS) {
    const option = document.createElement('option')
    option.value = meter
    option.textContent = meter
    meterSelect.append(option)
  }
}

function populatePatterns(resetDefaults: boolean): void {
  const meter = meterSelect.value as SupportedMeter
  const definitions = definitionsForMeter(meter)
  patternSelect.replaceChildren()

  for (const definition of definitions) {
    const option = document.createElement('option')
    option.value = definition.patternFamily
    option.textContent = `${definition.title} (${definition.patternFamily})`
    patternSelect.append(option)
  }

  if (resetDefaults && definitions[0]) {
    tempoInput.value = String(definitions[0].tempoBpm)
    barsInput.value = String(definitions[0].bars)
  }
}

function applyPatternDefaults(): void {
  const definition = selectedDefinition()
  if (!definition) return
  tempoInput.value = String(definition.tempoBpm)
  barsInput.value = String(definition.bars)
}

function recipeFromForm(): GenerationRecipe {
  if (!form.checkValidity()) throw new Error('Correct the highlighted fields first.')

  const score = generateRhythm({
    meter: meterSelect.value as SupportedMeter,
    patternFamily: patternSelect.value as PatternFamily,
    seed: seedInput.value.trim(),
    tempoBpm: tempoInput.valueAsNumber,
    bars: barsInput.valueAsNumber,
  })

  return createGenerationRecipe(score, playbackSelect.value as PlaybackTransform)
}

function showRecipe(recipe: GenerationRecipe): void {
  const renderedScore = renderRecipeScore(recipe)
  recipeJson.value = serializeGenerationRecipe(recipe)
  durationOutput.textContent = `${scoreDurationSeconds(renderedScore).toFixed(2)} seconds`
  eventsOutput.textContent = String(renderedScore.events.length)
  groupingOutput.textContent = recipe.grouping
  beatUnitOutput.textContent = recipe.tempoBeatUnit.replace('-', ' ')
}

function updateRecipePreview(): void {
  try {
    showRecipe(recipeFromForm())
    jsonStatus.textContent = ''
  } catch (error) {
    jsonStatus.textContent = error instanceof Error ? error.message : 'Invalid recipe.'
  }
}

function applyRecipeToForm(recipe: GenerationRecipe): void {
  meterSelect.value = recipe.meter
  populatePatterns(false)
  patternSelect.value = recipe.patternFamily
  if (!patternSelect.value) throw new RangeError('Pattern family does not match the meter.')
  tempoInput.value = String(recipe.tempoBpm)
  barsInput.value = String(recipe.bars)
  seedInput.value = recipe.seed
  playbackSelect.value = recipe.playbackTransform
  showRecipe(recipe)
}

meterSelect.addEventListener('change', () => {
  populatePatterns(true)
  updateRecipePreview()
})
patternSelect.addEventListener('change', () => {
  applyPatternDefaults()
  updateRecipePreview()
})
for (const input of [tempoInput, barsInput, seedInput, playbackSelect]) {
  input.addEventListener('input', updateRecipePreview)
}

randomizeSeedButton.addEventListener('click', () => {
  seedInput.value = randomSeed()
  updateRecipePreview()
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!form.reportValidity()) return
  try {
    const recipe = recipeFromForm()
    const score = renderRecipeScore(recipe)
    showRecipe(recipe)
    stopButton.disabled = false
    labStatus.textContent = 'Playing generated exercise…'
    await renderer.play(score, () => {
      stopButton.disabled = true
      labStatus.textContent = 'Playback finished.'
    })
  } catch (error) {
    labStatus.textContent = error instanceof Error ? error.message : 'Could not generate audio.'
  }
})

stopButton.addEventListener('click', () => {
  renderer.stop()
  stopButton.disabled = true
  labStatus.textContent = 'Playback stopped.'
})

loadJsonButton.addEventListener('click', () => {
  try {
    const recipe = normalizeGenerationRecipe(JSON.parse(recipeJson.value))
    applyRecipeToForm(recipe)
    jsonStatus.textContent = 'Recipe loaded and normalized.'
  } catch (error) {
    jsonStatus.textContent = error instanceof Error ? error.message : 'Could not load recipe.'
  }
})

copyJsonButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(recipeJson.value)
    jsonStatus.textContent = 'Recipe copied.'
  } catch {
    recipeJson.select()
    jsonStatus.textContent = 'Clipboard access was unavailable. The recipe is selected for copying.'
  }
})

window.addEventListener('pagehide', () => void renderer.close())

populateMeters()
meterSelect.value = '3/4'
populatePatterns(true)
seedInput.value = randomSeed()
updateRecipePreview()
