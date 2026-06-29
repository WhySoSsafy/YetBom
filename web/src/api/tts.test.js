import { describe, it, expect, vi, beforeEach } from 'vitest'

// 실제 백엔드 경로(USE_MOCK=false)를 흉내내어 캐시 동작을 검증한다.
const { postJSONSpy } = vi.hoisted(() => ({ postJSONSpy: vi.fn() }))
vi.mock('./client', () => ({ USE_MOCK: false, postJSON: postJSONSpy }))

import { requestTTS } from './tts'

describe('requestTTS 캐시', () => {
  beforeEach(() => postJSONSpy.mockReset())

  it('같은 텍스트는 두 번째부터 네트워크 없이 캐시로 반환한다', async () => {
    postJSONSpy.mockResolvedValue({ audio_data: 'QUFB' })
    const first = await requestTTS('캐시-검증-문장')
    const second = await requestTTS('캐시-검증-문장')
    expect(first.audio_data).toBe('QUFB')
    expect(second.audio_data).toBe('QUFB')
    expect(postJSONSpy).toHaveBeenCalledTimes(1) // 두 번째는 호출되지 않음
  })

  it('다른 텍스트는 각각 새로 생성한다', async () => {
    postJSONSpy.mockResolvedValue({ audio_data: 'BBB' })
    await requestTTS('서로-다른-문장-A')
    await requestTTS('서로-다른-문장-B')
    expect(postJSONSpy).toHaveBeenCalledTimes(2)
  })
})
