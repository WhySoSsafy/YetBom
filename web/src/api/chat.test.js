import { describe, it, expect } from 'vitest'
import { askAI } from './chat'

describe('askAI (mock)', () => {
  it('answer와 source를 반환한다', async () => {
    const res = await askAI('화재는 왜 났나요?', 'sungnyemun', 'ko')
    expect(res.answer.length).toBeGreaterThan(0)
    expect(res.source.length).toBeGreaterThan(0)
  })
})
