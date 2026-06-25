import { describe, it, expect } from 'vitest'
import { heritages, getHeritage } from './heritage'

describe('heritage', () => {
  it('숭례문이 supported=true 이다', () => {
    const s = getHeritage('sungnyemun')
    expect(s.supported).toBe(true)
    expect(s.name.ko).toBe('숭례문')
  })
  it('최소 4개 이상의 문화유산이 있다', () => {
    expect(heritages.length).toBeGreaterThanOrEqual(4)
  })
  it('지도 핀에 lat/lng와 status가 있다', () => {
    heritages.forEach(h => {
      expect(typeof h.lat).toBe('number')
      expect(['available', 'soon']).toContain(h.status)
    })
  })
})
