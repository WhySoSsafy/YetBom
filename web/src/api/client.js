// 테스트(vitest)는 항상 mock — 네트워크 의존 제거. 그 외에는 VITE_USE_MOCK로 제어(기본 true).
export const USE_MOCK = import.meta.env.MODE === 'test'
  ? true
  : import.meta.env.VITE_USE_MOCK !== 'false'

// 프로덕션에선 백엔드를 직접 호출(VITE_API_BASE). 미설정 시 상대경로(로컬 dev 프록시).
const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function postJSON(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
