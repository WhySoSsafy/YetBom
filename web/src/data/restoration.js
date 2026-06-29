import { tr } from './copy'

// 흑백 + 세피아 + 낮은 대비 + 약한 블러로 '오래된 저화질 사진' 느낌
const GRAY = 'grayscale(1) sepia(0.5) contrast(0.82) brightness(0.92) blur(1.3px)'

// 복원 전·후 슬라이더 props 결정.
// - 진짜로 다른 옛 사진/복원 사진이 있으면 그대로 비교
// - 옛 사진이 없으면(같은 이미지/동적 항목) 흑백→컬러 데모로 대체
export function restorationView(h, image, t, lang) {
  const hasReal = h?.before && h?.after && h.before !== h.after
  if (hasReal) {
    return {
      beforeSrc: h.before, afterSrc: h.after, beforeFilter: undefined,
      beforeLabel: tr(h.beforeLabel, lang) || t.detailBefore,
      afterLabel: tr(h.afterLabel, lang) || t.detailAfter,
      note: t.detailAiEstimate,
    }
  }
  const src = image || h?.after || h?.before || h?.thumb
  return {
    beforeSrc: src, afterSrc: src, beforeFilter: GRAY,
    beforeLabel: t.demoBefore, afterLabel: t.demoAfter,
    note: t.demoNote,
  }
}
