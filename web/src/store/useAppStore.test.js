import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from './useAppStore'

describe('useAppStore', () => {
  beforeEach(() => useAppStore.getState().__reset())

  it('기본 언어는 ko', () => {
    expect(useAppStore.getState().lang).toBe('ko')
  })
  it('toggleSaved가 저장 상태를 토글한다', () => {
    useAppStore.getState().toggleSaved('sungnyemun')
    expect(useAppStore.getState().saved.sungnyemun).toBe(true)
    useAppStore.getState().toggleSaved('sungnyemun')
    expect(useAppStore.getState().saved.sungnyemun).toBeUndefined()
  })
  it('setSlider가 surface별로 독립적이다', () => {
    useAppStore.getState().setSlider('m', 30)
    useAppStore.getState().setSlider('w', 70)
    expect(useAppStore.getState().mSliderPos).toBe(30)
    expect(useAppStore.getState().wSliderPos).toBe(70)
  })
  it('setPick은 첫 선택만 고정한다', () => {
    useAppStore.getState().setPick('m', 0, 2)
    useAppStore.getState().setPick('m', 0, 1)
    expect(useAppStore.getState().mPick[0]).toBe(2)
  })
})
