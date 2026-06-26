import { USE_MOCK, postJSON } from './client'

export async function identifyImage(image) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100))
    return {
      heritageId: 'sungnyemun',
      match: 96,
      ocrText: '숭례문 (崇禮門)\n국보 제1호\n서울특별시 중구 세종대로 40',
    }
  }
  try {
    const r = await postJSON('/api/v1/identify/', { image })
    return { heritageId: r.heritageId, match: r.match, ocrText: r.ocrText }
  } catch {
    return { heritageId: 'unsupported', match: 0, ocrText: '' }
  }
}
