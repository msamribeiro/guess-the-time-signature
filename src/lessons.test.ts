import { describe, expect, it } from 'vitest'
import { practiceSetCopy } from './lessons'

describe('practice set copy', () => {
  it('preserves focused guidance for the established comparisons', () => {
    expect(practiceSetCopy(['3/4', '6/8']).title).toBe('Hear how six pulses can divide.')
    expect(practiceSetCopy(['2/4', '4/4']).title).toBe(
      'Hear where the larger cycle returns.',
    )
  })

  it('describes custom and four-meter practice sets', () => {
    expect(practiceSetCopy(['2/4', '6/8'])).toMatchObject({
      subtitle: '2/4 · 6/8',
      title: 'Learn the selected meters.',
    })
    expect(practiceSetCopy(['2/4', '3/4', '4/4', '6/8']).ambiguityNote).toContain(
      '2/4 or 4/4',
    )
  })
})
