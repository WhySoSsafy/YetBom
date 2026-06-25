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
