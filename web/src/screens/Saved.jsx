import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { copy } from '../data/copy'
import { heritages } from '../data/heritage'
import { HeritageCard } from '../components/HeritageCard'

export function Saved() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const saved = useAppStore((s) => s.saved)
  const t = copy[lang] || copy.en
  const list = heritages.filter((h) => saved[h.id])
  return (
    <div className="pt-16 px-content">
      <h1 className="text-[22px] font-bold">{t.savedTitle} · {list.length}</h1>
      {list.length === 0 ? (
        <p className="text-[14px] text-black/50 mt-8 text-center">
          {t.savedEmpty}
        </p>
      ) : (
        list.map((h) => <HeritageCard key={h.id} heritage={h} lang={lang} onClick={() => nav(`/detail/${h.id}`)} />)
      )}
    </div>
  )
}
