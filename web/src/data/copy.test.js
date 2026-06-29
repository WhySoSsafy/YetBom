import { describe, it, expect } from 'vitest'
import { copy } from './copy'

describe('copy', () => {
  it('ko와 en이 동일한 최상위 키를 가진다', () => {
    expect(Object.keys(copy.ko).sort()).toEqual(Object.keys(copy.en).sort())
  })
  it('온보딩 타이틀이 한국어 카피를 가진다', () => {
    expect(copy.ko.onbTitle).toContain('옛봄')
  })
  it('영어 온보딩 타이틀이 존재한다', () => {
    expect(copy.en.onbTitle.length).toBeGreaterThan(0)
  })
})
