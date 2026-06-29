import { USE_MOCK, postJSON } from './client'

// 텍스트 → base64 오디오 캐시. 같은 해설을 다시 들을 때 OpenAI 재호출(리소스 낭비) 방지.
const cache = new Map()

export async function requestTTS(text) {
  if (USE_MOCK) return null // mock 모드: 타이머 시뮬레이션 (컴포넌트가 처리)
  if (cache.has(text)) return { audio_data: cache.get(text) } // 캐시 적중 → 네트워크 생략
  try {
    const data = await postJSON('/api/v1/generate-speech/', { text })
    if (data?.audio_data) cache.set(text, data.audio_data)
    return { audio_data: data.audio_data }
  } catch {
    return null
  }
}
