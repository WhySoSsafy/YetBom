import { USE_MOCK, postJSON } from './client'

const MOCK = {
  ko: '2008년 2월, 한 시민의 방화로 화재가 발생했습니다. 이후 약 5년에 걸쳐 전통 기법으로 복원되었습니다.',
  en: 'In Feb 2008, arson caused the fire. Restoration with traditional methods took about 5 years.',
}
const SOURCE = { ko: '출처 · 문화재청 국가유산포털', en: 'Source · Cultural Heritage Administration' }

export async function askAI(question, heritageId, lang) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400))
    return { answer: MOCK[lang] || MOCK.ko, source: SOURCE[lang] || SOURCE.ko }
  }
  const messages = [{ role: 'user', content: `${heritageId}: ${question}` }]
  const data = await postJSON('/api/v1/chat/completions/', { messages })
  return { answer: data.content, source: SOURCE[lang] || SOURCE.ko }
}

// 위키 요약이 없는 동적 항목용 — AI 도슨트가 선택 언어로 짧은 소개를 생성한다.
const OVERVIEW_Q = {
  ko: (n) => `한국 문화유산 "${n}"을(를) 일반 관람객이 이해하기 쉽게 4~5문장으로 소개해 주세요. 위치·시대·의미를 포함해 주세요.`,
  en: (n) => `Introduce the Korean cultural heritage "${n}" in 4-5 easy English sentences, including its location, era, and significance.`,
  ja: (n) => `韓国の文化遺産「${n}」を一般の観覧者向けに4〜5文の日本語で、場所・時代・意義を含めて紹介してください。`,
  zh: (n) => `请用中文以4-5个通俗易懂的句子介绍韩国文化遗产「${n}」，包含其位置、年代和意义。`,
  es: (n) => `Presenta el patrimonio cultural coreano "${n}" en 4-5 frases sencillas en español, incluyendo su ubicación, época e importancia.`,
}
const overviewCache = new Map() // `${lang}:${name}` → Promise<string>
export function generateOverview(name, lang) {
  if (USE_MOCK || !name) return Promise.resolve('')
  const key = `${lang}:${name}`
  if (overviewCache.has(key)) return overviewCache.get(key)
  const p = (async () => {
    const q = (OVERVIEW_Q[lang] || OVERVIEW_Q.en)(name)
    const data = await postJSON('/api/v1/chat/completions/', { messages: [{ role: 'user', content: q }] })
    return data.content || ''
  })()
  overviewCache.set(key, p)
  return p.catch(() => { overviewCache.delete(key); return '' })
}
