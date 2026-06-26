// 테스트(vitest)는 항상 mock — 네트워크 의존 제거. 그 외에는 VITE_USE_MOCK로 제어(기본 true).
export const USE_MOCK = import.meta.env.MODE === 'test'
  ? true
  : import.meta.env.VITE_USE_MOCK !== 'false'

export async function postJSON(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
