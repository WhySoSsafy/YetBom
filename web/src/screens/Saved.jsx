import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { useHeritages } from '../data/useHeritages'
import { HeritageCard } from '../components/HeritageCard'

export function Saved() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const saved = useAppStore((s) => s.saved)
  const t = copy[lang] || copy.en
  // 큐레이션 + 동적(위키) 전체에서 저장된 항목 필터 — 지도에서 저장한 문화재도 노출
  const { list: all } = useHeritages(lang)
  const list = all.filter((h) => saved[h.id])
  return (
    <div className="pt-16 px-content">
      <h1 className="text-[22px] font-bold">{t.savedTitle} · {list.length}</h1>
      {list.length === 0 ? (
        <p className="text-[14px] text-black/50 mt-8 text-center">
          {t.savedEmpty}
        </p>
      ) : (
        list.map((h, i) => <HeritageCard key={h.id} heritage={h} lang={lang} index={i} onClick={() => nav(`/detail/${h.id}`)} />)
      )}
    </div>
  )
}
