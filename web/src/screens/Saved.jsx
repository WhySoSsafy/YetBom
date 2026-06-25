import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { heritages } from '../data/heritage'
import { HeritageCard } from '../components/HeritageCard'

export function Saved() {
  const nav = useNavigate()
  const lang = useAppStore((s) => s.lang)
  const saved = useAppStore((s) => s.saved)
  const list = heritages.filter((h) => saved[h.id])
  const title = lang === 'ko' ? '즐겨찾기' : 'Saved'
  return (
    <div className="pt-16 px-content">
      <h1 className="text-[22px] font-bold">{title} · {list.length}</h1>
      {list.length === 0 ? (
        <p className="text-[14px] text-black/50 mt-8 text-center">
          {lang === 'ko' ? '아직 저장한 문화유산이 없어요.' : 'No saved heritage yet.'}
        </p>
      ) : (
        list.map((h) => <HeritageCard key={h.id} heritage={h} lang={lang} onClick={() => nav(`/detail/${h.id}`)} />)
      )}
    </div>
  )
}
