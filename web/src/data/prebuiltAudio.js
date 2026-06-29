// 미리 생성해둔 맞춤해설 음성(한국어 30초 요약만). 기다림 없이 즉시 재생.
const FILES = {
  'sungnyemun:30s:ko': '/audio/sungnyemun_30s_ko.mp3',
  'gyeongbok:30s:ko': '/audio/gyeongbok_30s_ko.mp3',
  'cheomseongdae:30s:ko': '/audio/cheomseongdae_30s_ko.mp3',
  'mireuksa:30s:ko': '/audio/mireuksa_30s_ko.mp3',
}

export const prebuiltAudio = (id, mode, lang) => FILES[`${id}:${mode}:${lang}`] || null
