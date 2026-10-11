type Theme = 'latte' | 'mocha'

export function initializeThemeToggle(): void {
  const root = document.documentElement
  const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]'))
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
  let manuallySelected = false

  function applyTheme(theme: Theme): void {
    root.dataset.theme = theme
    themeMeta?.setAttribute('content', theme === 'mocha' ? '#11111b' : '#eff1f5')
    const label = theme === 'mocha' ? 'Switch to light theme' : 'Switch to dark theme'
    for (const button of buttons) {
      button.setAttribute('aria-checked', String(theme === 'mocha'))
      button.setAttribute('aria-label', label)
      button.title = label
    }
  }

  applyTheme(colorScheme.matches ? 'mocha' : 'latte')

  for (const button of buttons) {
    button.addEventListener('click', () => {
      manuallySelected = true
      applyTheme(root.dataset.theme === 'mocha' ? 'latte' : 'mocha')
    })
  }

  colorScheme.addEventListener('change', (event) => {
    if (!manuallySelected) applyTheme(event.matches ? 'mocha' : 'latte')
  })
}
