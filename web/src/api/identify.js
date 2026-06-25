import { USE_MOCK } from './client'

export async function identifyImage(_file) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 100))
    return {
      heritageId: 'sungnyemun',
      match: 96,
      ocrText: '숭례문 (崇禮門)\n국보 제1호\n서울특별시 중구 세종대로 40',
    }
  }
  // 실서버: /api/v1/images/score/url 로 후처리 예정
  return { heritageId: 'sungnyemun', match: 96, ocrText: '' }
}
