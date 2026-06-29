import { useEffect, useState } from 'react'
import { getCommentary } from './commentary'
import { tr } from './copy'
import { fetchWikiSummary } from '../api/wiki'
import { generateOverview } from '../api/chat'

// 선택한 문화유산의 설명/이미지/복원 전·후 정보를 모은다.
// 큐레이션이면 30초 요약, 동적이면 위키 요약(없으면 AI 생성).
export function useHeritageContent(h, lang) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!h) { setContent(null); setLoading(false); return }
    let on = true
    setLoading(true); setContent(null)

    const curated = getCommentary(h.id)
    if (curated) {
      const text = tr(curated.modes.find((m) => m.key === '30s')?.text, lang)
      setContent({
        text, image: h.thumb || h.image, curated: true, ai: false,
        before: h.before, after: h.after,
        beforeLabel: tr(h.beforeLabel, lang), afterLabel: tr(h.afterLabel, lang),
      })
      setLoading(false)
      return () => { on = false }
    }

    ;(async () => {
      const sum = await fetchWikiSummary(h.article, lang)
      let text = sum?.extract || ''
      let ai = false
      if (!text) { text = await generateOverview(typeof h.name === 'string' ? h.name : tr(h.name, lang), lang); ai = !!text }
      if (on) { setContent({ text, image: sum?.image || h.image || h.thumb, dynamic: true, ai, article: h.article }); setLoading(false) }
    })()
    return () => { on = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h?.id, lang])

  return { content, loading }
}
