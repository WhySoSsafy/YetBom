import { USE_MOCK, postJSON } from './client'

export async function requestTTS(text) {
  if (USE_MOCK) return null // mock 모드: 타이머 시뮬레이션 (컴포넌트가 처리)
  try {
    const data = await postJSON('/api/v1/generate-speech/', { text })
    return { audio_data: data.audio_data }
  } catch {
    return null
  }
}
